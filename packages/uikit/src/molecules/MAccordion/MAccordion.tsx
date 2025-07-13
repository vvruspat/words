"use client";

import clsx from "clsx";
import type React from "react";
import { type ReactNode, useMemo, useState } from "react";
import MCard from "../../atoms/MCard/MCard";
import MDivider from "../../atoms/MDivider/MDivider";
import MFlex from "../../atoms/MFlex/MFlex";
import style from "./MAccordion.module.css";

export type AccordionItemProps = {
	key: number;
	title: ReactNode;
	children: ReactNode;
	collapsed?: boolean;
};

type AccordionProps = {
	items: AccordionItemProps[];
	iconOpen?: ReactNode;
	iconClosed?: ReactNode;
};

export const MAccordion: React.FC<AccordionProps> = ({
	items,
	iconOpen,
	iconClosed,
}) => {
	const [openIndex, setOpenIndex] = useState(-1);
	const accordionItems = useMemo(
		() =>
			items.map((item, index) => {
				return {
					...item,
					collapsed: openIndex !== index,
				};
			}),
		[items, openIndex],
	);

	const toggleAccordion = (index: number) => {
		setOpenIndex((prevIndex) => (prevIndex === index ? -1 : index));
	};

	const getIcon = (isCollapsed: boolean) => {
		return isCollapsed ? iconClosed : iconOpen;
	};

	const getHeader = (item: AccordionItemProps, index: number) => (
		<MFlex onClick={() => toggleAccordion(index)}>
			{getIcon(!!item.collapsed)}
			{item.title}
		</MFlex>
	);
	return (
		<MCard className={style.container}>
			{accordionItems.map((item, index) => (
				<div key={item.key}>
					<MCard
						header={getHeader(item, index)}
						headerClassName={clsx(style.itemHeader, {
							[style.collapsedIcon]: item.collapsed,
						})}
						className={style.item}
						showHeaderDivider
						shadow={false}
						collapsed={item.collapsed}
					>
						{item.children}
					</MCard>
					{index !== items.length - 1 && <MDivider />}
				</div>
			))}
		</MCard>
	);
};

export default MAccordion;
