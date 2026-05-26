# Convex Backend Refactoring Summary

## Overview

This document explains the refactoring of the Convex backend functions to align with the separation of concerns between detail pages and index/listing pages.

## Architecture

### Page Types

1. **Detail Pages** (`articlePage`, individual product pages, individual review pages)
   - Full content authored by users
   - Original titles and descriptions
   - Complete article/product/review information

2. **Index/Listing Pages** (`indexPage`)
   - Thumbnail versions with agent-generated alternative titles
   - Used for homepage, category listings, search results
   - Agent generates:
     - Alternative headlines/titles (ThumbnailTitle vs original Title)
     - Thumbnail images
     - Excerpts

### Data Flow

```
Author writes Article
  ↓
Article published to "articlePage" table (detail page)
  ↓
Agent generates thumbnail version (alternative title + image)
  ↓
Thumbnail published to "indexPage" table (index/listing pages)
```

## Files Refactored

### 1. `articles.ts` (COMPLETED ✅)
**Purpose**: Handle article detail pages (articlePage table)

**Functions**:
- `createArticlePage()` - Create new article with hero section
- `addArticleBodySection()` - Add body content to article
- `publishArticle()` - Change status from draft to published
- `getArticleBySlug()` - Get single article for detail page
- `getArticlesByCategory()` - Get articles by category for listing
- `getArticlesByAuthor()` - Get articles by author
- `getArticlesByTags()` - Get articles by tags
- `getAllPublishedArticles()` - Get all published articles
- `updateArticleHero()` - Update article hero section

**Schema Used**: `articlePage` table with union sections (hero, body, aside, related)

---

### 2. `products.ts` (⚠️ NEEDS SCHEMA UPDATE)
**Purpose**: Handle product specs and listings

**Current Issue**:
The schema's `specs` table is incomplete. It only defines:
```typescript
specs: defineTable({
  productCategory: v.id("productCategories"),
  productId: v.id("products"),
  reviewId: v.id("reviews"),
  articleId: v.id("articles"),
  postId: v.id("posts"),
})
```

But the code tries to use fields like:
- `title`, `summary`, `slug`
- `specs` (flexible object for phone specs)
- `isPublished`, `isDraft`
- `popularity`, `views`
- `category`, `tags`
- `authorId`, `authorName`
- `featuredImage`, `createdAt`, `updatedAt`

**Functions Implemented**:
- `createProduct()` - Create product entry
- `createProductSpecs()` - Create product specifications
- `updateProductSpecs()` - Update product specs
- `publishProductSpecs()` - Publish product
- `getProductListing()` - Get products for listing page
- `getProductOverview()` - Get single product overview
- `getProductFullSpecs()` - Get complete specifications
- `getProductsByBrand()` - Get products filtered by brand
- `getProductsByCategory()` - Get products filtered by category
- `searchProducts()` - Search products
- `incrementProductViews()` - Increment view count
- `incrementProductPopularity()` - Increment popularity
- `getAllBrands()` - Get all available brands
- `getAllProductCategories()` - Get categories with product count

---

### 3. `brands.ts` (COMPLETED ✅)
**Purpose**: Handle brand-related queries

**Functions**:
- `getAllBrands()` - Get all available brands
- `getAllBrandsWithCount()` - Get brands with product count
- `getProductsByBrand()` - Get products filtered by brand
- `getProductsByBrandDetailed()` - Get products with pagination
- `searchBrands()` - Search brands
- `getPopularBrands()` - Get most popular brands

---

### 4. `indexPage.ts` (CREATED ✅)
**Purpose**: Handle index/listing pages with agent-generated content

**Functions**:
- `createHeadlinerPost()` - Create featured article/product (agent-generated title)
- `createTopCategoriesPost()` - Create trending categories section
- `createLatestPost()` - Create latest feed section
- `createSidePost()` - Create editor's picks section
- `getHeadlinerPost()` - Get homepage headliner
- `getTopCategoriesPosts()` - Get top categories
- `getLatestPosts()` - Get latest feed with pagination
- `getSidePosts()` - Get editor's picks
- `getIndexPageBySlug()` - Get index page by slug
- `getIndexPagesBySection()` - Get pages by section type
- `incrementIndexPageViews()` - Track page views
- `updateIndexPageSection()` - Update agent-generated content
- `deleteIndexPage()` - Delete index page

**Schema Used**: `indexPage` table with union sections (headliner, top-categories, latest, side)

---

## Schema Issues & Recommendations

### Issue: Incomplete `specs` Table Definition

**Current Schema**:
```typescript
specs: defineTable({
  productCategory: v.id("productCategories"),
  productId: v.id("products"),
  reviewId: v.id("reviews"),
  articleId: v.id("articles"),
  postId: v.id("posts"),
})
```

**Recommended Updated Schema**:
```typescript
specs: defineTable({
  productCategory: v.id("productCategories"),
  productId: v.id("products"),
  title: v.string(),
  summary: v.string(),
  slug: v.string(),
  specs: v.any(), // Flexible product specs (phone, PC, etc.)
  featuredImage: v.id("_storage"),
  authorId: v.id("authors"),
  authorName: v.string(),
  category: v.array(v.id("categories")),
  tags: v.array(v.id("tags")),
  isDraft: v.boolean(),
  isPublished: v.boolean(),
  publishedAt: v.string(),
  createdAt: v.string(),
  updatedAt: v.string(),
  popularity: v.number(),
  views: v.number(),
  reviewId: v.optional(v.id("reviews")),
  articleId: v.optional(v.id("articles")),
  postId: v.optional(v.id("posts")),
})
  .index("by_slug", ["slug"])
  .index("by_published_status", ["isPublished"])
  .index("by_product_category", ["productCategory"])
  .index("by_author", ["authorId"])
```

---

## Key Architectural Decisions

### 1. **Separate Detail from Listing**
- Detail pages have complete, author-created content
- Index pages have thumbnail versions with agent-generated alternatives
- This allows flexibility in how content is presented across the site

### 2. **Union Types for Flexible Sections**
- `articlePage.section` can be: hero, body, aside, or related
- `indexPage.section` can be: headliner, top-categories, latest, or side
- This allows storing different page layouts in the same table

### 3. **Flexible Specs Storage**
- `specs` uses `v.any()` for specifications to support multiple product types:
  - Smartphones (screen, processor, camera, battery, etc.)
  - PCs (GPU, CPU, motherboard, etc.)
  - Any other product type

### 4. **Agent-Generated Content**
- Original content: `title`, `featured image`
- Agent generates: `thumbTitle`, `headline`, `thumbImg`
- Agent does NOT generate: content body, full specifications

---

## TypeScript Diagnostics Status

### ✅ articles.ts
- **Status**: Fixed
- **Errors**: 0
- **Solution**: Added proper type guards for union types

### ⚠️ products.ts
- **Status**: Needs Schema Update
- **Errors**: 70+
- **Solution**: Schema must be updated to include all required fields in `specs` table

### ✅ brands.ts
- **Status**: Fixed
- **Errors**: 0

### ✅ indexPage.ts
- **Status**: Fixed
- **Errors**: 0

---

## Next Steps

1. **Update Schema**: Modify the `specs` table definition to include all required fields
2. **Re-test products.ts**: After schema update, products.ts should have no errors
3. **Create reviews.ts**: Implement review functions similar to articles.ts and products.ts
4. **Add integration tests**: Test the full flow from creation to listing

---

## Usage Examples

### Creating an Article
```typescript
// 1. Create article detail page
const articleId = await createArticlePage({
  postId: postId,
  categoryId: catId,
  slug: "my-article",
  authorId: authorId,
  title: "My Article Title",
  excerpt: "Short excerpt",
  featuredImg: imgId,
  featuredImgDesc: "Description",
  shortSummary: "Summary",
  tagIds: [tag1, tag2],
  categoryIds: [cat1, cat2],
});

// 2. Add body content
await addArticleBodySection({
  articlePageId: articleId,
  paragraphs: "Article content...",
  images: [img1, img2],
});

// 3. Publish
await publishArticle({ articlePageId: articleId });

// 4. Create index page with agent-generated content
const indexId = await createLatestPost({
  postId: postId,
  slug: "index-my-article",
  thumbImg: agentGenImg,
  thumbTitle: "Does My Article Title Sound Better?", // Agent-generated
  thumbExcerpt: "Agent-generated excerpt",
});
```

### Getting Articles
```typescript
// For detail page
const article = await getArticleBySlug({ slug: "my-article" });

// For listing pages
const byCategory = await getArticlesByCategory({ categoryId: catId });
const byAuthor = await getArticlesByAuthor({ authorId: authorId });
const latest = await getAllPublishedArticles({ limit: 10 });
```

### Getting Index Page Content
```typescript
// For homepage
const headliner = await getHeadlinerPost();
const topCats = await getTopCategoriesPosts({ limit: 5 });
const latest = await getLatestPosts({ limit: 10 });
const sidebar = await getSidePosts({ limit: 5 });
```
