import { MButton, MFlex, MHeading, MIconX } from "@repo/uikit";
import useModal from "@/stores/useModal";
import styles from "./ModalHeader.module.css";

type ModalHeaderProps = {
	title: string;
};

export const ModalHeader = ({ title }: ModalHeaderProps) => {
	const modalStore = useModal();

	const onClose = () => {
		modalStore.hideModal();
	};

	return (
		<MFlex direction="row" justify="space-between" align="center">
			<MHeading mode="h3">{title}</MHeading>
			<MButton
				mode="transparent"
				onClick={onClose}
				aria-label="Close modal"
				className={styles.closeButton}
			>
				<MIconX mode="regular" aria-hidden="true" width={24} height={24} />
			</MButton>
		</MFlex>
	);
};

export default ModalHeader;
