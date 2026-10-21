import type { Request, Response, NextFunction } from "express";
import { updateSiteSettingsSchema } from "./site-settings.validation";
import { siteSettingsService } from "./site-settings.service";

function singleFile(req: Request): Express.Multer.File | null {
  return req.file ?? null;
}

export const siteSettingsController = {
  async getPublic(_req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await siteSettingsService.get();
      return res.status(200).json({ success: true, data: settings });
    } catch (error) {
      return next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateSiteSettingsSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid website settings.",
          errors: parsed.error.flatten(),
        });
      }
      const settings = await siteSettingsService.update(parsed.data);
      return res.status(200).json({
        success: true,
        message: "Website settings saved successfully.",
        data: settings,
      });
    } catch (error) {
      return next(error);
    }
  },

  async uploadLogo(req: Request, res: Response, next: NextFunction) {
    try {
      const file = singleFile(req);
      if (!file) {
        return res.status(400).json({ success: false, message: "Select a logo image first." });
      }
      const settings = await siteSettingsService.uploadBrandImage("logo", file);
      return res.status(200).json({ success: true, message: "Logo uploaded successfully.", data: settings });
    } catch (error) {
      return next(error);
    }
  },

  async uploadFavicon(req: Request, res: Response, next: NextFunction) {
    try {
      const file = singleFile(req);
      if (!file) {
        return res.status(400).json({ success: false, message: "Select a favicon image first." });
      }
      const settings = await siteSettingsService.uploadBrandImage("favicon", file);
      return res.status(200).json({ success: true, message: "Favicon uploaded successfully.", data: settings });
    } catch (error) {
      return next(error);
    }
  },
};
