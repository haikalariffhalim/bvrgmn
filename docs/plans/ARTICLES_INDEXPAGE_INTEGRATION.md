# Articles & Index Page Integration Guide

## Overview

Your content system has **two tiers**:

1. **Detail Pages** (`articles.ts` → `articlePage` table)
   - Full content created by authors
   - Original titles, full text, all details
   - URLs: `/article/:slug`, `/review/:slug`, `/specs/:slug`

2. **Index/Listing Pages** (`indexPage.ts` → `indexPage` table)
   - Thumbnail versions created by agent
   - Alternative headlines, optimized images, excerpts
   - URLs: `/`, `/category/:slug`, `/latest`, `/tags/:slug`

---

## Complete Workflow

### Step 1: Author Publishes Content

```typescript
// 1a. Author creates article detail page
const articlePageId = await createArticlePage({
  postId: post1,
  contentType: "article", // or "review", "specs"
  categoryId: categoryTech, // Primary category
  slug: "best-phones-2024",
  authorId: authorJohn,
  title: "Best Phones in 2024", // ORIGINAL title
  excerpt: "A comprehensive review of top phones...",
  featuredImg: photo1,
  featuredImgDesc: "Featured image",
  shortSummary: "Top 5 best phones",
  tagIds: [tagSmartphone, tagReview],
  categoryIds: [categoryTech, categoryProductReview], // Multiple categories
});

// 1b. Author adds content body
await addArticleBodySection({
  articlePageId,
  paragraphs: "Full article content here...",
  images: [photo2, photo3, photo4],
});

// 1c. Author publishes
await publishArticle({ articlePageId });
```

**Result**: 
- Article now live at `/article/best-phones-2024`
- Only shows original title "Best Phones in 2024"
- Full content visible on detail page

---

### Step 2: Agent Generates Thumbnail Version

Agent reads the published article and creates index versions:

```typescript
// 2a. Agent generates headline version for homepage hero
const headlinerId = await createHeadlinerPost({
  postId: post1, // SAME post ID
  slug: "homepage-hero-phones",
  headline: "📱 Does YOUR Phone Make the Cut? See Which Flagships Win!", // ALTERNATIVE title
  excerpt: "We tested 50 phones. Here's which ones really stand out...",
  thumbFeaturedImg: agentOptimizedPhoto, // May be different crop/style
  authorName: "John Doe",
  authorSlug: "john-doe",
  authorAvatar: authorJohnAvatar,
  authorBio: "Tech reviewer",
  authorSocials: ["twitter.com/john"],
});

// 2b. Agent creates latest feed entry
const latestId = await createLatestPost({
  postId: post1, // SAME post ID
  slug: "latest-phones-feed",
  thumbImg: agentThumbnail1,
  thumbImgDesc: "Main thumbnail",
  thumbTitle: "🏆 Which Phone Wins? 5 Flagships Tested",
  thumbExcerpt: "Agent-optimized excerpt for feed display",
  thumbImgTwo: agentThumbnail2,
  thumbImgTwoDesc: "Secondary thumbnail",
  thumbTitleTwo: "Camera Showdown: iPhone vs Galaxy vs Pixel",
  thumbExcerptTwo: "Side-by-side camera comparison",
});

// 2c. Agent adds to tech category trending
const topCategoryId = await createTopCategoriesPost({
  postId: post1, // SAME post ID
  slug: "tech-top-posts-phones",
  categoryId: categoryTech,
  thumbImg: agentCategoryThumb,
  thumbTitle: "This Year's Best Phones - A Deep Dive",
  order: [1, 2, 3, 4, 5], // Position in category
  limit: 5,
});
```

**Result**: 
- Three index page entries created (all link to same article)
- Each has DIFFERENT agent-generated headlines and images
- Homepage shows "📱 Does YOUR Phone Make the Cut?" (headline)
- Latest feed shows "🏆 Which Phone Wins?" (different headline)
- Tech category shows "This Year's Best Phones" (another variant)

---

## Data Relationships

```
POST (posts table)
  └─ id: "post1"

DETAIL PAGE (articlePage table)
  ├─ postId: "post1"
  ├─ slug: "best-phones-2024"
  ├─ title: "Best Phones in 2024" (original)
  ├─ categoryId: categoryTech (primary)
  ├─ categoryIds: [categoryTech, categoryProductReview] (multiple)
  └─ status: "published"

INDEX PAGES (indexPage table) - multiple entries per article
  ├─ Entry 1 (Headliner)
  │  ├─ postId: "post1" (SAME)
  │  ├─ slug: "homepage-hero-phones"
  │  ├─ section.headline: "📱 Does YOUR Phone Make the Cut?" (DIFFERENT)
  │  └─ section.thumbFeaturedImg: agentOptimizedPhoto (may differ)
  │
  ├─ Entry 2 (Latest)
  │  ├─ postId: "post1" (SAME)
  │  ├─ slug: "latest-phones-feed"
  │  ├─ section.thumbTitle: "🏆 Which Phone Wins?" (DIFFERENT)
  │  └─ section.thumbImg: agentThumbnail1 (may differ)
  │
  └─ Entry 3 (Top Categories)
     ├─ postId: "post1" (SAME)
     ├─ slug: "tech-top-posts-phones"
     ├─ section.thumbTitle: "This Year's Best Phones" (DIFFERENT)
     └─ section.thumbImg: agentCategoryThumb (may differ)
```

---

## Displaying Content

### Detail Page

```typescript
// URL: /article/best-phones-2024
const article = await getArticleBySlug({ slug: "best-phones-2024" });

// Response:
{
  id: articlePageId,
  title: "Best Phones in 2024", // Original author title
  excerpt: "A comprehensive review...",
  featuredImage: photo1, // Original featured image
  author: { name: "John Doe", ... },
  content: {...}, // Full article content
}
```

### Homepage Hero (Headliner)

```typescript
// URL: / (homepage)
const hero = await getHeadlinerPost();

// Response:
{
  headline: "📱 Does YOUR Phone Make the Cut? See Which Flagships Win!",
  excerpt: "We tested 50 phones...",
  thumbFeaturedImg: agentOptimizedPhoto, // Agent's chosen image
  author: { name: "John Doe", ... },
  link: "/article/best-phones-2024" // Links to detail page
}
```

### Latest Feed

```typescript
// URL: /latest or homepage sidebar
const latestPosts = await getLatestPosts({ limit: 10 });

// Response: Array of posts
[
  {
    id: latestId,
    thumbTitle: "🏆 Which Phone Wins? 5 Flagships Tested",
    thumbExcerpt: "Agent-optimized excerpt...",
    thumbImg: agentThumbnail1,
    thumbTitleTwo: "Camera Showdown...",
    thumbImgTwo: agentThumbnail2,
    link: "/article/best-phones-2024"
  },
  ...
]
```

### Category Listing

```typescript
// URL: /category/tech
const categoryArticles = await getArticlesByCategory({ 
  categoryId: categoryTech 
});

// Response: Articles with ORIGINAL titles
[
  {
    title: "Best Phones in 2024",
    excerpt: "A comprehensive review...",
    featuredImage: photo1, // Original image
    link: "/article/best-phones-2024"
  },
  ...
]
```

---

## Key Distinctions

| Aspect | Detail Page (articlePage) | Index Page (indexPage) |
|--------|--------------------------|----------------------|
| **Created by** | Author | Agent |
| **Content** | Full, original | Thumbnail, alternative |
| **Title** | Original by author | Agent-generated |
| **Image** | Featured by author | Optimized by agent |
| **URL** | `/article/:slug` | `/latest`, `/`, etc. |
| **Purpose** | Full reading | Discovery/feed |
| **Quantity** | One per article | Multiple per article |
| **Link** | `postId` reference | `postId` reference (same) |

---

## Category Architecture

```
CONTENT CATEGORIES (categories table)
├─ Tech
├─ Business
├─ Entertainment
└─ Sports

PRODUCT CATEGORIES (productCategories table) - LEFT FOR LATER
├─ Smartphones
├─ Laptops
├─ Watches
└─ Tablets

Example:
- Article tagged with: categories=[Tech, ProductReview], tags=[Smartphone, Camera]
- Product related via: tags=[Smartphone], productCategory=Smartphones
- Both discoverable by: tech category AND smartphone tag
```

---

## Agent Update Flow

Agent can update index pages when better headlines/images found:

```typescript
// Agent discovers better headline for existing post
await updateIndexPageSection({
  indexPageId: headlinerId,
  headline: "🔥 VIRAL: This Phone Comparison Got 100K Views - Here's Why",
});

// Homepage now shows updated headline
// But detail page remains unchanged
// Agent did NOT modify the original article
```

---

## Integration Points

### 1. Creating Content
```
Author → createArticlePage + addArticleBodySection
       → publishArticle
       → (detail page LIVE)
       ↓
Agent → reads published article via getArticleBySlug
     → generatesThumbnailContent
     → createHeadlinerPost / createLatestPost / etc.
     → (index pages LIVE)
```

### 2. Displaying Content
```
Homepage requests: getHeadlinerPost() → shows thumbnail with agent headline
User clicks → navigates to /article/:slug
             → calls getArticleBySlug()
             → shows FULL article with ORIGINAL title
```

### 3. Categorization
```
Author selects:
  - categoryId (primary, for routing)
  - categoryIds (multiple, for discovery)
  - tagIds (for tagging)

Both used by:
  - getArticlesByCategory()
  - getArticlesByTags()
  - getTopCategoriesPosts()
```

---

## Next Steps (Left for Later)

When you build Product System:

1. **Product Overview** - Like detail page but for products
   - productCategory (phone, laptop, etc.)
   - contentCategories (tech, business, etc.) - can overlap
   
2. **Product Specs** - Detailed specs page
   - flexible specs per productCategory
   - can be referenced from articles

3. **Reviews** - Like articles but linked to products
   - reference both articlePage and product specs

All three can have index/thumbnail versions just like articles.

---

## Testing Queries

```typescript
// Test full workflow:

// 1. Create & publish article
const articleId = await createArticlePage({...});
await addArticleBodySection({...});
await publishArticle({ articlePageId: articleId });

// 2. Verify detail page works
const article = await getArticleBySlug({ slug: "best-phones-2024" });
console.log(article.title); // "Best Phones in 2024"

// 3. Agent creates index entries
const headlinerId = await createHeadlinerPost({
  postId: article.postId,
  headline: "Different headline by agent",
  ...
});

// 4. Verify index page works
const hero = await getHeadlinerPost();
console.log(hero.headline); // "Different headline by agent"

// 5. Verify postId links them
console.log(article.postId === hero.postId); // true
```

