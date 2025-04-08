# Vim Smart Newline

A plugin for Obsidian mainly designed for personal use. It provides context-aware newline behavior when using Vim mode. It can also automatically continues lists, adds proper indentation, and can also insert timestamps in daily notes.

## Features

- **Smart List Continuation**: Automatically continues numbered and bulleted lists when creating new lines
- **Time Insertion for Daily Notes**: Option to automatically insert the current time when creating new lines in daily notes

## Installation

1. Click "Browse" and search for "Vim Smart Newline"
1. Install the plugin and enable it
1. Modify vimrc file to map `o` and `O` to the plugin commands, see [Vim Mode Integration](#vim-mode-integration)

## Usage

### Basic Usage

The plugin adds two commands to Obsidian:

- `Insert Line Below` - Creates a new line below the current line
- `Insert Line Above` - Creates a new line above the current line

### Vim Mode Integration

To integrate with Obsidian's Vim mode, add the following to your Obsidian Vimrc file:

```vim
exmap blankBelow obcommand vim-smart-newline:insertLineBelow
exmap blankAbove obcommand vim-smart-newline:insertLineAbove
nmap o :blankBelow<CR>i
nmap O :blankAbove<CR>i
```

This configuration will:

1. Map the plugin commands to `blankBelow` and `blankAbove`
2. Override Vim's default `o` and `O` commands to use the plugin's smart newline behavior

### Configuration

In the plugin settings, you can:

- Enable/disable automatic list prefix insertion
- Enable/disable time insertion for daily notes
- Configure your daily notes directory path
