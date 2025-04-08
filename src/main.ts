import { App, MarkdownView, Plugin, PluginSettingTab, Setting } from "obsidian";

import { getNextListPrefix, isFileInDailyNotesDir, getCurrentTimeFormatted } from "./utils";
import { FolderSuggest } from "./ui/file-suggest";

// Remember to rename these classes and interfaces!

interface UserSettings {
	autoInsertListPrefix: boolean;
	dailyNotesDirectory: string;
	insertTimeInDailyNotes: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
	autoInsertListPrefix: true,
	dailyNotesDirectory: "",
	insertTimeInDailyNotes: false,
};

export default class SmartNewlinePlugin extends Plugin {
	settings: UserSettings;

	async onload() {
		await this.loadSettings();

		this.setCommands();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));
	}

	/**
	 * Setup the command to handle new lines
	 */
	setCommands() {
		this.addCommand({
			id: "insertLineBelow",
			name: "Insert Line Below",
			editorCallback: (editor, _) => {
				if (this.settings.autoInsertListPrefix) {
					this.handleNewLine("below");
				} else {
					editor.replaceRange("\n", editor.getCursor());
					editor.setCursor({
						line: editor.getCursor().line + 1,
						ch: 0,
					});
				}
			},
		});
		this.addCommand({
			id: "insertLineAbove",
			name: "Insert Line Above",
			editorCallback: (editor, _) => {
				if (this.settings.autoInsertListPrefix) {
					this.handleNewLine("above");
				} else {
					editor.replaceRange("\n", editor.getCursor());
					editor.setCursor({
						line: editor.getCursor().line - 1,
						ch: 0,
					});
				}
			},
		});
	}

	/**
	 * Handles creating a new line with context-aware list prefixes
	 */
	handleNewLine(direction: "below" | "above") {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) return;

		const editor = view.editor;
		const cursor = editor.getCursor();
		const line = editor.getLine(cursor.line);

		// Get the indentation of the current line
		const indentation = line.match(/^\s*/)?.[0] || "";

		// Get the appropriate list prefix based on the current line
		const prefix = getNextListPrefix(line, direction);

		// Create new line and insert the proper list prefix if needed
		if (direction === "below") {
			// Default Vim 'o' behavior: create a new line below
			editor.replaceRange("\n", { line: cursor.line, ch: line.length });
			editor.setCursor({ line: cursor.line + 1, ch: 0 });
		} else {
			// Default Vim 'O' behavior: create a new line above
			editor.replaceRange("\n", { line: cursor.line, ch: 0 });
			editor.setCursor({ line: cursor.line, ch: 0 });
		}

		// Insert the indentation
		if (indentation) {
			editor.replaceRange(indentation, editor.getCursor());
			editor.setCursor({
				line: editor.getCursor().line,
				ch: indentation.length,
			});
		}

		// Insert the list prefix if it exists and is not null
		if (prefix !== null) {
			editor.replaceRange(prefix, editor.getCursor());
			editor.setCursor({
				line: editor.getCursor().line,
				ch: indentation.length + prefix.length,
			});
		}

		// Check if time should be inserted for daily notes
		if (
			this.settings.insertTimeInDailyNotes &&
			isFileInDailyNotesDir(view.file?.path, this.settings.dailyNotesDirectory)
		) {
			const currentTime = getCurrentTimeFormatted();
			editor.replaceRange(currentTime + " ", editor.getCursor());
			editor.setCursor({
				line: editor.getCursor().line,
				ch: editor.getCursor().ch + currentTime.length + 1,
			});
		}
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SettingTab extends PluginSettingTab {
	plugin: SmartNewlinePlugin;

	constructor(app: App, plugin: SmartNewlinePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Auto Insert List Prefix")
			.setDesc(
				"Automatically insert list prefix when creating a new line in a list"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoInsertListPrefix)
					.onChange(async (value) => {
						this.plugin.settings.autoInsertListPrefix = value;
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl("h3", { text: "Daily Notes Time Insertion" });

		new Setting(containerEl)
			.setName("Insert Time in Daily Notes")
			.setDesc(
				"Automatically insert the current time when creating a new line in daily notes"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.insertTimeInDailyNotes)
					.onChange(async (value) => {
						this.plugin.settings.insertTimeInDailyNotes = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Daily Notes Directory")
			.setDesc(
				"Path to your daily notes folder. Plugin will insert time in files within this directory."
			)
			.addText((text) => {
				const textEl = text
					.setPlaceholder("dailies")
					.setValue(this.plugin.settings.dailyNotesDirectory)
					.onChange(async (value) => {
						this.plugin.settings.dailyNotesDirectory = value;
						await this.plugin.saveSettings();
					});
				
				// Add folder suggestion functionality
				new FolderSuggest(this.app, textEl.inputEl);
				
				return textEl;
			});
	}
}
