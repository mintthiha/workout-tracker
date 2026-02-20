import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from "expo-audio";

let beepPlayer: AudioPlayer | null = null;
let startPlayer: AudioPlayer | null = null;

export async function initAudio(): Promise<void> {
	await setAudioModeAsync({
		playsInSilentMode: true,
		shouldRouteThroughEarpiece: false,
	});

	beepPlayer = createAudioPlayer(require("../assets/sounds/osubeep.mp3"));
	startPlayer = createAudioPlayer(require("../assets/sounds/osubeep.mp3"));
}

export async function playBeep(): Promise<void> {
	if (!beepPlayer) return;
	beepPlayer.seekTo(0);
	beepPlayer.play();
}

export async function playStart(): Promise<void> {
	if (!startPlayer) return;
	startPlayer.seekTo(0);
	startPlayer.play();
}

export async function unloadAudio(): Promise<void> {
	beepPlayer?.remove();
	startPlayer?.remove();
	beepPlayer = null;
	startPlayer = null;
}
