import { readFileSync } from "node:fs";
import { Storage } from "@google-cloud/storage";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { type Language } from "@repo/types";

@Injectable()
export class GcsService implements OnModuleInit {
	private storage: Storage;
	private readonly logger = new Logger(GcsService.name);

	constructor() {
		// Initialize Storage with proper credential handling
		const storageOptions: ConstructorParameters<typeof Storage>[0] = {};

		// Try to load credentials from environment or default location
		if (process.env.GCP_SERVICE_ACCOUNT_JSON) {
			try {
				const serviceAccountJson =
					typeof process.env.GCP_SERVICE_ACCOUNT_JSON === "string"
						? JSON.parse(process.env.GCP_SERVICE_ACCOUNT_JSON)
						: process.env.GCP_SERVICE_ACCOUNT_JSON;

				// Fix private key newlines if they're corrupted (replace literal \n with actual newlines)
				if (serviceAccountJson.private_key) {
					serviceAccountJson.private_key =
						serviceAccountJson.private_key.replace(/\\n/g, "\n");
				}

				storageOptions.credentials = serviceAccountJson;
				storageOptions.projectId = serviceAccountJson.project_id;
			} catch (error) {
				this.logger.error(
					`Failed to parse GCP_SERVICE_ACCOUNT_JSON: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
		} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
			// Use explicit path if provided
			// If the file has corrupted newlines, we need to read and fix it
			try {
				const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
				const credsContent = readFileSync(credsPath, "utf8");
				const serviceAccountJson = JSON.parse(credsContent);

				// Fix private key newlines if they're corrupted
				if (serviceAccountJson.private_key) {
					serviceAccountJson.private_key =
						serviceAccountJson.private_key.replace(/\\n/g, "\n");
				}

				storageOptions.credentials = serviceAccountJson;
				storageOptions.projectId = serviceAccountJson.project_id;
			} catch (error) {
				this.logger.warn(
					`Failed to read/fix credentials file, using default: ${error instanceof Error ? error.message : String(error)}`,
				);
				// Fall back to letting Storage SDK handle it
				storageOptions.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
			}
		}

		this.storage = new Storage(storageOptions);
	}

	async onModuleInit() {
		// Validate credentials on startup (optional - can be disabled for faster startup)
		if (process.env.VALIDATE_GCS_CREDENTIALS_ON_STARTUP === "true") {
			this.logger.log("Validating GCS credentials on startup...");
			const isValid = await this.validateCredentials();
			if (!isValid) {
				this.logger.warn(
					"GCS credentials validation failed. Uploads may fail. Set VALIDATE_GCS_CREDENTIALS_ON_STARTUP=false to skip this check.",
				);
			}
		}
	}

	/**
	 * Test and validate GCS credentials
	 * @returns Promise<boolean> - true if credentials are valid, false otherwise
	 */
	async validateCredentials(): Promise<boolean> {
		try {
			const bucketName = process.env.GCS_BUCKET_NAME;
			if (!bucketName) {
				this.logger.error("GCS_BUCKET_NAME environment variable is not set");
				return false;
			}

			// Try to get bucket metadata - this will fail if credentials are invalid
			const bucket = this.storage.bucket(bucketName);
			const [exists] = await bucket.exists();

			if (!exists) {
				this.logger.error(`Bucket ${bucketName} does not exist`);
				return false;
			}

			// Try to get bucket metadata to verify permissions
			await bucket.getMetadata();

			this.logger.log("GCS credentials are valid and bucket is accessible");
			return true;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			this.logger.error(`GCS credentials validation failed: ${errorMessage}`);

			// Check for specific error types
			if (errorMessage.includes("401") || errorMessage.includes("403")) {
				this.logger.error(
					"Authentication failed - credentials may be invalid, expired, or disabled",
				);
			} else if (
				errorMessage.includes("1E08010C") ||
				errorMessage.includes("DECODER")
			) {
				this.logger.error(
					"Private key format error - check that newlines are properly formatted",
				);
			}

			return false;
		}
	}

	async uploadMp3FromBase64(
		language: Language,
		base64: string,
		fileName: string,
	): Promise<string> {
		try {
			// Clean base64 string: remove data URL prefix if present, trim whitespace
			let cleanedBase64 = base64.trim();

			// Remove data URL prefix if present (e.g., "data:audio/mpeg;base64,...")
			if (cleanedBase64.includes(",")) {
				cleanedBase64 = cleanedBase64.split(",")[1] || cleanedBase64;
			}

			// Remove any whitespace/newlines that might interfere with decoding
			cleanedBase64 = cleanedBase64.replace(/\s/g, "");

			if (!cleanedBase64) {
				throw new Error("Empty base64 string provided");
			}

			// Validate base64 format (only valid base64 characters: A-Z, a-z, 0-9, +, /, =)
			const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
			if (!base64Regex.test(cleanedBase64)) {
				this.logger.warn(
					`Base64 string contains invalid characters. Length: ${cleanedBase64.length}, first 100 chars: ${cleanedBase64.substring(0, 100)}`,
				);
				// Try to filter out invalid characters (keep only valid base64 chars)
				cleanedBase64 = cleanedBase64.replace(/[^A-Za-z0-9+/=]/g, "");
			}

			// Decode base64 string to a buffer
			let buffer: Buffer;
			try {
				buffer = Buffer.from(cleanedBase64, "base64");
			} catch (decodeError) {
				const errorMessage =
					decodeError instanceof Error
						? decodeError.message
						: String(decodeError);
				throw new Error(
					`Failed to decode base64 string: ${errorMessage}. Base64 length: ${cleanedBase64.length}, first 100 chars: ${cleanedBase64.substring(0, 100)}`,
				);
			}

			// Validate buffer was created successfully
			if (!buffer || buffer.length === 0) {
				throw new Error("Decoded buffer is empty or invalid");
			}

			// Organize files by language folder
			const filePath = `${language}/${fileName}`;

			this.logger.log(
				`Uploading MP3 to GCS: ${filePath}, size: ${buffer.length} bytes`,
			);

			// Get a reference to the bucket and file
			const bucket = this.storage.bucket(process.env.GCS_BUCKET_NAME);
			const file = bucket.file(filePath);

			this.logger.log(
				`Uploading file to bucket: ${process.env.GCS_BUCKET_NAME}`,
			);

			// Upload the buffer to GCS
			await file.save(buffer, {
				metadata: {
					contentType: "audio/mpeg",
				},
			});

			this.logger.log(`File uploaded successfully: ${filePath}`);

			// Return the public URL of the uploaded file
			return `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${filePath}`;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to upload MP3: ${error.message}`);
			}

			this.logger.error(`Failed to upload MP3: ${error}`);
		}
	}
}
