/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as articles from "../articles.js";
import type * as authors from "../authors.js";
import type * as badges from "../badges.js";
import type * as brands from "../brands.js";
import type * as categories from "../categories.js";
import type * as headline from "../headline.js";
import type * as libs_types from "../libs/types.js";
import type * as posts from "../posts.js";
import type * as products from "../products.js";
import type * as reviews from "../reviews.js";
import type * as smartphones from "../smartphones.js";
import type * as thumbnails from "../thumbnails.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  articles: typeof articles;
  authors: typeof authors;
  badges: typeof badges;
  brands: typeof brands;
  categories: typeof categories;
  headline: typeof headline;
  "libs/types": typeof libs_types;
  posts: typeof posts;
  products: typeof products;
  reviews: typeof reviews;
  smartphones: typeof smartphones;
  thumbnails: typeof thumbnails;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
