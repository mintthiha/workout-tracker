import {
	bucketLogsByDay,
	countWorkoutsInMonth,
	countWorkoutsInPastDays,
	DAYS_PER_WEEK,
	getHeatmapMonthLabels,
	getMonthGridDays,
	getMonthName,
	HEATMAP_TOTAL_DAYS,
	HEATMAP_WEEKS,
	intensityLevelFromSets,
} from "@/src/lib/heatmap";
import { WorkoutLog } from "@/src/types/workout";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function makeLog(overrides: Partial<WorkoutLog> & { completedAt: number }): WorkoutLog {
	const base: WorkoutLog = {
		id: `log-${overrides.completedAt}`,
		templateName: "Push Day",
		startedAt: overrides.completedAt - 60 * 60 * 1000,
		completedAt: overrides.completedAt,
		durationSeconds: 3600,
		exercises: [],
		totalVolumeLbs: 0,
		personalRecords: 0,
	};
	return { ...base, ...overrides };
}

function makeLogWithCompletedSets(completedAt: number, completedSetCount: number): WorkoutLog {
	return makeLog({
		completedAt,
		exercises: [
			{
				exerciseId: "bench-press",
				exerciseName: "Bench Press",
				sets: Array.from({ length: completedSetCount }).map(() => ({
					targetReps: 5,
					targetWeight: 135,
					actualReps: 5,
					actualWeight: 135,
					completed: true,
					isPersonalRecord: false,
				})),
			},
		],
	});
}

describe("intensityLevelFromSets", () => {
	it("returns 0 for zero or negative set counts", () => {
		expect(intensityLevelFromSets(0)).toBe(0);
		expect(intensityLevelFromSets(-3)).toBe(0);
	});

	it("maps low set counts to level 1", () => {
		expect(intensityLevelFromSets(1)).toBe(1);
		expect(intensityLevelFromSets(5)).toBe(1);
	});

	it("maps moderate set counts to level 2", () => {
		expect(intensityLevelFromSets(6)).toBe(2);
		expect(intensityLevelFromSets(10)).toBe(2);
	});

	it("maps high set counts to level 3", () => {
		expect(intensityLevelFromSets(11)).toBe(3);
		expect(intensityLevelFromSets(15)).toBe(3);
	});

	it("maps very high set counts to level 4", () => {
		expect(intensityLevelFromSets(16)).toBe(4);
		expect(intensityLevelFromSets(100)).toBe(4);
	});
});

describe("bucketLogsByDay", () => {
	const referenceDate = new Date(2026, 4, 31); // 2026-05-31, a Sunday

	it("returns a fully-sized grid of empty cells when there are no logs", () => {
		const days = bucketLogsByDay([], referenceDate);

		expect(days).toHaveLength(HEATMAP_TOTAL_DAYS);
		expect(days.every((day) => day.level === 0)).toBe(true);
		expect(days.every((day) => day.workoutCount === 0)).toBe(true);
	});

	it("places the reference date in the final grid cell when it falls on a Sunday", () => {
		const days = bucketLogsByDay([], referenceDate);
		const lastCell = days[HEATMAP_TOTAL_DAYS - 1];

		expect(lastCell.date.getFullYear()).toBe(2026);
		expect(lastCell.date.getMonth()).toBe(4);
		expect(lastCell.date.getDate()).toBe(31);
		expect(lastCell.isFuture).toBe(false);
	});

	it("marks cells that follow the reference date as future", () => {
		const tuesdayReference = new Date(2026, 4, 26); // 2026-05-26 is a Tuesday
		const days = bucketLogsByDay([], tuesdayReference);
		const futureCells = days.filter((day) => day.isFuture);

		// Tuesday → 5 trailing cells (Wed–Sun) in the final column should be future.
		expect(futureCells).toHaveLength(5);
		expect(days[HEATMAP_TOTAL_DAYS - 1].isFuture).toBe(true);
	});

	it("aggregates completed sets and volume for multiple logs on the same day", () => {
		const sameDay = referenceDate.getTime();
		const logs: WorkoutLog[] = [
			makeLogWithCompletedSets(sameDay, 4),
			{ ...makeLogWithCompletedSets(sameDay, 3), id: "second-log", totalVolumeLbs: 2000 },
		];

		const days = bucketLogsByDay(logs, referenceDate);
		const todayCell = days[HEATMAP_TOTAL_DAYS - 1];

		expect(todayCell.workoutCount).toBe(2);
		expect(todayCell.completedSets).toBe(7);
		expect(todayCell.totalVolumeLbs).toBe(2000);
		expect(todayCell.level).toBe(2);
	});

	it("ignores incomplete sets when computing intensity", () => {
		const log = makeLog({
			completedAt: referenceDate.getTime(),
			exercises: [
				{
					exerciseId: "squat",
					exerciseName: "Squat",
					sets: [
						{
							targetReps: 5,
							targetWeight: 225,
							actualReps: 5,
							actualWeight: 225,
							completed: true,
							isPersonalRecord: false,
						},
						{
							targetReps: 5,
							targetWeight: 225,
							actualReps: 0,
							actualWeight: 0,
							completed: false,
							isPersonalRecord: false,
						},
					],
				},
			],
		});

		const days = bucketLogsByDay([log], referenceDate);
		const todayCell = days[HEATMAP_TOTAL_DAYS - 1];

		expect(todayCell.completedSets).toBe(1);
		expect(todayCell.level).toBe(1);
	});

	it("does not bucket logs older than the grid window", () => {
		const ancientLog = makeLogWithCompletedSets(
			referenceDate.getTime() - HEATMAP_TOTAL_DAYS * ONE_DAY_MS * 2,
			10,
		);

		const days = bucketLogsByDay([ancientLog], referenceDate);

		expect(days.every((day) => day.workoutCount === 0)).toBe(true);
	});

	it("places a log from yesterday in the correct grid cell", () => {
		const yesterday = new Date(2026, 4, 30).getTime();
		const log = makeLogWithCompletedSets(yesterday, 12);

		const days = bucketLogsByDay([log], referenceDate);
		const yesterdayCell = days[HEATMAP_TOTAL_DAYS - 2];

		expect(yesterdayCell.completedSets).toBe(12);
		expect(yesterdayCell.level).toBe(3);
		expect(yesterdayCell.date.getDate()).toBe(30);
	});

	it("produces exactly HEATMAP_WEEKS columns of DAYS_PER_WEEK rows", () => {
		const days = bucketLogsByDay([], referenceDate);

		expect(HEATMAP_WEEKS * DAYS_PER_WEEK).toBe(HEATMAP_TOTAL_DAYS);
		expect(days).toHaveLength(HEATMAP_WEEKS * DAYS_PER_WEEK);
	});
});

describe("countWorkoutsInPastDays", () => {
	const referenceDate = new Date(2026, 4, 31);

	it("counts logs within the trailing 30-day window", () => {
		const logs = [
			makeLog({ completedAt: referenceDate.getTime() }),
			makeLog({ completedAt: referenceDate.getTime() - 5 * ONE_DAY_MS }),
			makeLog({ completedAt: referenceDate.getTime() - 25 * ONE_DAY_MS }),
		];

		expect(countWorkoutsInPastDays(logs, 30, referenceDate)).toBe(3);
	});

	it("excludes logs older than the window", () => {
		const logs = [
			makeLog({ completedAt: referenceDate.getTime() }),
			makeLog({ completedAt: referenceDate.getTime() - 45 * ONE_DAY_MS }),
		];

		expect(countWorkoutsInPastDays(logs, 30, referenceDate)).toBe(1);
	});

	it("returns 0 when there are no logs", () => {
		expect(countWorkoutsInPastDays([], 30, referenceDate)).toBe(0);
	});

	it("honors a custom window length", () => {
		const logs = [
			makeLog({ completedAt: referenceDate.getTime() }),
			makeLog({ completedAt: referenceDate.getTime() - 5 * ONE_DAY_MS }),
		];

		expect(countWorkoutsInPastDays(logs, 3, referenceDate)).toBe(1);
	});
});

describe("getHeatmapMonthLabels", () => {
	it("returns 12 month abbreviations ending at the reference month", () => {
		const labels = getHeatmapMonthLabels(new Date(2026, 4, 31));

		expect(labels).toHaveLength(12);
		expect(labels[labels.length - 1]).toBe("May");
		expect(labels[0]).toBe("Jun");
	});

	it("wraps across the year boundary", () => {
		const labels = getHeatmapMonthLabels(new Date(2026, 0, 15));

		expect(labels[labels.length - 1]).toBe("Jan");
		expect(labels[0]).toBe("Feb");
	});
});

describe("getMonthGridDays", () => {
	// May 2026: starts on Friday (Mon=0 → Fri=4), 31 days → 5 rows
	const referenceDate = new Date(2026, 4, 31);

	it("returns 5 rows for May 2026", () => {
		const grid = getMonthGridDays([], 2026, 4, referenceDate);

		expect(grid).toHaveLength(5);
		expect(grid[0]).toHaveLength(7);
	});

	it("pads the first row correctly — May 1 falls in column 4 (Friday)", () => {
		const grid = getMonthGridDays([], 2026, 4, referenceDate);
		const firstRow = grid[0];

		expect(firstRow[0].date).toBeNull();
		expect(firstRow[1].date).toBeNull();
		expect(firstRow[2].date).toBeNull();
		expect(firstRow[3].date).toBeNull();
		expect(firstRow[4].date?.getDate()).toBe(1);
		expect(firstRow[5].date?.getDate()).toBe(2);
		expect(firstRow[6].date?.getDate()).toBe(3);
	});

	it("places May 31 in the last cell of the last row with level 0 for no workouts", () => {
		const grid = getMonthGridDays([], 2026, 4, referenceDate);
		const lastRow = grid[grid.length - 1];
		const may31 = lastRow.find((cell) => cell.date?.getDate() === 31);

		expect(may31).toBeDefined();
		expect(may31?.level).toBe(0);
	});

	it("assigns the correct intensity level to a day with logged sets", () => {
		const may15 = new Date(2026, 4, 15).getTime();
		const logs = [makeLogWithCompletedSets(may15, 12)];
		const grid = getMonthGridDays(logs, 2026, 4, referenceDate);

		const row2 = grid[2];
		const cell = row2.find((c) => c.date?.getDate() === 15);

		expect(cell?.completedSets).toBe(12);
		expect(cell?.level).toBe(3);
	});

	it("keeps future cells at level 0 when reference date is mid-month", () => {
		const midMonthReference = new Date(2026, 4, 15);
		const grid = getMonthGridDays([], 2026, 4, midMonthReference);

		const allDaysAfter15 = grid
			.flat()
			.filter((cell) => cell.date !== null && cell.date.getDate() > 15);

		expect(allDaysAfter15.every((cell) => cell.level === 0)).toBe(true);
	});

	it("returns 6 rows for a month that spans six weeks", () => {
		// January 2023 starts on Sunday (Mon=0 → Sun=6), 31 days → ceil((6+31)/7) = 6 rows
		const janReference = new Date(2023, 0, 31);
		const grid = getMonthGridDays([], 2023, 0, janReference);

		expect(grid).toHaveLength(6);
	});
});

describe("countWorkoutsInMonth", () => {
	it("counts only logs within the calendar month", () => {
		const inMay = [
			makeLog({ completedAt: new Date(2026, 4, 1).getTime() }),
			makeLog({ completedAt: new Date(2026, 4, 31).getTime() }),
		];
		const outOfMay = makeLog({ completedAt: new Date(2026, 5, 1).getTime() });

		expect(countWorkoutsInMonth([...inMay, outOfMay], 2026, 4)).toBe(2);
	});

	it("returns 0 for an empty log list", () => {
		expect(countWorkoutsInMonth([], 2026, 4)).toBe(0);
	});

	it("returns 0 when no logs fall in the target month", () => {
		const logs = [makeLog({ completedAt: new Date(2026, 3, 15).getTime() })];

		expect(countWorkoutsInMonth(logs, 2026, 4)).toBe(0);
	});
});

describe("getMonthName", () => {
	it("returns the full month name for a 0-based month index", () => {
		expect(getMonthName(0)).toBe("January");
		expect(getMonthName(4)).toBe("May");
		expect(getMonthName(11)).toBe("December");
	});
});
