import {
	buildSegments,
	REPS,
	resolveSegmentState,
	REST_DURATION,
	SETS,
	totalDuration,
	WORK_DURATION,
} from "@/utils/timer/timerConstants";

describe("timerConstants", () => {
	it("builds alternating work and rest segments for every rep in every set", () => {
		const segments = buildSegments();

		expect(segments).toHaveLength(SETS * REPS * 2);
		expect(segments[0]).toEqual({ type: "work", duration: WORK_DURATION });
		expect(segments[1]).toEqual({ type: "rest", duration: REST_DURATION });
		expect(segments.at(-2)).toEqual({ type: "work", duration: WORK_DURATION });
		expect(segments.at(-1)).toEqual({ type: "rest", duration: REST_DURATION });
	});

	it("resolves the current segment and remaining seconds from elapsed time", () => {
		const segments = buildSegments();

		expect(resolveSegmentState(0, segments)).toEqual({
			segmentIndex: 0,
			secondsRemaining: WORK_DURATION,
		});
		expect(resolveSegmentState(WORK_DURATION, segments)).toEqual({
			segmentIndex: 1,
			secondsRemaining: REST_DURATION,
		});
		expect(resolveSegmentState(WORK_DURATION + REST_DURATION - 1, segments)).toEqual({
			segmentIndex: 1,
			secondsRemaining: 1,
		});
	});

	it("returns null once elapsed time exceeds the full timer duration", () => {
		const segments = buildSegments();

		expect(resolveSegmentState(totalDuration(segments), segments)).toBeNull();
	});
});
