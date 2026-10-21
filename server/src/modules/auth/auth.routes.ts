import { Router } from "express";

import { authController } from "./auth.controller";
import { requireAdmin } from "../../middleware/auth.middleware";

const router = Router();

router.post("/login", (req, res) => authController.login(req, res));

router.get("/me", requireAdmin, (req, res) =>
  authController.me(req, res),
);

export default router;