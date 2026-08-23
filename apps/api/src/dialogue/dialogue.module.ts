import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "~/database/database.module";
import { UserVocabularyModule } from "~/user-vocabulary/user-vocabulary.module";
import { DialogueController } from "./dialogue.controller";
import { dialogueProviders } from "./dialogue.providers";
import { DialogueService } from "./dialogue.service";
import { DialogueAiService } from "./dialogue-ai.service";
import { DialogueApplicationService } from "./dialogue-application.service";
import { DialogueFeatureGuard } from "./dialogue-feature.guard";

@Module({
	imports: [ConfigModule, DatabaseModule, UserVocabularyModule],
	controllers: [DialogueController],
	providers: [
		...dialogueProviders,
		DialogueService,
		DialogueAiService,
		DialogueApplicationService,
		DialogueFeatureGuard,
	],
	exports: [DialogueService],
})
export class DialogueModule {}
