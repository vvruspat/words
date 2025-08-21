"use client";

import { type FC, useState } from "react";
import MFlex from "../MFlex/MFlex";
import MTab, { type MTabProps } from "../MTab/MTab";
import styles from "./MTabs.module.css";
import "./MTabs.vars.css";

interface MTabsProps {
	items?: MTabProps[];
	defaultActiveKey: string;
}

export const MTabs: FC<MTabsProps> = ({
	items = [],
	defaultActiveKey,
	...restProps
}) => {
	const [activeKey, setActiveKey] = useState(defaultActiveKey);

	const handleTabClick = (key: string) => {
		setActiveKey(key);
	};

	return (
		<MFlex direction="column" align="start">
			<div className={styles.tabHeaders} role="tablist">
				{items.map((item) => (
					<MTab
						key={item.key}
						active={item.key === activeKey}
						label={item.label}
						disabled={item.disabled}
						onClick={() => handleTabClick(item.key)}
						before={item.before}
						after={item.after}
						{...restProps}
					/>
				))}
			</div>

			<MFlex className={styles.tabContent}>
				{items.find((item) => item.key === activeKey)?.content}
			</MFlex>
		</MFlex>
	);
};

export default MTabs;
