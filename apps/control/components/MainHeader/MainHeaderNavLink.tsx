"use client";

import { MBadge, MText } from "@repo/uikit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./MainHeader.module.css";

export function MainHeaderNavLink({
	href,
	label,
	badge,
}: {
	href: string;
	label: string;
	badge?: number;
}) {
	const pathname = usePathname();
	const isActive = pathname === href;

	return (
		<Link
			href={href}
			className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
		>
			<MText mode="primary" size="s">
				{label}
			</MText>
			{badge != null && badge > 0 && <MBadge mode="warning">{badge}</MBadge>}
		</Link>
	);
}
