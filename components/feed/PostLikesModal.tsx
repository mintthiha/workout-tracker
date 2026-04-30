import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import {
	ActivityIndicator,
	FlatList,
	Modal,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";

const DEFAULT_AVATAR = require("@/assets/images/defaultPFP.jpg");

export interface PostLikerProfile {
	userId: string;
	username: string;
	firstName?: string;
	lastName?: string;
	avatarUrl?: string;
}

interface Props {
	visible: boolean;
	loading: boolean;
	likers: PostLikerProfile[];
	onClose: () => void;
}

export function PostLikesModal({ visible, loading, likers, onClose }: Props) {
	const cardBg = useThemeColor({ light: "#ffffff", dark: "#1c1c1e" }, "card");
	const border = useThemeColor({ light: "#e0e0e0", dark: "#2c2c2e" }, "cardBorder");
	const primary = useThemeColor({}, "primary");
	const secondaryText = useThemeColor({}, "secondaryText");
	const tertiaryText = useThemeColor({}, "tertiaryText");

	return (
		<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
			<View style={styles.backdrop}>
				<ThemedView style={[styles.sheet, { backgroundColor: cardBg }]}>
					<View style={[styles.header, { borderBottomColor: border }]}>
						<ThemedText style={styles.title}>Liked by</ThemedText>
						<TouchableOpacity
							style={styles.closeButton}
							onPress={onClose}
							accessibilityRole="button"
							accessibilityLabel="Close likes"
						>
							<Ionicons name="close" size={24} color={secondaryText} />
						</TouchableOpacity>
					</View>

					{loading ? (
						<View style={styles.centered}>
							<ActivityIndicator color={primary} />
						</View>
					) : (
						<FlatList
							data={likers}
							keyExtractor={(item) => item.userId}
							contentContainerStyle={likers.length === 0 ? styles.emptyList : undefined}
							renderItem={({ item }) => (
								<View style={styles.likerRow}>
									<Image
										source={item.avatarUrl ?? DEFAULT_AVATAR}
										style={styles.avatar}
										contentFit="cover"
									/>
									<View style={styles.likerMeta}>
										<ThemedText type="defaultSemiBold">{item.username}</ThemedText>
										{item.firstName || item.lastName ? (
											<ThemedText style={[styles.name, { color: tertiaryText }]}>
												{[item.firstName, item.lastName].filter(Boolean).join(" ")}
											</ThemedText>
										) : null}
									</View>
								</View>
							)}
							ListEmptyComponent={
								<View style={styles.emptyState}>
									<Ionicons name="heart-outline" size={38} color={tertiaryText} />
									<ThemedText style={[styles.emptyText, { color: tertiaryText }]}>
										No likes yet
									</ThemedText>
								</View>
							}
						/>
					)}
				</ThemedView>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		justifyContent: "flex-end",
		backgroundColor: "rgba(0, 0, 0, 0.35)",
	},
	sheet: {
		maxHeight: "72%",
		minHeight: 260,
		borderTopLeftRadius: 18,
		borderTopRightRadius: 18,
		overflow: "hidden",
	},
	header: {
		minHeight: 56,
		paddingLeft: 20,
		paddingRight: 12,
		flexDirection: "row",
		alignItems: "center",
		borderBottomWidth: 1,
	},
	title: {
		flex: 1,
		fontSize: 20,
		fontWeight: "700",
	},
	closeButton: {
		width: 44,
		height: 44,
		alignItems: "center",
		justifyContent: "center",
	},
	centered: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	likerRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingVertical: 12,
	},
	avatar: {
		width: 44,
		height: 44,
		borderRadius: 22,
		marginRight: 12,
	},
	likerMeta: {
		flex: 1,
	},
	name: {
		fontSize: 13,
		marginTop: 2,
	},
	emptyList: {
		flexGrow: 1,
	},
	emptyState: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		paddingVertical: 40,
	},
	emptyText: {
		fontSize: 15,
		fontWeight: "600",
	},
});
