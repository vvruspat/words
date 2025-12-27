"use client";

import { useEffect, useState } from "react";

export function usePersistentState<T>(
	defaultValue: T,
	key: string,
): [T, (value: T) => void] {
	const [value, setValue] = useState(() => {
		if (typeof window === "undefined") {
			return defaultValue;
		}

		const stickyValue = window.localStorage.getItem(key);

		return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
	});

	useEffect(() => {
		if (typeof window !== "undefined") {
			window.localStorage.setItem(key, JSON.stringify(value));
		}
	}, [key, value]);

	return [value, setValue];
}
