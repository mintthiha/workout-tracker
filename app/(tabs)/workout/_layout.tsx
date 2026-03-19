import { Stack } from "expo-router";

export default function WorkoutLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
			<Stack.Screen name="[id]" />
			<Stack.Screen name="create" />
		</Stack>
	);
}
