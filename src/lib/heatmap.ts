// ─── Heatmap ──────────────────────────────────────────────────────────────────
// Pure data shaping for the profile activity heatmap. Buckets workout logs into
// per-day intensity levels matching the GitHub-style contribution grid.

import { WorkoutLog } from "@/src/types/workout";

export const HEATMAP_WEEKS = 53;
export const DAYS_PER_WEEK = 7;
export const HEATMAP_TOTAL_DAYS = HEATMAP_WEEKS * DAYS_PER_WEEK;
export const PAST_MONTH_DAYS = 30;

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatmapDay {
	date: Date;
	workoutCount: number;
	completedSets: number;
	totalVolumeLbs: number;
	level: HeatmapLevel;
	isFuture: boolean;
}

const MONTH_ABBREVIATIONS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

/** Returns midnight in local time for the given date — used to compare days without time-of-day noise. */
function startOfLocalDay(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Local-time YYYY-MM-DD key — used as a stable lookup key for per-day aggregation. */
function localDayKey(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

/** Day of week with Monday=0..Sunday=6, matching the grid's top-to-bottom row order. */
function mondayFirstDayOfWeek(date: Date): number {
	return (date.getDay() + 6) % 7;
}

/** Counts the completed (logged) sets in a single workout log. */
function completedSetCount(log: WorkoutLog): number {
	return log.exercises.reduce(
		(total, exercise) => total + exercise.sets.filter((set) => set.completed).length,
		0,
	);
}

export interface MonthGridCell {
	date: Date | null; // null for padding cells outside the month
	workoutCount: number;
	completedSets: number;
	totalVolumeLbs: number;
	level: HeatmapLevel;
}

/** GitHub-style green for an intensity level; level 0 is the empty-cell grey. */
export function getLevelColor(level: HeatmapLevel): string {
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

/** Maps a day's completed-set count to a 0–4 intensity bucket for color rendering. */
export function intensityLevelFromSets(sets: number): HeatmapLevel {
	if (sets <= 0) return 0;
	if (sets <= 5) return 1;
	if (sets <= 10) return 2;
	if (sets <= 15) return 3;
	return 4;
}

/** Buckets workout logs into a 53×7 grid of per-day intensity ending on the reference date. */
export function bucketLogsByDay(
	logs: WorkoutLog[],
	referenceDate: Date = new Date(),
): HeatmapDay[] {
	const aggregateByDay = new Map<
		string,
		{ workoutCount: number; completedSets: number; totalVolumeLbs: number }
	>();

	for (const log of logs) {
		const completedDate = new Date(log.completedAt);
		const key = localDayKey(completedDate);
		const existing = aggregateByDay.get(key) ?? {
			workoutCount: 0,
			completedSets: 0,
			totalVolumeLbs: 0,
		};
		aggregateByDay.set(key, {
			workoutCount: existing.workoutCount + 1,
			completedSets: existing.completedSets + completedSetCount(log),
			totalVolumeLbs: existing.totalVolumeLbs + (log.totalVolumeLbs ?? 0),
		});
	}

	const today = startOfLocalDay(referenceDate);
	const todayDayOfWeek = mondayFirstDayOfWeek(today);
	const lastColumnIndex = HEATMAP_WEEKS - 1;
	const todayGridIndex = lastColumnIndex * DAYS_PER_WEEK + todayDayOfWeek;

	const gridStart = new Date(today);
	gridStart.setDate(gridStart.getDate() - todayGridIndex);

	const days: HeatmapDay[] = [];
	for (let cellIndex = 0; cellIndex < HEATMAP_TOTAL_DAYS; cellIndex++) {
		const cellDate = new Date(gridStart);
		cellDate.setDate(cellDate.getDate() + cellIndex);
		const isFuture = cellDate.getTime() > today.getTime();
		const bucket = aggregateByDay.get(localDayKey(cellDate));

		days.push({
			date: cellDate,
			workoutCount: bucket?.workoutCount ?? 0,
			completedSets: bucket?.completedSets ?? 0,
			totalVolumeLbs: bucket?.totalVolumeLbs ?? 0,
			level: isFuture ? 0 : intensityLevelFromSets(bucket?.completedSets ?? 0),
			isFuture,
		});
	}

	return days;
}

/** Counts workouts completed within the trailing window (default 30 days) ending on the reference date. */
export function countWorkoutsInPastDays(
	logs: WorkoutLog[],
	days: number = PAST_MONTH_DAYS,
	referenceDate: Date = new Date(),
): number {
	const cutoff = startOfLocalDay(referenceDate).getTime() - (days - 1) * 24 * 60 * 60 * 1000;
	const endOfReferenceDay =
		startOfLocalDay(referenceDate).getTime() + 24 * 60 * 60 * 1000 - 1;
	return logs.filter(
		(log) => log.completedAt >= cutoff && log.completedAt <= endOfReferenceDay,
	).length;
}

/** Returns 12 month abbreviations ending at the reference date's month, oldest first — for the heatmap's months row. */
export function getHeatmapMonthLabels(referenceDate: Date = new Date()): string[] {
	const labels: string[] = [];
	for (let offset = 11; offset >= 0; offset--) {
		const monthDate = new Date(
			referenceDate.getFullYear(),
			referenceDate.getMonth() - offset,
			1,
		);
		labels.push(MONTH_ABBREVIATIONS[monthDate.getMonth()]);
	}
	return labels;
}

/** Builds a per-day aggregate map from a list of workout logs, keyed by local YYYY-MM-DD. */
function buildDayAggregate(
	logs: WorkoutLog[],
): Map<string, { workoutCount: number; completedSets: number; totalVolumeLbs: number }> {
	const map = new Map<
		string,
		{ workoutCount: number; completedSets: number; totalVolumeLbs: number }
	>();
	for (const log of logs) {
		const key = localDayKey(new Date(log.completedAt));
		const existing = map.get(key) ?? { workoutCount: 0, completedSets: 0, totalVolumeLbs: 0 };
		map.set(key, {
			workoutCount: existing.workoutCount + 1,
			completedSets: existing.completedSets + completedSetCount(log),
			totalVolumeLbs: existing.totalVolumeLbs + (log.totalVolumeLbs ?? 0),
		});
	}
	return map;
}

/**
 * Returns a 2-D array (rows = weeks, cols = Mon–Sun) for the given month.
 * Padding cells at the start/end of the first and last week have date = null.
 */
export function getMonthGridDays(
	logs: WorkoutLog[],
	year: number,
	month: number, // 0-based
	referenceDate: Date = new Date(),
): MonthGridCell[][] {
	const aggregateByDay = buildDayAggregate(logs);
	const today = startOfLocalDay(referenceDate);
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const firstDayOfMonth = new Date(year, month, 1);
	const startDayOfWeek = mondayFirstDayOfWeek(firstDayOfMonth);
	const rowCount = Math.ceil((startDayOfWeek + daysInMonth) / DAYS_PER_WEEK);

	const grid: MonthGridCell[][] = [];
	for (let row = 0; row < rowCount; row++) {
		const week: MonthGridCell[] = [];
		for (let col = 0; col < DAYS_PER_WEEK; col++) {
			const dayNumber = row * DAYS_PER_WEEK + col - startDayOfWeek + 1;
			if (dayNumber < 1 || dayNumber > daysInMonth) {
				week.push({ date: null, workoutCount: 0, completedSets: 0, totalVolumeLbs: 0, level: 0 });
			} else {
				const cellDate = new Date(year, month, dayNumber);
				const isFuture = cellDate.getTime() > today.getTime();
				const bucket = aggregateByDay.get(localDayKey(cellDate));
				week.push({
					date: cellDate,
					workoutCount: bucket?.workoutCount ?? 0,
					completedSets: bucket?.completedSets ?? 0,
					totalVolumeLbs: bucket?.totalVolumeLbs ?? 0,
					level: isFuture ? 0 : intensityLevelFromSets(bucket?.completedSets ?? 0),
				});
			}
		}
		grid.push(week);
	}

	return grid;
}

/** Counts workouts whose completedAt falls within the given calendar month. */
export function countWorkoutsInMonth(
	logs: WorkoutLog[],
	year: number,
	month: number, // 0-based
): number {
	const startMs = new Date(year, month, 1).getTime();
	const endMs = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
	return logs.filter((log) => log.completedAt >= startMs && log.completedAt <= endMs).length;
}

/** Full month name for display in the month-view navigation header. */
export function getMonthName(month: number): string {
	return [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	][month];
}
