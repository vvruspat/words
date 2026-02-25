import {
	MBadge,
	MCard,
	MDescriptionList,
	MFlex,
	MGrid,
	MHeading,
	MText,
} from "@repo/uikit";
import { AVAILABLE_LANGUAGES, type Language } from "@vvruspat/words-types";
import { Fragment } from "react";
import { fetchReportStatsAction } from "@/actions/fetchReportStatsAction";
import { fetchUserStatsAction } from "@/actions/fetchUserStatsAction";
import {
	fetchWordStatsAction,
	type WordStatEntry,
} from "@/actions/fetchWordStatsAction";

function groupByLanguage(entries: WordStatEntry[]) {
	const map = new Map<string, WordStatEntry[]>();
	for (const entry of entries) {
		const list = map.get(entry.language) ?? [];
		list.push(entry);
		map.set(entry.language, list);
	}
	return Array.from(map.entries()).map(([language, catalogs]) => ({
		language,
		catalogs,
	}));
}

export default async function Home() {
	const [wordStats, reportStats, userStats] = await Promise.all([
		fetchWordStatsAction(),
		fetchReportStatsAction(),
		fetchUserStatsAction(),
	]);

	const byLanguage = groupByLanguage(wordStats.wordsByLanguageCatalog);

	return (
		<main
			style={{
				width: "100%",
				minHeight: "100vh",
				padding: "24px",
				boxSizing: "border-box",
			}}
		>
			<MFlex direction="column" gap="2xl" align="stretch">
				<MHeading mode="h1">Dashboard</MHeading>

				{/* Statistics */}
				<MHeading mode="h2">Statistics</MHeading>

				<MGrid columnTemplate="1fr 1fr 1fr" columnGap="l" rowGap="l">
					{/* Reports by status */}
					<MCard header="Reports by Status">
						<MDescriptionList
							options={[
								{
									title: <MBadge mode="warning">New</MBadge>,
									description: (
										<MText mode="primary" size="m">
											{reportStats.new}
										</MText>
									),
								},
								{
									title: <MBadge mode="info">Reviewed</MBadge>,
									description: (
										<MText mode="primary" size="m">
											{reportStats.reviewed}
										</MText>
									),
								},
								{
									title: <MBadge mode="success">Resolved</MBadge>,
									description: (
										<MText mode="primary" size="m">
											{reportStats.resolved}
										</MText>
									),
								},
								{
									title: (
										<MText mode="tertiary" size="s">
											Total
										</MText>
									),
									description: (
										<MText mode="primary" size="m">
											{reportStats.total}
										</MText>
									),
								},
							]}
						/>
					</MCard>

					{/* Users */}
					<MCard header="Users">
						<MDescriptionList
							options={[
								{
									title: (
										<MText mode="tertiary" size="s">
											Total
										</MText>
									),
									description: (
										<MText mode="primary" size="m">
											{userStats.total}
										</MText>
									),
								},
								{
									title: (
										<MText mode="tertiary" size="s">
											Email verified
										</MText>
									),
									description: (
										<MBadge mode="success">{userStats.emailVerified}</MBadge>
									),
								},
								{
									title: (
										<MText mode="tertiary" size="s">
											Last 30 days
										</MText>
									),
									description: (
										<MBadge mode="info">{userStats.recentCount}</MBadge>
									),
								},
							]}
						/>
						{userStats.byLanguageLearn.length > 0 && (
							<>
								<MText mode="tertiary" size="s" style={{ marginTop: 12 }}>
									Learning language
								</MText>
								<MDescriptionList
									options={userStats.byLanguageLearn.map((l) => ({
										title: (
											<MText mode="secondary" size="s">
												{AVAILABLE_LANGUAGES[l.language as Language] ??
													l.language}
											</MText>
										),
										description: <MBadge mode="info">{l.count}</MBadge>,
									}))}
								/>
							</>
						)}
					</MCard>

					{/* Duplicates by language */}
					<MCard header="Duplicates by Language">
						{wordStats.duplicatesByLanguage.length === 0 ? (
							<MText mode="secondary">No duplicates found.</MText>
						) : (
							<MDescriptionList
								options={wordStats.duplicatesByLanguage.map((d) => ({
									title: (
										<MText mode="secondary" size="s">
											{AVAILABLE_LANGUAGES[d.language as Language] ??
												d.language}
										</MText>
									),
									description: <MBadge mode="warning">{d.count} groups</MBadge>,
								}))}
							/>
						)}
					</MCard>
				</MGrid>

				{/* Words per language & catalog */}
				<MCard header="Words by Language & Catalog">
					{byLanguage.length === 0 ? (
						<MText mode="secondary">No words yet.</MText>
					) : (
						<MFlex direction="column" gap="l" align="stretch">
							{byLanguage.map(({ language, catalogs }) => (
								<MFlex
									key={language}
									direction="column"
									gap="s"
									align="stretch"
								>
									<MText mode="primary" size="m">
										<strong>
											{AVAILABLE_LANGUAGES[language as Language] ?? language}
										</strong>{" "}
										<MText as="span" mode="tertiary" size="s">
											({language})
										</MText>
									</MText>
									<MGrid
										columnTemplate="1fr auto"
										columnGap="l"
										rowGap="xs"
										alignItems="center"
										style={{ paddingLeft: 16 }}
									>
										{catalogs.map((c) => (
											<Fragment key={`${language}-${c.catalogId}`}>
												<MText mode="secondary" size="s">
													{c.catalogTitle ?? "Uncategorized"}
												</MText>
												<MBadge mode="info">{c.count}</MBadge>
											</Fragment>
										))}
									</MGrid>
								</MFlex>
							))}
						</MFlex>
					)}
				</MCard>
			</MFlex>
		</main>
	);
}
