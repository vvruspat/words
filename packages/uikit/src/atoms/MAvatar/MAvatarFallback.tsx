import { MFlex } from "../MFlex";
import { MIconPerson } from "../MIcon";
import styles from "./MAvatarFallback.module.css";
import "./MAvatarFallback.vars.css";

type MAvatarFallbackProps = {
	name: string;
};

export const MAvatarFallback = ({ name }: MAvatarFallbackProps) => {
	const initials = name
		.split(" ")
		.slice(0, 2)
		.map((n) => n[0])
		.join("")
		.toUpperCase();

	return (
		<MFlex align="center" justify="center" className={styles.fallback}>
			{initials || <MIconPerson mode="fill" />}
		</MFlex>
	);
};
