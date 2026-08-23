import { MainHeader } from "@/components/MainHeader/MainHeader";

export const dynamic = "force-dynamic";

export default function MainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<MainHeader />
			{children}
		</>
	);
}
