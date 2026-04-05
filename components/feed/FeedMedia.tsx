import { ResizeMode, Video } from "expo-av";
import { Image } from "expo-image";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import { PostMedia } from "@/src/types/workout";

const MAX_MEDIA_HEIGHT = 320;
const DEFAULT_MEDIA_HEIGHT = 220;
const MIN_MEDIA_HEIGHT = 180;
const CARD_HORIZONTAL_PADDING = 32;
const LIST_HORIZONTAL_PADDING = 32;

interface Props {
	media: PostMedia;
}

/**
 * Shared renderer for feed media so previews and published posts
 * stay visually consistent.
 */
export function FeedMedia({ media }: Props) {
	const { width: windowWidth } = useWindowDimensions();
	const availableWidth = Math.max(windowWidth - CARD_HORIZONTAL_PADDING - LIST_HORIZONTAL_PADDING, 1);
	const aspectRatio =
		media.width && media.height && media.width > 0 && media.height > 0
			? media.width / media.height
			: 1;
	const naturalHeight = availableWidth / aspectRatio;
	const displayHeight = Math.max(
		MIN_MEDIA_HEIGHT,
		Math.min(MAX_MEDIA_HEIGHT, naturalHeight || DEFAULT_MEDIA_HEIGHT),
	);

	return (
		<View style={[styles.frame, { height: displayHeight }]}>
			{media.type === "image" ? (
				<Image source={media.url} style={styles.media} contentFit="cover" />
			) : (
				<Video
					source={{ uri: media.url }}
					style={styles.media}
					useNativeControls
					resizeMode={ResizeMode.CONTAIN}
					isLooping={false}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	frame: {
		width: "100%",
		maxHeight: MAX_MEDIA_HEIGHT,
		minHeight: MIN_MEDIA_HEIGHT,
		borderRadius: 14,
		overflow: "hidden",
		backgroundColor: "#111",
	},
	media: {
		width: "100%",
		height: "100%",
	},
});
