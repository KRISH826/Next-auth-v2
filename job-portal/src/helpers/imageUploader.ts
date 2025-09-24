import crypto from "crypto";
import imagekit from "./imagekit";

export interface ImageUploadResult {
  public_id: string;
  url: string;
}

export async function UploadProfileImage(
  profileImage: string,
  username: string
): Promise<ImageUploadResult | null> {
  if (!profileImage) {
    return null;
  }
  const fileName = `profile_${Date.now()}_${crypto
    .randomBytes(16)
    .toString("hex")}`;

  const uploadResult = await imagekit.upload({
    file: profileImage,
    fileName,
    folder: `jobportal/${username}`,
    transformation: {
      pre: "h-300,w-300,c-fill,q-80"
    }
  });
  return {
    public_id: uploadResult.fileId || uploadResult.name,
    url: uploadResult.url,
  };
}


export async function processImageUpload(profileImage: File, username: string): Promise<any> {
    try {
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
        const ALLOWED_TYPES  = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

        if(profileImage.size > MAX_FILE_SIZE) {
            throw new Error('File size is too large. Please choose a smaller file.');
        }

        if(!ALLOWED_TYPES.includes(profileImage.type)) {
            throw new Error('Invalid file type. Please choose a JPEG, PNG, or WebP file.');
        }
        const arrayBuffer = await profileImage.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const imagemimetype =  `data:${profileImage.type};base64,${buffer.toString('base64')}`;
        return await UploadProfileImage(imagemimetype, username);
    } catch (error) {
        console.log('image upload erorr', error);
        throw new Error("Failed to upload image");
    }
}
