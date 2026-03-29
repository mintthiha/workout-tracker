/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
	light: {
		// ── Core ──────────────────────────────────────────────────────────────
		text: "#11181C",
		background: "#f2f3f8",
		tint: tintColorLight,
		icon: "#687076",
		tabIconDefault: "#687076",
		tabIconSelected: tintColorLight,

		// ── Cards ─────────────────────────────────────────────────────────────
		card: "#ffffff",
		cardBorder: "rgba(0,0,0,0.08)",

		// Glass-style card (used in workout UI)
		glassCard: "rgba(255,255,255,0.92)",
		glassBorder: "rgba(0,0,0,0.08)",
		glassDivider: "rgba(0,0,0,0.07)",

		// ── Text ──────────────────────────────────────────────────────────────
		secondaryText: "#777777",
		tertiaryText: "#aaaaaa",

		// ── Brand / Semantic ──────────────────────────────────────────────────
		accent: "#3498db",
		// Primary blue used throughout the workout UI
		primary: "#2f78f5",
		success: "#00b894",
		danger: "#ff4757",
		gold: "#ffc73d",

		// ── Tints (color + low opacity, for icon wraps / badges) ──────────────
		accentTint: "rgba(47,120,245,0.1)",
		successTint: "rgba(0,184,148,0.1)",
		dangerTint: "rgba(255,71,87,0.1)",
		goldTint: "rgba(255,199,61,0.12)",

		// ── Inputs ────────────────────────────────────────────────────────────
		inputBg: "rgba(0,0,0,0.06)",
		completedRowBg: "rgba(0,185,148,0.07)",
		completedInputBg: "rgba(0,185,148,0.12)",
		completedBorder: "rgba(0,185,148,0.4)",

		// ── Misc ──────────────────────────────────────────────────────────────
		// Secondary button / cancel button background
		subtleBtnBg: "rgba(255,255,255,0.92)",
	},
	dark: {
		// ── Core ──────────────────────────────────────────────────────────────
		text: "#ECEDEE",
		background: "#0d0e17",
		tint: tintColorDark,
		icon: "#9BA1A6",
		tabIconDefault: "#9BA1A6",
		tabIconSelected: tintColorDark,

		// ── Cards ─────────────────────────────────────────────────────────────
		card: "#1c1c1e",
		cardBorder: "rgba(255,255,255,0.12)",

		// Glass-style card (used in workout UI)
		glassCard: "rgba(255,255,255,0.06)",
		glassBorder: "rgba(255,255,255,0.12)",
		glassDivider: "rgba(255,255,255,0.08)",

		// ── Text ──────────────────────────────────────────────────────────────
		secondaryText: "rgba(255,255,255,0.5)",
		tertiaryText: "rgba(255,255,255,0.3)",

		// ── Brand / Semantic ──────────────────────────────────────────────────
		accent: "#3498db",
		// Primary blue used throughout the workout UI
		primary: "#5b8ef0",
		success: "#00d4aa",
		danger: "#ff4757",
		gold: "#ffc73d",

		// ── Tints (color + low opacity, for icon wraps / badges) ──────────────
		accentTint: "rgba(91,142,240,0.18)",
		successTint: "rgba(0,212,170,0.15)",
		dangerTint: "rgba(255,71,87,0.18)",
		goldTint: "rgba(255,199,61,0.2)",

		// ── Inputs ────────────────────────────────────────────────────────────
		inputBg: "rgba(255,255,255,0.08)",
		completedRowBg: "rgba(0,212,170,0.08)",
		completedInputBg: "rgba(0,212,170,0.15)",
		completedBorder: "rgba(0,212,170,0.4)",

		// ── Misc ──────────────────────────────────────────────────────────────
		subtleBtnBg: "rgba(255,255,255,0.06)",
	},
};

/**
 * Per-muscle-group color pairs (bg + text) for light and dark mode.
 * Exported separately because they're a keyed map, not individual tokens.
 * Components should import this and select the correct variant via useColorScheme.
 */
export const MuscleGroupColors = {
	light: {
		chest: { bg: "#ffe0e0", text: "#c0392b" },
		back: { bg: "#d0f5f0", text: "#1a7a72" },
		shoulders: { bg: "#daeef9", text: "#1a6a8a" },
		biceps: { bg: "#d6f0e2", text: "#1e7a48" },
		triceps: { bg: "#fff8d6", text: "#9a7000" },
		legs: { bg: "#eedcee", text: "#7a3a8a" },
		core: { bg: "#fde8cc", text: "#9a5000" },
		full_body: { bg: "#e3e0fd", text: "#4a3aa0" },
	},
	dark: {
		chest: { bg: "#3a1a1a", text: "#ff8080" },
		back: { bg: "#0d2e2b", text: "#4ecdc4" },
		shoulders: { bg: "#0d2535", text: "#56b0d8" },
		biceps: { bg: "#0d2e1c", text: "#56c87e" },
		triceps: { bg: "#2e2800", text: "#ffd666" },
		legs: { bg: "#2a0f2e", text: "#c070d0" },
		core: { bg: "#2e1c00", text: "#f0a030" },
		full_body: { bg: "#1a1640", text: "#8a7eee" },
	},
} as const;

export type MuscleGroupKey = keyof typeof MuscleGroupColors.light;

export const Fonts = Platform.select({
	ios: {
		/** iOS `UIFontDescriptorSystemDesignDefault` */
		sans: "system-ui",
		/** iOS `UIFontDescriptorSystemDesignSerif` */
		serif: "ui-serif",
		/** iOS `UIFontDescriptorSystemDesignRounded` */
		rounded: "ui-rounded",
		/** iOS `UIFontDescriptorSystemDesignMonospaced` */
		mono: "ui-monospace",
	},
	default: {
		sans: "normal",
		serif: "serif",
		rounded: "normal",
		mono: "monospace",
	},
	web: {
		sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
		serif: "Georgia, 'Times New Roman', serif",
		rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
		mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
	},
});
