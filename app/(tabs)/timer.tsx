import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	AppState,
	AppStateStatus,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import {
	initAudio,
	playBeep,
	playStart,
	unloadAudio,
} from "../../utils/audioManager";
import {
	cancelBeepNotifications,
	hideOngoingNotification,
	scheduleBeepNotifications,
	showOngoingNotification,
} from "../../utils/notificationManager";
import {
	REPS,
	SETS,
	Segment,
	TimerConfig,
	buildSegments,
	resolveSegmentState,
	totalDuration,
} from "../../utils/timer/timerConstants";
import {
	clearTimerState,
	saveTimerState,
} from "../../utils/timer/timerStorage";

const SEGMENTS = buildSegments();
const TOTAL_DURATION = totalDuration(SEGMENTS);
const TOTAL_SEGMENTS = SEGMENTS.length;

export default function TimerScreen() {
	const [isRunning, setIsRunning] = useState(false);
	const [segmentIndex, setSegmentIndex] = useState(0);
	const [secondsRemaining, setSecondsRemaining] = useState(
		SEGMENTS[0].duration,
	);

	const startTimeRef = useRef<number | null>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const isRunningRef = useRef(false);
	const lastBeepRef = useRef(-1);
	const lastSegmentIndexRef = useRef(-1); // -1 so segment 0 triggers its start
	const appStateRef = useRef(AppState.currentState);

	useEffect(() => {
		initAudio();
		return () => {
			unloadAudio();
		};
	}, []);

	const stopTimer = useCallback(async () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		startTimeRef.current = null;
		isRunningRef.current = false;
		lastBeepRef.current = -1;
		lastSegmentIndexRef.current = -1;

		await clearTimerState();
		await cancelBeepNotifications();
		await hideOngoingNotification();

		setIsRunning(false);
		setSegmentIndex(0);
		setSecondsRemaining(SEGMENTS[0].duration);
	}, []);

	const stopTimerRef = useRef(stopTimer);
	useEffect(() => {
		stopTimerRef.current = stopTimer;
	}, [stopTimer]);

	const tick = useCallback(() => {
		const startTime = startTimeRef.current;
		if (!startTime) return;

		const elapsed = (Date.now() - startTime) / 1000;

		if (elapsed >= TOTAL_DURATION) {
			stopTimerRef.current();
			return;
		}

		const state = resolveSegmentState(elapsed, SEGMENTS);
		if (!state) {
			stopTimerRef.current();
			return;
		}

		const { segmentIndex: si, secondsRemaining: remaining } = state;

		setSegmentIndex(si);
		setSecondsRemaining(remaining);

		// Segment start sound — fires once per segment transition
		if (si !== lastSegmentIndexRef.current) {
			lastSegmentIndexRef.current = si;
			lastBeepRef.current = -1; // reset beep tracking for new segment
			playStart();
		}

		// Beep sounds at 3, 2, 1 seconds remaining
		if (remaining <= 3 && remaining >= 1 && remaining !== lastBeepRef.current) {
			lastBeepRef.current = remaining;
			playBeep();
		} else if (remaining > 3) {
			lastBeepRef.current = -1;
		}
	}, []);

	const tickRef = useRef(tick);
	useEffect(() => {
		tickRef.current = tick;
	}, [tick]);

	const startTimer = useCallback(async () => {
		const now = Date.now();
		startTimeRef.current = now;
		isRunningRef.current = true;
		lastBeepRef.current = -1;
		lastSegmentIndexRef.current = 0;

		const config: TimerConfig = { startTime: now, segments: SEGMENTS };
		await saveTimerState(config);

		setIsRunning(true);
		setSegmentIndex(0);
		setSecondsRemaining(SEGMENTS[0].duration);

		await playStart(); // first segment start sound

		intervalRef.current = setInterval(() => tickRef.current(), 500);
	}, []);

	// Foreground/background transitions
	useEffect(() => {
		const subscription = AppState.addEventListener(
			"change",
			async (nextState: AppStateStatus) => {
				const prevState = appStateRef.current;
				appStateRef.current = nextState;

				if (!isRunningRef.current || !startTimeRef.current) return;

				if (nextState === "background") {
					if (intervalRef.current) {
						clearInterval(intervalRef.current);
						intervalRef.current = null;
					}

					const config: TimerConfig = {
						startTime: startTimeRef.current,
						segments: SEGMENTS,
					};

					await scheduleBeepNotifications(config);
					await showOngoingNotification("Interval timer running");
				}

				if (nextState === "active" && prevState !== "active") {
					await cancelBeepNotifications();
					await hideOngoingNotification();

					const startTime = startTimeRef.current;
					if (!startTime) return;

					const elapsed = (Date.now() - startTime) / 1000;

					if (elapsed >= TOTAL_DURATION) {
						stopTimerRef.current();
						return;
					}

					const state = resolveSegmentState(elapsed, SEGMENTS);
					if (!state) {
						stopTimerRef.current();
						return;
					}

					const { segmentIndex: si, secondsRemaining: remaining } = state;
					lastSegmentIndexRef.current = si;
					lastBeepRef.current = -1;

					setSegmentIndex(si);
					setSecondsRemaining(remaining);

					intervalRef.current = setInterval(() => tickRef.current(), 500);
				}
			},
		);

		return () => subscription.remove();
	}, []);

	const formatTime = (s: number) => {
		const m = Math.floor(s / 60);
		const sec = s % 60;
		return `${m}:${sec.toString().padStart(2, "0")}`;
	};

	const currentSegment: Segment = SEGMENTS[segmentIndex] ?? SEGMENTS[0];
	const setNumber = Math.floor(segmentIndex / (REPS * 2)) + 1;
	const repNumber = Math.floor((segmentIndex % (REPS * 2)) / 2) + 1;
	const isWork = currentSegment.type === "work";

	return (
		<View style={styles.container}>
			<Text style={styles.meta}>
				Set {setNumber} of {SETS}
			</Text>
			<Text style={styles.meta}>
				Rep {repNumber} of {REPS}
			</Text>
			<Text
				style={[styles.phase, isWork ? styles.phaseWork : styles.phaseRest]}
			>
				{isWork ? "WORK" : "REST"}
			</Text>
			<Text style={styles.timer}>{formatTime(secondsRemaining)}</Text>
			<Text style={styles.progress}>
				Segment {segmentIndex + 1} of {TOTAL_SEGMENTS}
			</Text>
			<TouchableOpacity
				style={[styles.button, isRunning && styles.buttonStop]}
				onPress={isRunning ? stopTimer : startTimer}
				activeOpacity={0.8}
			>
				<Text style={styles.buttonText}>{isRunning ? "Stop" : "Start"}</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#000",
		gap: 8,
	},
	meta: {
		color: "#666",
		fontSize: 16,
	},
	phase: {
		fontSize: 28,
		fontWeight: "700",
		letterSpacing: 4,
		marginTop: 12,
	},
	phaseWork: {
		color: "#4CAF50",
	},
	phaseRest: {
		color: "#2196F3",
	},
	timer: {
		color: "#fff",
		fontSize: 80,
		fontVariant: ["tabular-nums"],
		marginVertical: 16,
	},
	progress: {
		color: "#444",
		fontSize: 14,
		marginBottom: 32,
	},
	button: {
		backgroundColor: "#4CAF50",
		paddingHorizontal: 56,
		paddingVertical: 18,
		borderRadius: 50,
	},
	buttonStop: {
		backgroundColor: "#F44336",
	},
	buttonText: {
		color: "#fff",
		fontSize: 22,
		fontWeight: "600",
	},
});
