import { writeFileSync } from "node:fs";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as yaml from "js-yaml";
import { AppModule } from "../src/app.module";

async function generateSwagger() {
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
}

generateSwagger().catch((err) => {
	console.error(err);
	process.exit(1);
});
