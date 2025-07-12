import { Inject, Injectable } from "@nestjs/common";
import { GetVocabCatalogRequest } from "@repo/types";
import { Repository } from "typeorm";
import { VOCABCATALOG_REPOSITORY } from "../constants/database.constants";
import { VocabCatalogEntity } from "./vocabcatalog.entity";

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
	}: GetVocabCatalogRequest): Promise<VocabCatalogEntity[]> {
		return this.vocabCatalogRepository.find({
			where: {
				...query,
			},
			skip: offset,
			take: limit,
		});
	}

	async findOne(
		id: VocabCatalogEntity["id"],
	): Promise<VocabCatalogEntity | null> {
		return this.vocabCatalogRepository.findOneBy({ id });
	}

	async create(
		catalog: Omit<VocabCatalogEntity, "id">,
	): Promise<VocabCatalogEntity> {
		const newCatalog = this.vocabCatalogRepository.create(catalog);
		return this.vocabCatalogRepository.save(newCatalog);
	}

	async update(
		catalog: Partial<VocabCatalogEntity>,
	): Promise<VocabCatalogEntity | null> {
		await this.vocabCatalogRepository.update({ id: catalog.id }, catalog);
		return this.findOne(catalog.id);
	}

	async remove(id: VocabCatalogEntity["id"]): Promise<void> {
		await this.vocabCatalogRepository.delete({ id });
	}
}
