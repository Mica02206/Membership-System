import cors from "cors";
import express from "express";
import path from "node:path";
import { memberRoutes } from "./features/users/routes/memberRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));
app.use("/api/members", memberRoutes);
app.get("/api/health", (_request, response) => response.json({ ok: true }));
app.listen(4000, () => console.log("Memberly API listening on http://localhost:4000"));
