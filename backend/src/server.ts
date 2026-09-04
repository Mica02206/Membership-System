import cors from "cors";
import express from "express";
import { memberRoutes } from "./features/users/routes/memberRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/members", memberRoutes);
app.get("/api/health", (_request, response) => response.json({ ok: true }));
app.listen(4000, () => console.log("Memberly API listening on http://localhost:4000"));
