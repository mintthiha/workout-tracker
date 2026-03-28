import { Platform } from "react-native";

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

export type CloudinaryResourceType = "image" | "video";

export interface CloudinaryUploadResult {
	url: string;
	publicId: string;
}

/**
 * Uploads a local file (image or video) to Cloudinary using an unsigned preset.
 *
 * Supports both:
 * - Web (Blob upload)
 * - React Native (file URI upload)
 *
 * @param uri - Local file URI (e.g., from Expo ImagePicker)
 * @param resourceType - Type of resource ("image" or "video")
 *
 * @returns Promise resolving to:
 * - url: Secure CDN URL of the uploaded file
 * - publicId: Unique Cloudinary identifier for the asset
 *
 * @throws Error if the upload fails or Cloudinary returns a non-200 response
 */
export async function uploadToCloudinary(
	uri: string,
	resourceType: CloudinaryResourceType = "image",
): Promise<CloudinaryUploadResult> {
	const formData = new FormData();

	let filename = uri.split("/").pop() ?? "upload.jpg";
	if (!filename.includes(".")) {
		filename += resourceType === "video" ? ".mp4" : ".jpg";
	}

	const mimeType =
		resourceType === "video"
			? "video/mp4"
			: filename.endsWith(".png")
			? "image/png"
			: "image/jpeg";

	if (Platform.OS === "web") {
		const response = await fetch(uri);
		const blob = await response.blob();
		formData.append("file", blob, filename);
	} else {
		formData.append("file", {
			uri,
			name: filename,
			type: mimeType,
		} as any);
	}

	formData.append("upload_preset", UPLOAD_PRESET);

	const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

	const response = await fetch(uploadUrl, {
		method: "POST",
		body: formData,
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(errorText);
	}

	const data = await response.json();

	return {
		url: data.secure_url,
		publicId: data.public_id,
	};
}