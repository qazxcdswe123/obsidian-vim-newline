import { LIST_CHARACTER_REGEX } from "./constants";

/**
 * Determines the next markdown list character prefix for a given line.
 *
 * If it's an ordered list and direction is `after`, the prefix will be
 * incremented by 1.
 *
 * If it's a checklist, the newly inserted checkbox will always be unticked.
 *
 * If the current list item is empty, this will be indicated by a `null` prefix.
 */
export const getNextListPrefix = (
	text: string,
	direction: "below" | "above"
): string | null => {
	const listChars = text.match(LIST_CHARACTER_REGEX);
	if (listChars && listChars.length > 0) {
		let prefix = listChars[0].trimStart();
		const isEmptyListItem = prefix === listChars.input?.trimStart();
		if (isEmptyListItem) {
			return null;
		}
		if (isNumeric(prefix) && direction === "above") {
			prefix = +prefix + 1 + ". ";
		}
		if (prefix.startsWith("- [") && !prefix.includes("[ ]")) {
			prefix = "- [ ] ";
		}
		return prefix;
	}
	return "";
};

/**
 * Checks if an input string is numeric.
 *
 * Adapted from https://stackoverflow.com/a/60548119
 */
export const isNumeric = (input: string) => input.length > 0 && !isNaN(+input);

/**
 * Checks if the given file path is within the daily notes directory
 */
export const isFileInDailyNotesDir = (
	filePath: string | undefined,
	dailyNotesDirectory: string
): boolean => {
	if (!filePath) return false;
	return filePath.includes(dailyNotesDirectory);
};

/**
 * Gets the current time formatted as HH:MM
 */
export const getCurrentTimeFormatted = (): string => {
	return new Date().toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
};
