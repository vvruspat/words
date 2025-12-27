import {
	EntitySubscriberInterface,
	EventSubscriber,
	InsertEvent,
} from "typeorm";
import { WordEntity } from "~/word/word.entity";
import { WordTranslationEntity } from "./wordstranslation.entity";

@EventSubscriber()
export class TranslationSubscriber
	implements EntitySubscriberInterface<WordTranslationEntity>
{
	listenTo() {
		return WordTranslationEntity;
	}

	async afterInsert(event: InsertEvent<WordTranslationEntity>) {
		const wordId = event.entity.word;

		const word = await event.manager.findOne(WordEntity, {
			where: { id: wordId },
		});

		if (!word || !word.audio || word.status === "processed") return;

		await event.manager.update(
			WordEntity,
			{ id: wordId },
			{ status: "processed" },
		);
	}
}
