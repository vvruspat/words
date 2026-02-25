import { Module } from "@nestjs/common";
import { DatabaseModule } from "~/database/database.module";
import { ReportController } from "./report.controller";
import { reportProviders } from "./report.providers";
import { ReportService } from "./report.service";

@Module({
	imports: [DatabaseModule],
	providers: [...reportProviders, ReportService],
	controllers: [ReportController],
	exports: [ReportService],
})
export class ReportModule {}
