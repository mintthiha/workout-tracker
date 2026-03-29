import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAppContext } from "@/src/context/AppContext";
import {
	formatDate,
	formatDuration,
	formatMonthYear,
	getBestSet,
	getWorkoutLogs,
} from "@/src/services/workoutService";
import { WorkoutLog } from "@/src/types/workout";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

// ─── Group logs by month ──────────────────────────────────────────────────────

interface MonthGroup {
	label: string;
	logs: WorkoutLog[];
}

function groupByMonth(logs: WorkoutLog[]): MonthGroup[] {
	const groups: Record<string, WorkoutLog[]> = {};
	for (const log of logs) {
		const key = formatMonthYear(log.completedAt);
		if (!groups[key]) groups[key] = [];
		groups[key].push(log);
	}
	return Object.entries(groups).map(([label, logs]) => ({ label, logs }));
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HistoryScreen() {
	const { userId, isLoaded } = useAppContext();
	const [groups, setGroups] = useState<MonthGroup[]>([]);
	const [isEmpty, setIsEmpty] = useState(false);

	if (isLoaded && !userId) return <Redirect href="/login" />;

	const cardBg = useThemeColor({ light: "#f5f5f5", dark: "#1c1c1e" }, "card");
	const cardBorder = useThemeColor({ light: "#e0e0e0", dark: "#2c2c2e" }, "cardBorder");
	const secondaryText = useThemeColor({ light: "#666666", dark: "#8e8e93" }, "secondaryText");
	const tertiaryText = useThemeColor({ light: "#999999", dark: "#666666" }, "tertiaryText");
	const textColor = useThemeColor({ light: "#161d22", dark: "#ECEDEE" }, "text");
	const accentColor = useThemeColor({ light: "#3498db", dark: "#3498db" }, "accent");

	// Reload logs every time the History tab is focused
	useFocusEffect(
		useCallback(() => {
			if (!userId) {
				setIsEmpty(true);
				setGroups([]);
				return;
			}
			getWorkoutLogs(userId)
				.then((logs) => {
					if (logs.length === 0) {
						setIsEmpty(true);
						setGroups([]);
					} else {
						setIsEmpty(false);
						setGroups(groupByMonth(logs));
					}
				})
				.catch(() => {
					setIsEmpty(true);
					setGroups([]);
				});
		}, [userId]),
	);

	return (
		<ThemedView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<ThemedText type="title" style={styles.headerTitle}>
					History
				</ThemedText>
				<TouchableOpacity>
					<ThemedText style={[styles.calendarLink, { color: accentColor }]}>
						Calendar
					</ThemedText>
				</TouchableOpacity>
			</View>

			{isEmpty ? (
				<View style={styles.emptyState}>
					<Ionicons name="time-outline" size={60} color={tertiaryText} />
					<ThemedText style={[styles.emptyTitle, { color: secondaryText }]}>
						No Workouts Yet
					</ThemedText>
					<ThemedText style={[styles.emptySubtitle, { color: tertiaryText }]}>
						Complete a workout to see it here.
					</ThemedText>
				</View>
			) : (
				<ScrollView contentContainerStyle={styles.scrollContent}>
					{groups.map(({ label, logs }) => (
						<View key={label}>
							<ThemedText style={[styles.monthHeader, { color: secondaryText }]}>
								{label}
							</ThemedText>

							{logs.map((log) => {
								const goldColor = "#ffd60a";

								return (
									<View
										key={log.id}
										style={[
											styles.card,
											{ backgroundColor: cardBg, borderColor: cardBorder },
										]}
									>
										<View style={styles.cardHeader}>
											<ThemedText
												type="defaultSemiBold"
												style={styles.workoutTitle}
											>
												{log.templateName}
											</ThemedText>
											<TouchableOpacity>
												<Ionicons
													name="ellipsis-horizontal"
													size={20}
													color={secondaryText}
												/>
											</TouchableOpacity>
										</View>

										<ThemedText
											style={[styles.dateText, { color: secondaryText }]}
										>
											{formatDate(log.completedAt)}
										</ThemedText>

										<View style={styles.statsRow}>
											<View style={styles.statItem}>
												<Ionicons
													name="time-outline"
													size={16}
													color={tertiaryText}
												/>
												<ThemedText
													style={[
														styles.statText,
														{ color: secondaryText },
													]}
												>
													{formatDuration(log.durationSeconds)}
												</ThemedText>
											</View>
											<View style={styles.statItem}>
												<Ionicons
													name="barbell-outline"
													size={16}
													color={tertiaryText}
												/>
												<ThemedText
													style={[
														styles.statText,
														{ color: secondaryText },
													]}
												>
													{Math.round(
														log.totalVolumeLbs,
													).toLocaleString()}{" "}
													lb
												</ThemedText>
											</View>
											{log.personalRecords > 0 && (
												<View style={styles.statItem}>
													<Ionicons
														name="trophy-outline"
														size={16}
														color={goldColor}
													/>
													<ThemedText
														style={[
															styles.statText,
															{ color: goldColor },
														]}
													>
														{log.personalRecords} PR
														{log.personalRecords !== 1 ? "s" : ""}
													</ThemedText>
												</View>
											)}
										</View>

										<View style={styles.exerciseHeaderRow}>
											<ThemedText
												style={[
													styles.columnLabel,
													{ color: secondaryText },
												]}
											>
												Exercise
											</ThemedText>
											<ThemedText
												style={[
													styles.columnLabel,
													{ color: secondaryText },
												]}
											>
												Best Set
											</ThemedText>
										</View>

										{log.exercises.map((ex) => {
											const best = getBestSet(ex.sets);
											return (
												<View
													key={ex.exerciseId}
													style={styles.exerciseRow}
												>
													<ThemedText
														style={[
															styles.exerciseText,
															{ color: secondaryText },
														]}
														numberOfLines={1}
													>
														{ex.sets.filter((s) => s.completed).length}{" "}
														× {ex.exerciseName}
													</ThemedText>
													<ThemedText
														style={[
															styles.exerciseText,
															{ color: secondaryText },
														]}
													>
														{best
															? `${best.actualWeight} lb × ${best.actualReps}`
															: "—"}
													</ThemedText>
												</View>
											);
										})}
									</View>
								);
							})}
						</View>
					))}
				</ScrollView>
			)}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 60,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-end",
		paddingHorizontal: 20,
		marginBottom: 20,
	},
	headerTitle: {
		fontSize: 34,
		fontWeight: "800",
	},
	calendarLink: {
		fontSize: 17,
		marginBottom: 8,
	},
	scrollContent: {
		paddingHorizontal: 16,
		paddingBottom: 40,
	},
	emptyState: {
		alignItems: "center",
		paddingTop: 80,
		gap: 12,
	},
	emptyTitle: {
		fontSize: 20,
		fontWeight: "600",
		marginTop: 8,
	},
	emptySubtitle: {
		fontSize: 15,
		textAlign: "center",
		paddingHorizontal: 32,
	},
	monthHeader: {
		fontSize: 13,
		fontWeight: "600",
		marginBottom: 15,
		textTransform: "uppercase",
	},
	card: {
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		borderWidth: 1,
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 4,
	},
	workoutTitle: {
		fontSize: 20,
	},
	dateText: {
		marginBottom: 12,
	},
	statsRow: {
		flexDirection: "row",
		gap: 15,
		marginBottom: 16,
	},
	statItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	statText: {
		fontSize: 14,
	},
	exerciseHeaderRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 8,
	},
	columnLabel: {
		fontWeight: "700",
		fontSize: 16,
	},
	exerciseRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 4,
	},
	exerciseText: {
		fontSize: 15,
		flex: 1,
	},
});
