import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { createMember, checkMember, listMembers, renewMember, uploadMemberPicture } from "../controllers/memberController.js";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `picture-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
export const memberRoutes = Router();
memberRoutes.get("/", listMembers);
memberRoutes.get("/:memberId/status", checkMember);
memberRoutes.post("/", upload.single("picture"), createMember);
memberRoutes.post("/:memberId/renew", renewMember);
memberRoutes.post("/:memberId/picture", upload.single("picture"), uploadMemberPicture);



