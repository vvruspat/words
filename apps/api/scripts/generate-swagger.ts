import { writeFileSync } from "node:fs";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as yaml from "js-yaml";
import { AppModule } from "../src/app.module";

async function generateSwagger() {
	// Skip database and Redis connections during Swagger generation
	// Swagger only needs type metadata from decorators, not actual connections
	process.env.SKIP_DB_CONNECTION = "true";
	process.env.SKIP_REDIS_CONNECTION = "true";

	const app = await NestFactory.create(AppModule, { logger: false });

	const config = new DocumentBuilder()
		.setTitle("My API")
		.setDescription("API description")
		.setVersion("1.0")
		.build();

	const document = SwaggerModule.createDocument(app, config);

	// Write JSON
	writeFileSync("openapi.json", JSON.stringify(document, null, 2));
	console.log("✅ Generated openapi.json");

	// Write YAML
	writeFileSync("openapi.yaml", yaml.dump(document));
	console.log("✅ Generated openapi.yaml");

	await app.close();
	process.exit(0);
}

generateSwagger().catch((err) => {
	console.error("\n❌ Error generating Swagger documentation:\n");
	console.error(err);
	if (err instanceof Error) {
		if (err.message.includes("ECONNREFUSED") || err.message.includes("Redis")) {
			console.error(
				"\n💡 Tip: Make sure Redis is running on the configured port (default: 6379)",
			);
			console.error(
				"   You can start Redis with: redis-server or docker-compose up redis",
			);
		}
		console.error("\nStack trace:", err.stack);
	}
	process.stderr.write(err?.toString() || String(err));
	process.exit(1);
});
