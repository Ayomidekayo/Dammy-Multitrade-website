import { Router } from "express";
import { siteSettingsController } from "./site-settings.controller";
import { requireAdmin } from "../../middleware/auth.middleware";
import { upload } from "../../middleware/upload.middleware";

const router = Router();

// Public read endpoint so the storefront can load business details.
router.get("/", siteSettingsController.getPublic);

// Admin-only updates.
router.patch("/", requireAdmin, siteSettingsController.update);
router.post("/logo", requireAdmin, upload.single("image"), siteSettingsController.uploadLogo);
router.post("/favicon", requireAdmin, upload.single("image"), siteSettingsController.uploadFavicon);

export default router;
