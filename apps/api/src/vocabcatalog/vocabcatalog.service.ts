import { Inject, Injectable } from "@nestjs/common";
import type { Language } from "@repo/types";
import type { Repository } from "typeorm";
import type { GetVocabCatalogRequestDto } from "~/dto";
import { VOCABCATALOG_REPOSITORY } from "../constants/database.constants";
import type { VocabCatalogEntity } from "./vocabcatalog.entity";

@Injectable()
export class VocabCatalogService {
	constructor(
		@Inject(VOCABCATALOG_REPOSITORY)
		private vocabCatalogRepository: Repository<VocabCatalogEntity>,
	) {}

	async findAll({
		limit,
		offset,
		...query
	}: GetVocabCatalogRequestDto): Promise<VocabCatalogEntity[]> {
		const where: Record<string, unknown> = {};

		for (const [key, value] of Object.entries(query)) {
			if (value !== undefined && value !== null && value !== "") {
				where[key] = value;
			}
		}

		return this.vocabCatalogRepository.find({
			where,
			skip: Number(offset ?? 0),
			take: Number(limit ?? 10),
		});
	}

	async findAllAndCreateIfNotExist(
		titles: VocabCatalogEntity["title"][],
		language: Language,
	): Promise<VocabCatalogEntity[]> {
		const existingCatalogs = await this.vocabCatalogRepository.find({
			where: titles.map((title) => ({ title })),
		});

		const existingTitles = new Set(existingCatalogs.map((c) => c.title));
		const newTitles = titles.filter((title) => !existingTitles.has(title));

		const newCatalogs = this.vocabCatalogRepository.create(
			newTitles.map((title) => ({ title, owner: 1, language })), // Replace `en` with the actual language as needed
		);

		if (newCatalogs.length > 0) {
			await this.vocabCatalogRepository.save(newCatalogs);
		}

		return [...existingCatalogs, ...newCatalogs];
	}

	async findOne(
		id: VocabCatalogEntity["id"],
	): Promise<VocabCatalogEntity | null> {
		return this.vocabCatalogRepository.findOneBy({ id });
	}

	async create(
		catalog: Omit<VocabCatalogEntity, "id" | "created_at">,
	): Promise<VocabCatalogEntity> {
		const newCatalog = this.vocabCatalogRepository.create(catalog);
		return this.vocabCatalogRepository.save(newCatalog);
	}

	async update({
		id,
		...restFields
	}: Partial<VocabCatalogEntity>): Promise<VocabCatalogEntity | null> {
		await this.vocabCatalogRepository.update({ id }, restFields);
		return this.findOne(id);
	}

	async remove(id: VocabCatalogEntity["id"]): Promise<void> {
		await this.vocabCatalogRepository.delete({ id });
	}
}
