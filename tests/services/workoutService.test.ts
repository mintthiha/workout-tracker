jest.mock("@/src/lib/firebase", () => ({ db: {} }));
jest.mock("firebase/firestore", () => ({}));

import {
	calculateTotalVolume,
	detectPersonalRecords,
	formatDuration,
} from "@/src/services/workoutService";
import { LoggedExercise, LoggedSet, WorkoutLog } from "@/src/types/workout";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeSet(overrides: Partial<LoggedSet> = {}): LoggedSet {
	return {
		targetReps: 5,
		targetWeight: 135,
		actualReps: 5,
		actualWeight: 135,
		completed: true,
		isPersonalRecord: false,
		...overrides,
	};
}

function makeLog(exerciseId: string, sets: LoggedSet[]): WorkoutLog {
	return {
		id: "past-log",
		templateName: "Push Day",
		startedAt: Date.now() - 3_600_000,
		completedAt: Date.now(),
		durationSeconds: 3600,
		exercises: [{ exerciseId, exerciseName: "Bench Press", sets }],
		totalVolumeLbs: 0,
		personalRecords: 0,
	};
}

// ─── detectPersonalRecords ────────────────────────────────────────────────────

describe("detectPersonalRecords", () => {
	it("marks a set as a PR when there is no prior history", () => {
		const sets = [makeSet({ actualWeight: 225, actualReps: 5 })];

		const result = detectPersonalRecords("bench", sets, []);

		expect(result[0].isPersonalRecord).toBe(true);
	});

	it("marks a set as PR when its e1RM exceeds the prior best — even if prior volume was higher", () => {
		// Prior: 100 × 12 — high volume but low e1RM (~140 lb)
		// Current: 225 × 5 — e1RM ≈ 262.5 lb
		const pastLogs = [makeLog("bench", [makeSet({ actualWeight: 100, actualReps: 12 })])];
		const sets = [makeSet({ actualWeight: 225, actualReps: 5 })];

		const result = detectPersonalRecords("bench", sets, pastLogs);

		expect(result[0].isPersonalRecord).toBe(true);
	});

	it("does not mark as PR when the e1RM is below the prior best", () => {
		// Prior: 225 × 5 — e1RM ≈ 262.5 lb
		// Current: 100 × 12 — e1RM ≈ 140 lb
		const pastLogs = [makeLog("bench", [makeSet({ actualWeight: 225, actualReps: 5 })])];
		const sets = [makeSet({ actualWeight: 100, actualReps: 12 })];

		const result = detectPersonalRecords("bench", sets, pastLogs);

		expect(result[0].isPersonalRecord).toBe(false);
	});

	it("does not mark incomplete sets as PRs", () => {
		const sets = [makeSet({ actualWeight: 300, actualReps: 5, completed: false })];

		const result = detectPersonalRecords("bench", sets, []);

		expect(result[0].isPersonalRecord).toBe(false);
	});

	it("does not mark sets with zero reps as PRs", () => {
		const sets = [makeSet({ actualWeight: 300, actualReps: 0 })];

		const result = detectPersonalRecords("bench", sets, []);

		expect(result[0].isPersonalRecord).toBe(false);
	});

	it("populates estimatedOneRepMax on completed sets with valid data", () => {
		const sets = [makeSet({ actualWeight: 200, actualReps: 5 })];

		const result = detectPersonalRecords("bench", sets, []);

		expect(result[0].estimatedOneRepMax).toBeCloseTo(200 * (1 + 5 / 30));
	});

	it("leaves estimatedOneRepMax undefined on incomplete sets", () => {
		const sets = [makeSet({ actualWeight: 200, actualReps: 5, completed: false })];

		const result = detectPersonalRecords("bench", sets, []);

		expect(result[0].estimatedOneRepMax).toBeUndefined();
	});

	it("uses the Brzycki formula when specified", () => {
		const sets = [makeSet({ actualWeight: 200, actualReps: 5 })];

		const result = detectPersonalRecords("bench", sets, [], "brzycki");

		expect(result[0].estimatedOneRepMax).toBeCloseTo((200 * 36) / (37 - 5));
	});

	it("ignores history from a different exercise ID", () => {
		const pastLogs = [makeLog("squat", [makeSet({ actualWeight: 400, actualReps: 1 })])];
		const sets = [makeSet({ actualWeight: 135, actualReps: 5 })];

		const result = detectPersonalRecords("bench", sets, pastLogs);

		expect(result[0].isPersonalRecord).toBe(true);
	});

	it("ignores incomplete sets in the history when finding the prior best", () => {
		const pastLogs = [
			makeLog("bench", [makeSet({ actualWeight: 300, actualReps: 5, completed: false })]),
		];
		const sets = [makeSet({ actualWeight: 100, actualReps: 5 })];

		const result = detectPersonalRecords("bench", sets, pastLogs);

		expect(result[0].isPersonalRecord).toBe(true);
	});

	it("finds the best e1RM across multiple past logs", () => {
		const pastLogs = [
			makeLog("bench", [makeSet({ actualWeight: 185, actualReps: 5 })]),
			makeLog("bench", [makeSet({ actualWeight: 225, actualReps: 5 })]),
		];
		// Current set does not beat 225 × 5
		const sets = [makeSet({ actualWeight: 200, actualReps: 5 })];

		const result = detectPersonalRecords("bench", sets, pastLogs);

		expect(result[0].isPersonalRecord).toBe(false);
	});
});

// ─── calculateTotalVolume ─────────────────────────────────────────────────────

describe("calculateTotalVolume", () => {
	it("sums weight × reps for all completed sets across exercises", () => {
		const exercises: LoggedExercise[] = [
			{
				exerciseId: "bench",
				exerciseName: "Bench Press",
				sets: [
					makeSet({ actualWeight: 135, actualReps: 5 }), // 675
					makeSet({ actualWeight: 155, actualReps: 3 }), // 465
					makeSet({ actualWeight: 0, actualReps: 0, completed: false }), // excluded
				],
			},
		];

		expect(calculateTotalVolume(exercises)).toBe(1140);
	});

	it("returns 0 for an empty exercise list", () => {
		expect(calculateTotalVolume([])).toBe(0);
	});

	it("returns 0 when all sets are incomplete", () => {
		const exercises: LoggedExercise[] = [
			{
				exerciseId: "squat",
				exerciseName: "Squat",
				sets: [makeSet({ completed: false })],
			},
		];

		expect(calculateTotalVolume(exercises)).toBe(0);
	});
});

// ─── formatDuration ───────────────────────────────────────────────────────────

describe("formatDuration", () => {
	it("formats sub-hour durations as minutes only", () => {
		expect(formatDuration(60)).toBe("1min");
		expect(formatDuration(2700)).toBe("45min");
	});

	it("formats durations of exactly one hour", () => {
		expect(formatDuration(3600)).toBe("1h 0min");
	});

	it("formats multi-hour durations with hours and minutes", () => {
		expect(formatDuration(3900)).toBe("1h 5min");
		expect(formatDuration(7380)).toBe("2h 3min");
	});

	it("formats zero seconds as 0min", () => {
		expect(formatDuration(0)).toBe("0min");
	});
});
