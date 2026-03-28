// ─── Cloudinary Upload ────────────────────────────────────────────────────────
// Uploads files directly to Cloudinary using unsigned uploads.

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;

export type CloudinaryResourceType = "image" | "video";

export interface CloudinaryUploadResult {
	url: string;
	publicId: string;
}

/**
 * Uploads a local file URI to Cloudinary and returns the public URL and public ID.
 * @param uri - Local file URI from the image/video picker
 * @param resourceType - "image" or "video"
 */
export async function uploadToCloudinary(
	uri: string,
	resourceType: CloudinaryResourceType = "image",
): Promise<CloudinaryUploadResult> {
	const formData = new FormData();

	const filename = uri.split("/").pop() ?? "upload";
	const ext = filename.split(".").pop() ?? "jpg";
	const mimeType = resourceType === "video" ? `video/${ext}` : `image/${ext}`;

	if (typeof window !== "undefined") {
		// Web: fetch the URI and convert to a Blob
		const response = await fetch(uri);
		const blob = await response.blob();
		formData.append("file", blob, filename);
	} else {
		// Native: use the React Native FormData object pattern
		formData.append("file", { uri, name: filename, type: mimeType } as unknown as Blob);
	}

	formData.append("upload_preset", UPLOAD_PRESET);
	formData.append("resource_type", resourceType);

	const response = await fetch(UPLOAD_URL, {
		method: "POST",
		body: formData,
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error?.message ?? "Cloudinary upload failed");
	}

	const data = await response.json();
	return {
		url: data.secure_url,
		publicId: data.public_id,
	};
}
