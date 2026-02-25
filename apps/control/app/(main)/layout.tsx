import { MainHeader } from "@/components/MainHeader/MainHeader";

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
