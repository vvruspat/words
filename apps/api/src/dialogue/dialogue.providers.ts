import type { DataSource } from "typeorm";
import {
	DATA_SOURCE,
	DIALOGUE_CORRECTION_REPOSITORY,
	DIALOGUE_MESSAGE_REPOSITORY,
	DIALOGUE_SESSION_REPOSITORY,
	DIALOGUE_THREAD_REPOSITORY,
	DIALOGUE_WORD_EVENT_REPOSITORY,
	LANGUAGE_SKILL_PROFILE_REPOSITORY,
	LLM_USAGE_REPOSITORY,
} from "~/constants/database.constants";
import {
	DialogueCorrectionEntity,
	DialogueMessageEntity,
	DialogueSessionEntity,
	DialogueThreadEntity,
	DialogueWordEventEntity,
	LanguageSkillProfileEntity,
	LlmUsageEntity,
} from "./dialogue.entities";

export const dialogueProviders = [
	[DIALOGUE_SESSION_REPOSITORY, DialogueSessionEntity],
	[DIALOGUE_THREAD_REPOSITORY, DialogueThreadEntity],
	[DIALOGUE_MESSAGE_REPOSITORY, DialogueMessageEntity],
	[DIALOGUE_CORRECTION_REPOSITORY, DialogueCorrectionEntity],
	[DIALOGUE_WORD_EVENT_REPOSITORY, DialogueWordEventEntity],
	[LANGUAGE_SKILL_PROFILE_REPOSITORY, LanguageSkillProfileEntity],
	[LLM_USAGE_REPOSITORY, LlmUsageEntity],
].map(([provide, entity]) => ({
	provide,
	useFactory: (dataSource: DataSource) => dataSource.getRepository(entity),
	inject: [DATA_SOURCE],
}));
