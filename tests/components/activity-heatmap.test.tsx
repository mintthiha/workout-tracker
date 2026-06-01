import { render, screen } from "@testing-library/react-native";

import { ActivityHeatmap } from "@/components/profile/ActivityHeatmap";
import { WorkoutLog } from "@/src/types/workout";

jest.mock("@/hooks/use-theme-color", () => ({
	useThemeColor: jest.fn(() => "#123456"),
}));

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const REFERENCE_DATE = new Date(2026, 4, 31);

function makeLog(completedAt: number, completedSetCount: number): WorkoutLog {
	return {
		id: `log-${completedAt}`,
		templateName: "Push Day",
		startedAt: completedAt - 60 * 60 * 1000,
		completedAt,
		durationSeconds: 3600,
		totalVolumeLbs: 1000,
		personalRecords: 0,
		exercises: [
			{
				exerciseId: "bench",
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
	};
}

describe("ActivityHeatmap", () => {
	it("renders the zero-count message when there are no logs", () => {
		render(<ActivityHeatmap logs={[]} referenceDate={REFERENCE_DATE} />);

		expect(screen.getByText("Activity")).toBeTruthy();
		expect(
			screen.getByText("0 workout sessions completed in the past month"),
		).toBeTruthy();
	});

	it("singularizes the count message when exactly one workout falls in the past month", () => {
		const logs = [makeLog(REFERENCE_DATE.getTime() - 3 * ONE_DAY_MS, 4)];

		render(<ActivityHeatmap logs={logs} referenceDate={REFERENCE_DATE} />);

		expect(
			screen.getByText("1 workout session completed in the past month"),
		).toBeTruthy();
	});

	it("counts only the workouts within the past 30 days", () => {
		const logs = [
			makeLog(REFERENCE_DATE.getTime(), 4),
			makeLog(REFERENCE_DATE.getTime() - 10 * ONE_DAY_MS, 4),
			makeLog(REFERENCE_DATE.getTime() - 45 * ONE_DAY_MS, 4),
		];

		render(<ActivityHeatmap logs={logs} referenceDate={REFERENCE_DATE} />);

		expect(
			screen.getByText("2 workout sessions completed in the past month"),
		).toBeTruthy();
	});

	it("renders the day-of-week and month axis labels", () => {
		render(<ActivityHeatmap logs={[]} referenceDate={REFERENCE_DATE} />);

		expect(screen.getByText("Mon")).toBeTruthy();
		expect(screen.getByText("Wed")).toBeTruthy();
		expect(screen.getByText("Fri")).toBeTruthy();
		expect(screen.getAllByText("May").length).toBeGreaterThan(0);
		expect(screen.getByText("Less")).toBeTruthy();
		expect(screen.getByText("More")).toBeTruthy();
	});
});
