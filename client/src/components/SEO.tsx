import { useEffect } from "react";

type SEOProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
};

/** Updates metadata during React Router navigation.
 * Keep homepage metadata in index.html for the initial HTML response.
 */
export default function SEO({
  title,
  description,
  path = "/",
  image = "/dammymultitradeventureslogo.jpeg",
  noIndex = false,
}: SEOProps) {
  useEffect(() => {
    const origin = "https://www.dammymultitradeventures.com";
    const canonicalUrl = new URL(path, origin).toString();
    const imageUrl = new URL(image, origin).toString();

    document.title = title;

    const setMeta = (
      selector: string,
      attribute: "name" | "property",
      key: string,
      content: string,
    ) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[name="robots"]', "name", "robots", noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    setMeta('meta[property="og:image"]', "property", "og:image", imageUrl);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", imageUrl);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [title, description, path, image, noIndex]);

  return null;
}
