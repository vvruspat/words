import { MHeading } from "@repo/uikit";
import { fetchReportStatsAction } from "@/actions/fetchReportStatsAction";
import { fetchWordStatsAction } from "@/actions/fetchWordStatsAction";
import { MainHeaderNavLink } from "./MainHeaderNavLink";
import styles from "./MainHeader.module.css";

export async function MainHeader() {
	const [wordStats, reportStats] = await Promise.all([
		fetchWordStatsAction(),
		fetchReportStatsAction(),
	]);

	const totalDuplicates = wordStats.duplicatesByLanguage.reduce(
		(sum, d) => sum + d.count,
		0,
	);

	return (
		<header className={styles.header}>
			<div className={styles.title}>
				<MHeading mode="h4">Words Control</MHeading>
			</div>
			<nav className={styles.nav}>
				<MainHeaderNavLink href="/" label="Dashboard" />
				<MainHeaderNavLink href="/manage-words" label="Manage Words" />
				<MainHeaderNavLink
					href="/reports"
					label="Reports"
					badge={reportStats.new}
				/>
				<MainHeaderNavLink
					href="/duplicates"
					label="Duplicates"
					badge={totalDuplicates}
				/>
			</nav>
		</header>
	);
}
