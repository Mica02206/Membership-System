import { Router } from "express";
import multer from "multer";
import { createMember, checkMember, listMembers } from "../controllers/memberController.js";

const upload = multer({ dest: "uploads/", limits: { fileSize: 5 * 1024 * 1024 } });
export const memberRoutes = Router();
memberRoutes.get("/", listMembers);
memberRoutes.get("/:memberId/status", checkMember);
memberRoutes.post("/", upload.single("picture"), createMember);
