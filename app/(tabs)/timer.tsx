import { StyleSheet, Text } from "react-native";

import { ThemedView } from "@/components/themed-view";

export default function Timer() {
	return (
		<ThemedView style={styles.mainContainer}>
			<Text>Hola this is the timer</Text>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	mainContainer: {
		backgroundColor: "#ff0000",
	},
});
