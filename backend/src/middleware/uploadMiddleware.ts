import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, 
  fileFilter: (_req: any, file: { mimetype: string; }, cb: (arg0: Error | null, arg1: boolean | undefined) => void) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/webp"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, WEBP allowed."));
    }
  },
});

export default upload;