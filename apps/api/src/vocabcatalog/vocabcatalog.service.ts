import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { GetVocabCatalogRequestDto } from "~/dto";
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
	}: GetVocabCatalogRequestDto): Promise<VocabCatalogEntity[]> {
		console.log("Finding all vocab catalogs with query:", {
			where: {
				...query,
			},
			skip: Number(offset ?? 0),
			take: Number(limit ?? 10),
		});
		return this.vocabCatalogRepository.find({
			where: {
				...query,
			},
			skip: Number(offset ?? 0),
			take: Number(limit ?? 10),
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
