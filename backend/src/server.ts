import cors from "cors";
import express from "express";
import path from "node:path";
import { memberRoutes } from "./features/users/routes/memberRoutes.js";

const app = express();
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"] }));
app.use(express.json());
app.use(
  "/uploads",
  (req, res, next) => {
    if (!path.extname(req.path)) {
      res.setHeader("Content-Type", "image/jpeg");
    }
    next();
  },
  express.static(path.resolve("uploads")),
);
app.use("/api/members", memberRoutes);
app.get("/api/health", (_request, response) => response.json({ ok: true }));
app.get("/api/debug/routes", (_req, res) => {
  const routes: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (app as any)._router.stack.forEach((layer: any) => {
    if (layer.route) {
      routes.push(`${Object.keys(layer.route.methods).join(",").toUpperCase()} ${layer.route.path}`);
    } else if (layer.name === "router" && layer.handle.stack) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      layer.handle.stack.forEach((r: any) => {
        if (r.route) routes.push(`${Object.keys(r.route.methods).join(",").toUpperCase()} /api/members${r.route.path}`);
      });
    }
  });
  res.json(routes);
});
app.listen(4000, () => console.log("Memberly API listening on http://localhost:4000"));
