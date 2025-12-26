import { Storage } from "@google-cloud/storage";
import { Injectable, Logger } from "@nestjs/common";

const credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_JSON || "{}");

if (credentials.private_key) {
	credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
}

@Injectable()
export class GcsService {
	private storage = new Storage({
		projectId: credentials.project_id,
		credentials,
	});

	private readonly logger = new Logger(GcsService.name);

	async uploadMp3FromBase64(base64: string, fileName: string): Promise<string> {
		try {
			// Decode base64 string to a buffer
			const buffer = Buffer.from(base64, "base64");

			this.logger.log(
				`Uploading MP3 to GCS: ${fileName}, size: ${buffer.length} bytes`,
			);

			// Get a reference to the bucket and file
			const bucket = this.storage.bucket(process.env.GCS_BUCKET_NAME);
			const file = bucket.file(fileName);

			this.logger.log(
				`Uploading file to bucket: ${process.env.GCS_BUCKET_NAME}`,
			);

			// Upload the buffer to GCS
			await file.save(buffer, {
				metadata: {
					contentType: "audio/mpeg",
				},
			});

			this.logger.log(`File uploaded successfully: ${fileName}`);

			// Return the public URL of the uploaded file
			return `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${fileName}`;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to upload MP3: ${error.message}`);
			}

			throw new Error(`Failed to upload MP3: ${error}`);
		}
	}
}
