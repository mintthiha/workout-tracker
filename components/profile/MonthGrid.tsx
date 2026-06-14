import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { getLevelColor, HeatmapLevel, MonthGridCell } from "@/src/lib/heatmap";

interface MonthGridProps {
	grid: MonthGridCell[][];
}

const DAY_HEADERS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/** Returns a legible text color for a day number rendered on top of the given intensity level. */
function getDayNumberColor(level: HeatmapLevel): string {
	if (level === 0) return "#9e9e9e";
	if (level <= 2) return "#1a5c2e";
	return "#ffffff";
}

/** Monthly calendar grid — one row per week, columns Mon–Sun, cells colored by workout intensity. */
export function MonthGrid({ grid }: MonthGridProps) {
	return (
		<View style={styles.container}>
			<View style={styles.headerRow}>
				{DAY_HEADERS.map((dayLabel) => (
					<View key={dayLabel} style={styles.headerCell}>
						<ThemedText style={styles.headerText}>{dayLabel}</ThemedText>
					</View>
				))}
			</View>

			{grid.map((week, rowIndex) => (
				<View key={rowIndex} style={styles.weekRow}>
					{week.map((cell, colIndex) => {
						if (cell.date === null) {
							return <View key={colIndex} style={[styles.cell, styles.emptyCell]} />;
						}
						const backgroundColor = getLevelColor(cell.level);
						const textColor = getDayNumberColor(cell.level);
						return (
							<View
								key={colIndex}
								style={[styles.cell, { backgroundColor }]}
							>
								<ThemedText style={[styles.dayNumber, { color: textColor }]}>
									{cell.date.getDate()}
								</ThemedText>
							</View>
						);
					})}
				</View>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: 4,
	},
	headerRow: {
		flexDirection: "row",
		gap: 4,
		marginBottom: 2,
	},
	headerCell: {
		flex: 1,
		alignItems: "center",
	},
	headerText: {
		fontSize: 11,
		color: "gray",
		fontWeight: "600",
	},
	weekRow: {
		flexDirection: "row",
		gap: 4,
	},
	cell: {
		flex: 1,
		aspectRatio: 1,
		borderRadius: 6,
		alignItems: "center",
		justifyContent: "center",
	},
	emptyCell: {
		backgroundColor: "transparent",
	},
	dayNumber: {
		fontSize: 12,
		fontWeight: "600",
	},
});
