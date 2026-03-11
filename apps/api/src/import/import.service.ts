import { Injectable, Logger } from "@nestjs/common";
import type { Language } from "@vvruspat/words-types";
import type {
	PostImportTopicsRequestDto,
	PostImportTopicsResponseDto,
} from "../dto";
import { TopicService } from "../topic/topic.service";
import { TopicTranslationService } from "../topictranslation/topictranslation.service";
import { VocabCatalogService } from "../vocabcatalog/vocabcatalog.service";
import { WordService } from "../word/word.service";

@Injectable()
export class ImportService {
	private readonly logger = new Logger(ImportService.name);

	constructor(
		private readonly topicService: TopicService,
		private readonly topicTranslationService: TopicTranslationService,
		private readonly vocabCatalogService: VocabCatalogService,
		private readonly wordService: WordService,
	) {}

	async importTopics(
		dto: PostImportTopicsRequestDto,
	): Promise<PostImportTopicsResponseDto> {
		const { language, topics } = dto;

		// Extract unique topic titles
		const topicTitles = [
			...new Set(topics.map((item) => item.topic as string)),
		];

		// Extract unique level names (all keys except "topic")
		const levelNames = [
			...new Set(
				topics.flatMap((item) =>
					Object.keys(item).filter((key) => key !== "topic"),
				),
			),
		];

		this.logger.log(
			`Importing ${topicTitles.length} topics for language "${language}" with levels: ${levelNames.join(", ")}`,
		);

		// Batch find-or-create topics
		const existingTopicsBefore = await this.topicService.findAll({
			language: language as Language,
		});
		const existingTitlesBefore = new Set(
			existingTopicsBefore.map((t) => t.title),
		);

		const allTopicEntities = await this.topicService.findAllAndCreateIfNotExist(
			topicTitles,
			language as Language,
		);

		const newTopicEntities = allTopicEntities.filter(
			(t) => !existingTitlesBefore.has(t.title),
		);
		const topicsCreated = newTopicEntities.length;
		const topicsFound = allTopicEntities.length - topicsCreated;

		// Trigger translation for newly created topics
		if (newTopicEntities.length > 0) {
			this.logger.log(
				`Triggering translation for ${newTopicEntities.length} new topics`,
			);
			await this.topicTranslationService.makeTranslations(newTopicEntities);
		}

		// Batch find-or-create catalogs for each level
		const catalogEntities =
			await this.vocabCatalogService.findAllAndCreateIfNotExist(
				levelNames,
				language as Language,
			);

		// Build lookup maps
		const topicMap = new Map(allTopicEntities.map((t) => [t.title, t]));
		const catalogMap = new Map(catalogEntities.map((c) => [c.title, c]));

		// Queue word generation for each topic/level pair with count > 0
		let jobsQueued = 0;
		for (const item of topics) {
			const topicTitle = item.topic as string;
			const topicEntity = topicMap.get(topicTitle);
			if (!topicEntity) {
				this.logger.warn(`Topic entity not found for title: ${topicTitle}`);
				continue;
			}

			for (const [levelName, count] of Object.entries(item)) {
				if (levelName === "topic") continue;
				const wordCount = Number(count);
				if (!wordCount || wordCount <= 0) continue;

				const catalogEntity = catalogMap.get(levelName);
				if (!catalogEntity) {
					this.logger.warn(`Catalog entity not found for level: ${levelName}`);
					continue;
				}

				this.logger.log(
					`Queuing ${wordCount} words for topic "${topicTitle}" / level "${levelName}"`,
				);
				await this.wordService.generateWords(
					language as Language,
					topicEntity.id,
					catalogEntity.id,
					wordCount,
				);
				jobsQueued++;
			}
		}

		this.logger.log(
			`Import complete: ${topicsCreated} created, ${topicsFound} found, ${jobsQueued} jobs queued`,
		);

		return { topicsCreated, topicsFound, jobsQueued };
	}
}
