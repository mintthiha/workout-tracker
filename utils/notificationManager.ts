import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { TimerConfig } from "./timer/timerConstants";

Notifications.setNotificationHandler({
	handleNotification: async (notification) => {
		const isBeep = notification.request.content.data?.type === "beep";
		return {
			shouldShowAlert: !isBeep,
			shouldShowBanner: !isBeep,
			shouldShowList: !isBeep,
			shouldPlaySound: true,
			shouldSetBadge: false,
		};
	},
});

export async function requestNotificationPermissions(): Promise<boolean> {
	const { status } = await Notifications.requestPermissionsAsync();
	return status === "granted";
}

export async function setupNotificationChannels(): Promise<void> {
	if (Platform.OS !== "android") return;

	await Notifications.setNotificationChannelAsync("timer-beeps", {
		name: "Timer Beeps",
		importance: Notifications.AndroidImportance.HIGH,
		sound: "beep.mp3",
		enableVibrate: false,
	});

	await Notifications.setNotificationChannelAsync("timer-ongoing", {
		name: "Timer Running",
		importance: Notifications.AndroidImportance.LOW,
		sound: undefined,
		enableVibrate: false,
	});

	await Notifications.setNotificationChannelAsync("timer-start", {
		name: "Interval Start",
		importance: Notifications.AndroidImportance.HIGH,
		sound: "start.mp3",
		enableVibrate: false,
	});
}

export async function scheduleBeepNotifications(
	config: TimerConfig,
): Promise<void> {
	const { startTime, segments } = config;
	const now = Date.now();

	let segmentStartMs = startTime;

	for (let i = 0; i < segments.length; i++) {
		const segment = segments[i];
		const segmentEndMs = segmentStartMs + segment.duration * 1000;

		// Start sound for every segment after the first (first is played via expo-audio)
		if (i > 0 && segmentStartMs > now) {
			await Notifications.scheduleNotificationAsync({
				content: {
					// Empty title/body so no visible banner appears — sound only
					title: "",
					body: "",
					sound: "osubeep.mp3",
					data: { type: "start", segmentType: segment.type },
				},
				trigger:
					Platform.OS === "android"
						? {
								type: Notifications.SchedulableTriggerInputTypes.DATE,
								date: new Date(segmentStartMs),
								channelId: "timer-start",
							}
						: {
								type: Notifications.SchedulableTriggerInputTypes.DATE,
								date: new Date(segmentStartMs),
							},
			});
		}

		// Beep sounds at 3, 2, 1 seconds before segment end
		for (const secondsBefore of [3, 2, 1]) {
			const beepTime = segmentEndMs - secondsBefore * 1000;
			if (beepTime > now && beepTime > segmentStartMs) {
				await Notifications.scheduleNotificationAsync({
					content: {
						title: "",
						body: "",
						sound: "osubeep.mp3",
						data: { type: "beep", secondsBefore },
					},
					trigger:
						Platform.OS === "android"
							? {
									type: Notifications.SchedulableTriggerInputTypes.DATE,
									date: new Date(beepTime),
									channelId: "timer-beeps",
								}
							: {
									type: Notifications.SchedulableTriggerInputTypes.DATE,
									date: new Date(beepTime),
								},
				});
			}
		}

		segmentStartMs = segmentEndMs;
	}
}

export async function cancelBeepNotifications(): Promise<void> {
	await Notifications.cancelAllScheduledNotificationsAsync();
}

let ongoingNotificationId: string | null = null;

export async function showOngoingNotification(body: string): Promise<void> {
	if (Platform.OS !== "android") return;

	if (ongoingNotificationId) {
		await Notifications.dismissNotificationAsync(ongoingNotificationId);
	}

	ongoingNotificationId = await Notifications.scheduleNotificationAsync({
		content: {
			title: "Interval Timer Running",
			body,
			sticky: true,
			autoDismiss: false,
		},
		trigger: {
			type: Notifications.SchedulableTriggerInputTypes.DATE,
			date: new Date(Date.now() + 1000),
			channelId: "timer-ongoing",
		},
	});
}

export async function hideOngoingNotification(): Promise<void> {
	if (!ongoingNotificationId) return;
	await Notifications.dismissNotificationAsync(ongoingNotificationId);
	ongoingNotificationId = null;
}
