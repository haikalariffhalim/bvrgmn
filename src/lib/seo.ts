import type { Locale } from "@/lib/i18n/config";
import { hreflangAlternates, localizeHref } from "@/lib/i18n/routing";
import { env } from "@/env";

const SITE_URL = env.VITE_SITE_URL.replace(/\/$/, "");

type MetaDescriptor =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string }
  | { charSet: string };

type LinkDescriptor = { rel: string; href: string; hrefLang?: string };

type ScriptDescriptor = { type: string; children: string };

export type HeadDescriptor = {
  meta: Array<MetaDescriptor>;
  links: Array<LinkDescriptor>;
  scripts: Array<ScriptDescriptor>;
};

function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Builds head descriptors for a generic page (home, category, tag).
 * Includes hreflang alternates pointing to each locale's URL.
 */
export function buildPageHead(input: {
  title: string;
  description: string;
  locale: Locale;
  /** Locale-stripped canonical path (e.g. "/categories/frontend"). */
  canonicalPath: string;
  ogImage?: string | null;
}): HeadDescriptor {
  const localizedPath = localizeHref(input.canonicalPath, input.locale);
  const canonical = absoluteUrl(localizedPath);
  const alternates = hreflangAlternates(input.canonicalPath);

  const meta: Array<MetaDescriptor> = [
    { title: input.title },
    { name: "description", content: input.description },
    { property: "og:title", content: input.title },
    { property: "og:description", content: input.description },
    { property: "og:locale", content: input.locale },
    { property: "og:url", content: canonical },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
  if (input.ogImage) {
    meta.push({ property: "og:image", content: absoluteUrl(input.ogImage) });
    meta.push({ name: "twitter:image", content: absoluteUrl(input.ogImage) });
  }

  const links: Array<LinkDescriptor> = [
    { rel: "canonical", href: canonical },
    ...Object.entries(alternates).map(([hrefLang, path]) => ({
      rel: "alternate",
      hrefLang,
      href: absoluteUrl(path),
    })),
  ];

  return { meta, links, scripts: [] };
}

/**
 * Builds head descriptors for a published article, including JSON-LD.
 */
export function buildPostHead(input: {
  title: string;
  description: string;
  locale: Locale;
  canonicalPath: string;
  ogImage?: string | null;
  publishedAt: number | null;
  updatedAt: number | null;
  authorName: string | null;
  /** Slugs of available translations: { ru?: "/posts/...", en?: "/en/posts/..." } */
  translations?: Partial<Record<Locale, string>>;
}): HeadDescriptor {
  const base = buildPageHead({
    title: input.title,
    description: input.description,
    locale: input.locale,
    canonicalPath: input.canonicalPath,
    ogImage: input.ogImage,
  });

  base.meta.push({ property: "og:type", content: "article" });

  if (input.translations) {
    base.links = base.links.filter((link) => link.rel !== "alternate");
    for (const [hrefLang, path] of Object.entries(input.translations)) {
      if (path) {
        base.links.push({
          rel: "alternate",
          hrefLang,
          href: absoluteUrl(path),
        });
      }
    }
    base.links.push({
      rel: "alternate",
      hrefLang: "x-default",
      href: absoluteUrl(input.translations.ru ?? input.canonicalPath),
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    inLanguage: input.locale,
    datePublished: input.publishedAt
      ? new Date(input.publishedAt).toISOString()
      : undefined,
    dateModified: input.updatedAt
      ? new Date(input.updatedAt).toISOString()
      : undefined,
    author: input.authorName
      ? { "@type": "Person", name: input.authorName }
      : undefined,
    image: input.ogImage ? absoluteUrl(input.ogImage) : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(localizeHref(input.canonicalPath, input.locale)),
    },
  };

  base.scripts.push({
    type: "application/ld+json",
    children: JSON.stringify(jsonLd),
  });

  return base;
}
