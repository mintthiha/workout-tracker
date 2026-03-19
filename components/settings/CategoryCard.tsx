import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface CategoryCardProps {
	icon: React.ComponentProps<typeof Ionicons>["name"];
	title: string;
	subtitle: string;
	onPress: () => void;
}

export function CategoryCard({ icon, title, subtitle, onPress }: CategoryCardProps) {
	const cardBg = useThemeColor({}, "card");
	const borderColor = useThemeColor({}, "cardBorder");
	const accent = useThemeColor({}, "accent");
	const iconColor = useThemeColor({}, "icon");

	return (
		<TouchableOpacity
			style={[styles.card, { backgroundColor: cardBg, borderColor }]}
			onPress={onPress}
			activeOpacity={0.7}
		>
			<View style={[styles.iconContainer, { backgroundColor: accent + "18" }]}>
				<Ionicons name={icon} size={22} color={accent} />
			</View>
			<View style={styles.textContainer}>
				<ThemedText style={styles.title}>{title}</ThemedText>
				<ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
			</View>
			<Ionicons name="chevron-forward" size={20} color={iconColor} />
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	card: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 16,
		borderRadius: 14,
		borderWidth: 1,
		marginBottom: 10,
	},
	iconContainer: {
		width: 40,
		height: 40,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 14,
	},
	textContainer: {
		flex: 1,
	},
	title: {
		fontSize: 16,
		fontWeight: "600",
	},
	subtitle: {
		fontSize: 13,
		marginTop: 2,
		opacity: 0.55,
	},
});
