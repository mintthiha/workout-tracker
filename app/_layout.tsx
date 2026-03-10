import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppProvider } from "@/src/context/AppContext";

import {
	requestNotificationPermissions,
	setupNotificationChannels,
} from "../utils/notificationManager";

export const unstable_settings = {
	anchor: "(tabs)",
};

// Separated so it runs inside AppProvider and can read the saved color scheme.
function ThemedApp() {
	const colorScheme = useColorScheme();

	return (
		<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
			<Stack>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen
					name="modal"
					options={{ presentation: "modal", title: "Modal" }}
				/>
			</Stack>
			<StatusBar style="auto" />
		</ThemeProvider>
	);
}

export default function RootLayout() {
	useEffect(() => {
		async function setup() {
			await setupNotificationChannels();
			await requestNotificationPermissions();
		}
		setup();
	}, []);

	return (
		<AppProvider>
			<ThemedApp />
		</AppProvider>
	);
}
