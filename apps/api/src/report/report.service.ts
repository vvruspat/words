import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type {
	ApiPaginationRequest,
	Report,
	ReportStatus,
} from "@vvruspat/words-types";
import { QueryFailedError, type Repository } from "typeorm";
import { REPORT_REPOSITORY } from "../constants/database.constants";
import type { ReportEntity } from "./report.entity";

@Injectable()
export class ReportService {
	constructor(
		@Inject(REPORT_REPOSITORY)
		private reportRepository: Repository<ReportEntity>,
	) {}

	async findAll(
		query: Partial<Report> & ApiPaginationRequest,
	): Promise<[ReportEntity[], number]> {
		const { limit, offset, ...rest } = query;
		const where: Record<string, unknown> = {};

		for (const [key, value] of Object.entries(rest)) {
			if (value !== undefined && value !== null && value !== "") {
				where[key] = value;
			}
		}

		return this.reportRepository.findAndCount({
			where,
			relations: { wordData: true },
			take: limit || 10,
			skip: offset || 0,
			order: { created_at: "DESC" },
		});
	}

	async findStats(): Promise<{
		new: number;
		reviewed: number;
		resolved: number;
		total: number;
	}> {
		const [newCount, reviewedCount, resolvedCount, total] = await Promise.all([
			this.reportRepository.count({ where: { status: "new" } }),
			this.reportRepository.count({ where: { status: "reviewed" } }),
			this.reportRepository.count({ where: { status: "resolved" } }),
			this.reportRepository.count(),
		]);
		return {
			new: newCount,
			reviewed: reviewedCount,
			resolved: resolvedCount,
			total,
		};
	}

	async create(
		report: Pick<Report, "word" | "type" | "description">,
	): Promise<ReportEntity> {
		const newReport = this.reportRepository.create(report);
		try {
			return await this.reportRepository.save(newReport);
		} catch (error) {
			if (error instanceof QueryFailedError) {
				const { code, constraint } = error.driverError as {
					code?: string;
					constraint?: string;
				};
				// The word may have been deleted since the client's last sync.
				// Handle the FK failure at save time so concurrent deletions are covered.
				const isMissingWord =
					code === "23503" &&
					this.reportRepository.metadata.foreignKeys.some(
						(foreignKey) =>
							foreignKey.name === constraint &&
							foreignKey.columns.length === 1 &&
							foreignKey.columns[0].propertyName === "word",
					);
				if (isMissingWord) {
					throw new NotFoundException("Word not found");
				}
			}
			throw error;
		}
	}

	async update(id: number, status: ReportStatus): Promise<ReportEntity | null> {
		await this.reportRepository.update({ id }, { status });
		return this.reportRepository.findOneBy({ id });
	}

	async remove(id: number): Promise<void> {
		await this.reportRepository.delete({ id });
	}
}
