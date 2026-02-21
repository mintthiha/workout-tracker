export const TIMER_TASK_NAME = "INTERVAL_TIMER_TASK";

export type SegmentType = "work" | "rest";

export interface Segment {
	type: SegmentType;
	duration: number; // seconds
}

export interface TimerConfig {
	startTime: number;
	segments: Segment[];
}

// Hardcoded values — these will become user-configurable later
export const WORK_DURATION = 10; // seconds
export const REST_DURATION = 20; // seconds
export const REPS = 3;
export const SETS = 2;

// Builds the flat segment list: [W, R, W, R, W, R, W, R, W, R, W, R]
export function buildSegments(): Segment[] {
	const segments: Segment[] = [];
	for (let s = 0; s < SETS; s++) {
		for (let r = 0; r < REPS; r++) {
			segments.push({ type: "work", duration: WORK_DURATION });
			segments.push({ type: "rest", duration: REST_DURATION });
		}
	}
	return segments;
}

// Given elapsed seconds and a segment list, returns the current segment index
// and seconds remaining in that segment
export function resolveSegmentState(
	elapsedSeconds: number,
	segments: Segment[],
): { segmentIndex: number; secondsRemaining: number } | null {
	let acc = 0;
	for (let i = 0; i < segments.length; i++) {
		const segEnd = acc + segments[i].duration;
		if (elapsedSeconds < segEnd) {
			const secondsRemaining = Math.ceil(segEnd - elapsedSeconds);
			return { segmentIndex: i, secondsRemaining };
		}
		acc = segEnd;
	}
	return null; // elapsed time exceeds total duration — timer is done
}

export function totalDuration(segments: Segment[]): number {
	return segments.reduce((sum, s) => sum + s.duration, 0);
}
