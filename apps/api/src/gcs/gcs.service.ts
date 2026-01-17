import { Storage } from "@google-cloud/storage";
import { Injectable, Logger } from "@nestjs/common";
import { type Language } from "@repo/types";

@Injectable()
export class GcsService {
	private storage = new Storage();

	private readonly logger = new Logger(GcsService.name);

	async uploadMp3FromBase64(
		language: Language,
		base64: string,
		fileName: string,
	): Promise<string> {
		try {
			// Decode base64 string to a buffer
			const buffer = Buffer.from(base64, "base64");

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
