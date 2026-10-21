import { prisma } from "../../config/prisma";
import {
  deleteCloudinaryImage,
  uploadImage,
} from "../../utils/cloudinary-upload";
import type { UpdateSiteSettingsInput } from "./site-settings.validation";

const SITE_ID = "site";

const defaultSettings = {
  id: SITE_ID,
  businessName: "Dammy Multitrade Ventures",
  slogan: null,
  description: null,
  phone: null,
  secondaryPhone: null,
  whatsapp: null,
  email: null,
  address: null,
  city: null,
  state: null,
  country: "Nigeria",
  openingHours: null,
  logoUrl: null,
  faviconUrl: null,
  instagramUrl: null,
  facebookUrl: null,
  tiktokUrl: null,
  linkedinUrl: null,
  youtubeUrl: null,
};

export const siteSettingsService = {
  async get() {
    const current = await prisma.siteSetting.findUnique({
      where: { id: SITE_ID },
    });
    return current ?? defaultSettings;
  },

  async update(input: UpdateSiteSettingsInput) {
    return prisma.siteSetting.upsert({
      where: { id: SITE_ID },
      create: {
        ...defaultSettings,
        ...input,
        id: SITE_ID,
        businessName: input.businessName,
      },
      update: input,
    });
  },

  async uploadBrandImage(
    kind: "logo" | "favicon",
    file: Express.Multer.File,
  ) {
    const uploaded = await uploadImage(file.buffer, "site-settings");
    const field = kind === "logo" ? "logoUrl" : "faviconUrl";
    const previous = await prisma.siteSetting.findUnique({
      where: { id: SITE_ID },
    });

    try {
      const updated = await prisma.siteSetting.upsert({
        where: { id: SITE_ID },
        create: {
          ...defaultSettings,
          businessName: defaultSettings.businessName,
          [field]: uploaded.url,
        },
        update: { [field]: uploaded.url },
      });

      const previousUrl = kind === "logo"
        ? previous?.logoUrl
        : previous?.faviconUrl;

      // The schema stores URLs, not Cloudinary public IDs. Do not delete the
      // previous asset automatically because its public ID cannot be recovered safely.
      void previousUrl;

      return updated;
    } catch (error) {
      await Promise.allSettled([deleteCloudinaryImage(uploaded.publicId)]);
      throw error;
    }
  },
};
