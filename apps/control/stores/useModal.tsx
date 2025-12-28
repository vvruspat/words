import { ReactNode } from "react";
import { create } from "zustand";
import { GenerateWordsForm } from "@/components/GenerateWordsForm";
import { ManageCatalogsForm } from "@/components/ManageCatalogsForm/ManageCatalogsForm";
import { ManageTopicsForm } from "@/components/ManageTopicsForm/ManageTopicsForm";
import ModalHeader from "@/components/Modal/ModalHeader";

export enum MODALS {
	GENERATE_WORDS = "GENERATE_WORDS",
	MANAGE_CATALOGS = "MANAGE_CATALOGS",
	MANAGE_TOPICS = "MANAGE_TOPICS",
}

interface ModalsState {
	currentModal: MODALS | null;
	modals: Map<
		MODALS,
		{ header: ReactNode; content: ReactNode; footer: ReactNode }
	>;
	onHide?: (() => void) | null;
	onShow?: (() => void) | null;
	registerModal: (
		modal: MODALS,
		header: ReactNode,
		content: ReactNode,
		footer: ReactNode,
	) => void;
	showModal: (modal: MODALS, callback?: () => void) => void;
	hideModal: (callback?: () => void) => void;
}

const useModal = create<ModalsState>((set) => ({
	currentModal: null,
	onHide: null,
	onShow: null,
	modals: new Map([
		[
			MODALS.GENERATE_WORDS,
			{
				header: <ModalHeader title="Generate new words" />,
				content: <GenerateWordsForm />,
				footer: null,
			},
		],
		[
			MODALS.MANAGE_CATALOGS,
			{
				header: <ModalHeader title="Manage catalogs" />,
				content: <ManageCatalogsForm />,
				footer: null,
			},
		],
		[
			MODALS.MANAGE_TOPICS,
			{
				header: <ModalHeader title="Manage topics" />,
				content: <ManageTopicsForm />,
				footer: null,
			},
		],
	]),
	showModal: (modal, callback) =>
		set(() => ({ currentModal: modal, onHide: null, onShow: callback })),
	hideModal: (callback) =>
		set(() => ({ currentModal: null, onShow: null, onHide: callback })),
	registerModal: (modal, header, content, footer) =>
		set((prev) => ({
			modals: prev.modals.set(modal, { header, content, footer }),
		})),
}));

export default useModal;
