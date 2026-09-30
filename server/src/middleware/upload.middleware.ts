import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/ogg',
  'audio/webm',
  'audio/m4a',
  'audio/x-m4a',
  'audio/aac'
];

export const audioUpload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 MB max
  },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid file type. Only audio files (MP3, WAV, OGG, WEBM) are permitted.', 400, 'INVALID_FILE_TYPE'));
    }
  }
});
