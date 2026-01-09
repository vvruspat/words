import {
	type EntitySubscriberInterface,
	EventSubscriber,
	type UpdateEvent,
} from "typeorm";
import { WordTranslationEntity } from "~/wordstranslation/wordstranslation.entity";
import { WordEntity } from "./word.entity";

@EventSubscriber()
export class WordSubscriber implements EntitySubscriberInterface<WordEntity> {
	listenTo() {
		return WordEntity;
	}

	async afterUpdate(event: UpdateEvent<WordEntity>) {
		if (!event.entity) return;
		if (event.entity.status === "processed") return;
		if (event.entity.audio) return;

		const word = event.entity;

		const translationCount = await event.manager.count(WordTranslationEntity, {
			where: { word: word.id },
		});

		if (translationCount > 0 && word.status !== "processed") {
			await event.manager.update(
				WordEntity,
				{ id: word.id },
				{ status: "processed" },
			);
		}
	}
}
