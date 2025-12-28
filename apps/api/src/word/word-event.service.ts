import { Injectable } from "@nestjs/common";
import { Subject } from "rxjs";
import type { WordEntity } from "./word.entity";

export interface WordUpdateEvent {
	type: "update" | "create" | "delete";
	word: WordEntity;
}

@Injectable()
export class WordEventService {
	private readonly eventSubject = new Subject<WordUpdateEvent>();

	/**
	 * Emit a word update event
	 */
	emit(event: WordUpdateEvent): void {
		this.eventSubject.next(event);
	}

	/**
	 * Get the observable stream of word update events
	 */
	getEventStream(): Subject<WordUpdateEvent> {
		return this.eventSubject;
	}
}
