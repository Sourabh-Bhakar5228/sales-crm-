import multer from "multer";

const allowedMimeTypes = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
];

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb
) => {
  if (!allowedMimeTypes.includes(file.mimetype) && !file.mimetype.startsWith("audio/")) {
    cb(new Error("Only audio files are allowed"));
    return;
  }

  cb(null, true);
};

export const uploadAudio = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
  fileFilter,
});
