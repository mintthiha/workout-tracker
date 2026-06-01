import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
	bucketLogsByDay,
	countWorkoutsInPastDays,
	DAYS_PER_WEEK,
	getHeatmapMonthLabels,
	HEATMAP_WEEKS,
	HeatmapLevel,
} from "@/src/lib/heatmap";
import { WorkoutLog } from "@/src/types/workout";

interface ActivityHeatmapProps {
	logs: WorkoutLog[];
	referenceDate?: Date;
}

/** Returns the GitHub-style green for the given intensity bucket; level 0 is the empty-cell color. */
function getLevelColor(level: HeatmapLevel): string {
	switch (level) {
		case 1:
			return "#9be9a8";
		case 2:
			return "#40c463";
		case 3:
			return "#30a14e";
		case 4:
			return "#216e39";
		default:
			return "#ebedf0";
	}
}

/** Profile activity heatmap — renders a 53-week grid of per-day workout intensity derived from the user's logs. */
export function ActivityHeatmap({ logs, referenceDate }: ActivityHeatmapProps) {
	const days = useMemo(() => bucketLogsByDay(logs, referenceDate), [logs, referenceDate]);
	const pastMonthCount = useMemo(
		() => countWorkoutsInPastDays(logs, undefined, referenceDate),
		[logs, referenceDate],
	);
	const monthLabels = useMemo(() => getHeatmapMonthLabels(referenceDate), [referenceDate]);

	const sessionWord = pastMonthCount === 1 ? "session" : "sessions";

	return (
		<ThemedView style={styles.container}>
			<ThemedText style={styles.title}>Activity</ThemedText>
			<ThemedText style={styles.count}>
				{pastMonthCount} workout {sessionWord} completed in the past month
			</ThemedText>

			<ThemedView style={styles.card}>
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					<View style={styles.internal}>
						<View style={styles.monthsRow}>
							{monthLabels.map((month, index) => (
								<ThemedText
									key={`${month}-${index}`}
									style={styles.monthLabel}
								>
									{month}
								</ThemedText>
							))}
						</View>

						<View style={styles.gridContainer}>
							<View style={styles.daysColumn}>
								<ThemedText style={styles.dayLabel}>Mon</ThemedText>
								<ThemedText style={styles.dayLabel}>Wed</ThemedText>
								<ThemedText style={styles.dayLabel}>Fri</ThemedText>
							</View>

							<View style={styles.grid}>
								{Array.from({ length: HEATMAP_WEEKS }).map((_, colIndex) => (
									<View key={colIndex} style={styles.weekColumn}>
										{Array.from({ length: DAYS_PER_WEEK }).map((_, rowIndex) => {
											const cell = days[colIndex * DAYS_PER_WEEK + rowIndex];
											const backgroundColor = cell?.isFuture
												? "transparent"
												: getLevelColor(cell?.level ?? 0);
											return (
												<View
													key={rowIndex}
													style={[styles.square, { backgroundColor }]}
												/>
											);
										})}
									</View>
								))}
							</View>
						</View>
					</View>
				</ScrollView>

				<View style={styles.legendContainer}>
					<ThemedText style={styles.legendText}>Less</ThemedText>
					{([0, 1, 2, 3, 4] as HeatmapLevel[]).map((lvl) => (
						<View
							key={lvl}
							style={[styles.square, { backgroundColor: getLevelColor(lvl) }]}
						/>
					))}
					<ThemedText style={styles.legendText}>More</ThemedText>
				</View>
			</ThemedView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 24,
	},
	title: {
		fontSize: 22,
		fontWeight: "600",
		marginBottom: 4,
	},
	count: {
		fontSize: 14,
		color: "gray",
		marginBottom: 16,
	},
	card: {
		backgroundColor: "rgba(0,0,0,0.03)",
		borderRadius: 12,
		padding: 16,
		borderWidth: 1,
		borderColor: "rgba(0,0,0,0.05)",
	},
	internal: {
		paddingRight: 20,
	},
	monthsRow: {
		flexDirection: "row",
		marginLeft: 35,
		marginBottom: 8,
	},
	monthLabel: {
		fontSize: 10,
		color: "gray",
		width: 32,
		marginRight: 4,
	},
	gridContainer: {
		flexDirection: "row",
	},
	daysColumn: {
		width: 35,
		justifyContent: "space-between",
		paddingVertical: 2,
		height: 110,
	},
	dayLabel: {
		fontSize: 10,
		color: "gray",
	},
	grid: {
		flexDirection: "row",
		gap: 3,
	},
	weekColumn: {
		flexDirection: "column",
		gap: 3,
	},
	square: {
		width: 12,
		height: 12,
		borderRadius: 2,
	},
	legendContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-end",
		marginTop: 16,
		gap: 4,
	},
	legendText: {
		fontSize: 11,
		color: "gray",
		marginHorizontal: 4,
	},
});
