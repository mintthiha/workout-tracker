import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { MonthGrid } from "@/components/profile/MonthGrid";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
	bucketLogsByDay,
	countWorkoutsInMonth,
	countWorkoutsInPastDays,
	DAYS_PER_WEEK,
	getLevelColor,
	getHeatmapMonthLabels,
	getMonthGridDays,
	getMonthName,
	HEATMAP_WEEKS,
	HeatmapLevel,
} from "@/src/lib/heatmap";
import { WorkoutLog } from "@/src/types/workout";

type ViewMode = "year" | "month";

interface ActivityHeatmapProps {
	logs: WorkoutLog[];
	referenceDate?: Date;
}

/** Profile activity heatmap with a Year / Month toggle. Defaults to monthly view. */
export function ActivityHeatmap({ logs, referenceDate }: ActivityHeatmapProps) {
	const today = referenceDate ?? new Date();
	const [viewMode, setViewMode] = useState<ViewMode>("month");
	const [viewYear, setViewYear] = useState(today.getFullYear());
	const [viewMonth, setViewMonth] = useState(today.getMonth());

	// ─── Year view data ───────────────────────────────────────────────────────
	const yearDays = useMemo(
		() => (viewMode === "year" ? bucketLogsByDay(logs, today) : []),
		[viewMode, logs, today],
	);
	const pastMonthCount = useMemo(
		() => countWorkoutsInPastDays(logs, undefined, today),
		[logs, today],
	);
	const monthLabels = useMemo(() => getHeatmapMonthLabels(today), [today]);

	// ─── Month view data ──────────────────────────────────────────────────────
	const monthGrid = useMemo(
		() => (viewMode === "month" ? getMonthGridDays(logs, viewYear, viewMonth, today) : []),
		[viewMode, logs, viewYear, viewMonth, today],
	);
	const monthCount = useMemo(
		() => countWorkoutsInMonth(logs, viewYear, viewMonth),
		[logs, viewYear, viewMonth],
	);

	// ─── Month navigation ─────────────────────────────────────────────────────
	const isCurrentMonth =
		viewYear === today.getFullYear() && viewMonth === today.getMonth();

	function goToPreviousMonth() {
		if (viewMonth === 0) {
			setViewYear((y) => y - 1);
			setViewMonth(11);
		} else {
			setViewMonth((m) => m - 1);
		}
	}

	function goToNextMonth() {
		if (isCurrentMonth) return;
		if (viewMonth === 11) {
			setViewYear((y) => y + 1);
			setViewMonth(0);
		} else {
			setViewMonth((m) => m + 1);
		}
	}

	// ─── Subtitle text ────────────────────────────────────────────────────────
	const subtitleText =
		viewMode === "year"
			? `${pastMonthCount} workout ${pastMonthCount === 1 ? "session" : "sessions"} completed in the past month`
			: `${monthCount} workout ${monthCount === 1 ? "session" : "sessions"} in ${getMonthName(viewMonth)} ${viewYear}`;

	return (
		<ThemedView style={styles.container}>
			<View style={styles.titleRow}>
				<ThemedText style={styles.title}>Activity</ThemedText>
				<View style={styles.toggle}>
					<TouchableOpacity
						style={[styles.toggleBtn, viewMode === "month" && styles.toggleBtnActive]}
						onPress={() => setViewMode("month")}
					>
						<ThemedText
							style={[
								styles.toggleLabel,
								viewMode === "month" && styles.toggleLabelActive,
							]}
						>
							Month
						</ThemedText>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.toggleBtn, viewMode === "year" && styles.toggleBtnActive]}
						onPress={() => setViewMode("year")}
					>
						<ThemedText
							style={[
								styles.toggleLabel,
								viewMode === "year" && styles.toggleLabelActive,
							]}
						>
							Year
						</ThemedText>
					</TouchableOpacity>
				</View>
			</View>

			<ThemedText style={styles.count}>{subtitleText}</ThemedText>

			<ThemedView style={styles.card}>
				{viewMode === "month" ? (
					<>
						<View style={styles.monthNav}>
							<TouchableOpacity onPress={goToPreviousMonth} style={styles.navBtn}>
								<ThemedText style={styles.navArrow}>‹</ThemedText>
							</TouchableOpacity>
							<ThemedText style={styles.monthNavLabel}>
								{getMonthName(viewMonth)} {viewYear}
							</ThemedText>
							<TouchableOpacity
								onPress={goToNextMonth}
								style={styles.navBtn}
								disabled={isCurrentMonth}
							>
								<ThemedText
									style={[styles.navArrow, isCurrentMonth && styles.navArrowDisabled]}
								>
									›
								</ThemedText>
							</TouchableOpacity>
						</View>

						<MonthGrid grid={monthGrid} />
					</>
				) : (
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
											{Array.from({ length: DAYS_PER_WEEK }).map(
												(_, rowIndex) => {
													const cell =
														yearDays[colIndex * DAYS_PER_WEEK + rowIndex];
													const backgroundColor = cell?.isFuture
														? "transparent"
														: getLevelColor(cell?.level ?? 0);
													return (
														<View
															key={rowIndex}
															style={[
																styles.square,
																{ backgroundColor },
															]}
														/>
													);
												},
											)}
										</View>
									))}
								</View>
							</View>
						</View>
					</ScrollView>
				)}

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
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 4,
	},
	title: {
		fontSize: 22,
		fontWeight: "600",
	},
	toggle: {
		flexDirection: "row",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "rgba(0,0,0,0.1)",
		overflow: "hidden",
	},
	toggleBtn: {
		paddingHorizontal: 12,
		paddingVertical: 5,
	},
	toggleBtnActive: {
		backgroundColor: "rgba(0,0,0,0.08)",
	},
	toggleLabel: {
		fontSize: 13,
		color: "gray",
	},
	toggleLabelActive: {
		color: "#216e39",
		fontWeight: "600",
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
	// ─── Month nav ────────────────────────────────────────────────────────────
	monthNav: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 12,
	},
	navBtn: {
		padding: 4,
	},
	navArrow: {
		fontSize: 22,
		lineHeight: 26,
		color: "#216e39",
		fontWeight: "600",
	},
	navArrowDisabled: {
		color: "#ccc",
	},
	monthNavLabel: {
		fontSize: 15,
		fontWeight: "600",
	},
	// ─── Year grid ────────────────────────────────────────────────────────────
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
	// ─── Legend ───────────────────────────────────────────────────────────────
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
