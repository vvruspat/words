"use client";

import { MCard, MFlex } from "@repo/uikit";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { CSSTransition } from "react-transition-group";

import "./Modal.animation.css";

import useModal from "@/stores/useModal";
import styles from "./Modal.module.css";

export const Modal = () => {
	const { hideModal, onHide, onShow, currentModal, modals } = useModal();
	const nodeRef = useRef(null);

	const modalData = useMemo(
		() => (currentModal ? modals.get(currentModal) : undefined),
		[currentModal, modals],
	);

	const onKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === "Escape") {
				hideModal();
			}
		},
		[hideModal],
	);

	useEffect(() => {
		document.addEventListener("keydown", onKeyDown);

		return () => {
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [onKeyDown]);

	return (
		<CSSTransition
			in={!!currentModal && !!modalData}
			nodeRef={nodeRef}
			timeout={300}
			classNames="alert"
			unmountOnExit
			onEnter={() => onShow?.()}
			onExited={() => onHide?.()}
		>
			<MFlex
				direction="row"
				justify="center"
				align="center"
				className={styles.wrapper}
			>
				<button
					type="button"
					className={styles.overlay}
					onClick={() => hideModal()}
				/>
				{currentModal && modalData && (
					<MCard
						className={styles.modal}
						header={modalData.header}
						footer={modalData.footer}
						role="dialog"
						ref={nodeRef}
						tabIndex={0}
					>
						{modalData.content}
					</MCard>
				)}
			</MFlex>
		</CSSTransition>
	);
};

export default Modal;
