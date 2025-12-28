import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Enable CORS for cross-origin requests (needed for SSE and API calls from Next.js)
	const allowedOrigins = process.env.ALLOWED_ORIGINS
		? process.env.ALLOWED_ORIGINS.split(",")
		: [
				"http://localhost:3001",
				"http://localhost:3000",
				"https://dev-control.whitesquirrel.digital",
				/^https?:\/\/.*\.whitesquirrel\.digital$/,
			];

	app.enableCors({
		origin: allowedOrigins,
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
		// Important for SSE: allow streaming responses
		exposedHeaders: ["Content-Type", "Cache-Control", "Connection"],
	});

	const config = new DocumentBuilder()
		.setTitle("Words API")
		.setDescription("API documentation for Words project")
		.setVersion("1.0")
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("/docs", app, document);

	const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
	await app.listen(port);
	console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
