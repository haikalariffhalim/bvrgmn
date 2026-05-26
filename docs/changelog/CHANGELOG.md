# Convex Backend Refactoring - CHANGELOG

## Overview
This changelog tracks the progressive refactoring and extension of the Convex backend to implement a **two-tier content model**: detail pages (original author content) and index pages (agent-generated listing entries). It includes architectural decisions, implementation progress, version history, and action items.

---

## Version History

### v1.2.0 - Index Page Generalization & Agent-Driven Thumbnail Generation (Current - In Progress)
**Date**: 2024
**Status**: Architecture Finalized, Implementation Starting

#### Key Decisions ✅

**1. Query-Based Index Filtering (No Dedicated Context Field)**
- Small, focused functions for each query need
- Compose functions with custom map/filter functions for complex queries
- Examples: `getIndexByCategory()`, `getIndexByBrand()`, `getIndexByAuthor()`, `getIndexByTag()`
- Filter functions applied client-side or via Convex computed fields for flexibility
- Benefit: Schema stays minimal, queries remain composable and testable

**2. Slug as Single Source of Truth**
- Both detail content and index entries reference the **same slug**
- Architecture: `slug` uniquely identifies content (article/review/product)
- One slug = one detail page + multiple index representations (different titles/images)
- Relationship: `articlePage.slug` ←→ `indexPage.slug` (not postId)
- Enables content sharing between detail and index tiers

**3. Convex Agent for Thumbnail Generation**
- Agent triggered when author publishes content (sets `isPublished: true`)
- Agent accesses published content via slug
- Agent generates: alternative titles + thumbnail images for discovery
- Agent creates `indexPage` entries with agent-generated content
- Draft content: Agent does NOT generate until published
- Prevents agent from generating for incomplete/unpublished work

**4. Approval Workflow** ⚠️ **PENDING DECISION**

**Option A: Auto-Generate After Publish**
- Author publishes article → agent automatically generates thumbnails
- Thumbnails appear in listings shortly after publish
- Pros: Faster time-to-list, no additional approval step
- Cons: Author has no control over thumbnail variants

**Option B: Author Approves Before Publish**
- Author saves article (draft) → requests agent to preview thumbnails
- Author reviews and approves thumbnail variants
- Author publishes with approved thumbnails already generated
- Pros: Full control over discovery presentation
- Cons: Extra workflow step, slower publish

**Option C: Hybrid (Approve + Auto-Generate)**
- Author publishes → system generates default thumbnails immediately
- Author can also request agent to generate additional variants for approval/A/B testing
- Pros: Balance between speed and control
- Cons: More complex UX

👉 **Which workflow do you prefer for v1.2.0?**

#### Planned Work
- [ ] Refactor `indexPage.ts`: Replace postId with slug references
- [ ] Create small query functions: `getByCategory()`, `getByBrand()`, `getByAuthor()`, `getByTag()`, `getByRating()`, etc.
- [ ] Create reusable filter functions for composition (e.g., `filterByDateRange()`, `filterByPopularity()`)
- [ ] Create Convex Agent action for thumbnail generation
- [ ] Implement selected approval workflow (A, B, or C)
- [ ] Update schema: Change `indexPage` to use `slug` instead of `postId`
- [ ] Update `articles.ts` to return slug for agent reference
- [ ] Create trigger mechanism on publish (via transaction or mutation hook)
- [ ] Document agent workflow and approval process
- [ ] Create integration guide with examples

#### Impact on Existing Files
- `indexPage.ts`: Refactor to use slug, create small focused query functions
- `indexPage` schema: Change relationship from `postId` to `slug`; add indexes on slug, category, brand, author, tags
- `articles.ts`: Ensure slug is always available for agent; return full slug for detail-to-index linking
- `schema.ts`: Update `indexPage` table definition
- **New**: `indexPage.agent.ts` or agent action in `indexPage.ts` for thumbnail generation

---

### v1.1.0 - Articles & Index Pages Complete (Content Workflow)
**Date**: Session prior to current
**Status**: ✅ Complete & Validated

#### Architecture Implemented
Two-tier content model:

**Detail Pages** (`articlePage` table):
- Stores full, original author content
- Structured sections: hero, body, aside, related
- Original author titles and images
- Fields: id, postId, authorId, authorName, title, slug, summary, featuredImage, category, tags, sections, isDraft, isPublished, publishedAt, createdAt, updatedAt, popularity, views

**Index Pages** (`indexPage` table):
- Agent-generated thumbnail/headline entries for discovery and feeds
- May have different titles and images than detail pages
- Sections: headliner, latest, top-categories, side
- Fields: id, postId, section, title, thumbnail, summary, category, tags, views, createdAt, updatedAt
- **Key Relationship**: Multiple index entries can reference the same detail page with different agent-generated variants

#### Files Completed
- ✅ **convex/articles.ts**: Refactored to use `articlePage` table
  - Functions: `createArticlePage`, `addArticleBodySection`, `publishArticle`, `getArticleBySlug`, `getArticlesByCategory`, `getArticlesByAuthor`, `getArticlesByTags`, `incrementArticleViews`
  - Returns minimal link objects for related content to avoid circular references

- ✅ **convex/indexPage.ts**: New implementation for agent-driven index entries
  - Functions: `createHeadlinerPost`, `createLatestPost`, `createTopCategoriesPost`, `createSidePost`, `getHeadlinerPost`, `getLatestPosts`, `incrementIndexViewCount`
  - Supports all homepage sections with views tracking

#### Workflow Validated
1. Author creates and publishes article → `createArticlePage` + `publishArticle`
2. Agent generates thumbnails/headlines → `createHeadlinerPost`, `createLatestPost`, etc.
3. Index pages show in UI with agent-generated content
4. Users click → navigate to detail page via `postId`
5. Detail page retrieves full content → `getArticleBySlug`

#### TypeScript Status
- ✅ `articles.ts`: No errors
- ✅ `indexPage.ts`: No errors

---

### v1.0.0 - Initial Schema & Architecture Design
**Date**: Earlier session
**Status**: ✅ Foundation Laid

#### Key Decisions
- Separated `articlePage` and `indexPage` tables
- Introduced `postId` relationship model (one detail page → multiple index variants)
- Defined product vs. content categories (distinct)
- Planned product cross-referencing via tags/brand
- Structured product overview, specs, and reviews as separate detail pages

#### Schema Foundation
- `articlePage`, `indexPage`, `products`, `productCategories`, `reviews`, `specs` tables designed
- Author, brand, category, and tag relationships defined

---

## Current Implementation Status

### ✅ Completed
- `articles.ts` (articlePage refactoring)
- `indexPage.ts` (homepage index pages)
- `schema.ts` (core tables for articles and index pages)
- Documentation: ARTICLES_INDEXPAGE_INTEGRATION.md, REFACTORING_SUMMARY.md, IMPLEMENTATION_STATUS.md

### ⚠️ In Progress / Planned
- `indexPage.ts`: Extend for multi-context listing support
- `products.ts`: Dependent on schema updates
- `brands.ts`: Dependent on schema updates
- `reviews.ts`: Review creation and linked retrieval

### ❌ Blocked / Pending
- `products.ts` and `brands.ts`: TypeScript errors due to incomplete `specs` table in schema
  - Missing fields: title, slug, specs, isPublished, popularity, views, etc.
  - Requires schema update before completion

---

## Architectural Decisions

### 1. Two-Tier Content Model with Slug-Based Linking
- **Detail Pages**: Full, original content; author-controlled; has unique slug
- **Index Pages**: Agent-generated thumbnails for discovery; references same slug; may have different titles/images
- **Relationship**: `slug` is the single source of truth linking detail ↔ index
- **Multiple Variants**: One slug can have multiple index entries (different headlines for different contexts)
- **Benefit**: Slug-based linking is semantic and user-friendly (SEO, shareable)

### 2. Query-Based Filtering (Composable, No Context Field)
- Small, focused query functions for specific needs
- Examples: `getIndexByCategory()`, `getIndexByBrand()`, `getIndexByAuthor()`, `getIndexByTag()`, `getIndexByRating()`
- Filter functions (e.g., `filterByDateRange()`, `filterByPopularity()`) composed on top of base queries
- Schema remains minimal; queries are flexible and testable
- Enables client-side composition and complex filtering

### 3. Agent-Driven Thumbnail Generation with Publish Trigger
- Convex Agent generates alternative titles and thumbnail images on publish
- Trigger: When author sets `isPublished: true` with a public slug
- Agent accesses content via slug and creates `indexPage` entries
- Draft content does NOT trigger agent generation
- Agent creates multiple index variants for different discovery contexts

### 4. Approval Workflow (Pending Selection)
- **Option A (Auto-Generate After)**: Faster, less control
- **Option B (Approve Before)**: Full control, slower
- **Option C (Hybrid)**: Balance of both
- Selection impacts: author UX, content publication timeline, agent trigger timing

### 5. Product vs. Content Distinction
- Content categories: tech, business, entertainment, etc. (editorial)
- Product categories: phones, laptops, watches, etc. (e-commerce/specs)
- Products can reference content via tags/brand for related articles

### 6. Product Detail Page Separation
- **Product Overview**: Summary, specs overview, related content
- **Product Specs**: Detailed specs (schema varies by productCategory)
- **Product Reviews**: Linked to specs or product, aggregatable by aspect (build quality, performance, etc.)

---

## Key Facts & Relationships

### Content Detail ↔ Index Mapping
```
articlePage (detail)
  ├─ postId: "article-123"
  ├─ title: "Full Article Title"
  ├─ sections: [hero, body, aside, related]
  └─ authorId, tags, category, etc.

↓ (Agent generates thumbnails)

indexPage (index) — Multiple entries per detail
  ├─ postId: "article-123"
  ├─ section: "homepage-headliner"
  ├─ title: "Shorter Headline Version" (agent-generated)
  ├─ thumbnail: "thumbnail-image.jpg" (agent-generated)
  └─ views: 1000

  ├─ postId: "article-123"
  ├─ section: "category-tech"
  ├─ title: "Different Headline for Tech Category"
  ├─ thumbnail: "different-thumb.jpg"
  └─ views: 250
```

### Product System (Planned)
- **productOverview** detail page: Links to specs and reviews
- **specs** detail page: Product-specific details (schema by productCategory)
- **reviews** detail page: Linked to specs or product
- **indexPage entries**: Can link to product overview, specs, or reviews for different listing contexts

---

## Next Steps (Prioritized)

### Immediate (v1.2.0 - Multi-Context Index Pages)
**Depends on**: User decision on context tracking approach

**Tasks**:
1. Decide on `indexPage` schema updates (add `context`/`section` field? add `postType`?)
2. Update `indexPage.ts` with flexible filtering functions
3. Add context-specific query helpers (by category, brand, filter criteria)
4. Create integration guide for category pages, brand pages, filter pages
5. Test end-to-end for at least one listing type (e.g., category page)

### Short-term (v1.3.0 - Product System)
**Depends on**: Schema update to `specs` table

**Tasks**:
1. Update `schema.ts` with complete `specs` table fields
2. Complete `products.ts` with all product-related queries
3. Complete `brands.ts` with brand queries and counts
4. Create `reviews.ts` with review creation and linked retrieval
5. Validate TypeScript diagnostics for all product files
6. Create product integration docs

### Medium-term (v1.4.0 - Advanced Features)
**Tasks**:
1. End-to-end testing: author → publish → agent → index → frontend
2. Agent scheduling for automated thumbnail generation
3. A/B testing framework for thumbnail variants
4. Cross-product comparison queries
5. Performance optimization for large product/review datasets

### Long-term (v2.0.0+)
- Advanced search and filtering
- Recommendation engine
- User-specific personalization
- Analytics and insights

---

## File References

| File | Purpose | Status |
|------|---------|--------|
| `convex/articles.ts` | Article detail page operations | ✅ Complete |
| `convex/indexPage.ts` | Index/listing page operations | ✅ Basic Complete, ⏳ Extending for multi-context |
| `convex/products.ts` | Product operations | ⚠️ Blocked on schema |
| `convex/brands.ts` | Brand operations | ⚠️ Blocked on schema |
| `convex/reviews.ts` | Review operations | 📋 Planned |
| `convex/schema.ts` | Database schema | ⚠️ Needs specs table update |

---

## Documentation Files

| Path | Purpose |
|------|---------|
| `docs/changelog/CHANGELOG.md` | This file - version history and planning |
| `docs/plans/ARTICLES_INDEXPAGE_INTEGRATION.md` | Detailed article-to-index workflow |
| `docs/plans/REFACTORING_SUMMARY.md` | Initial refactoring overview |
| `docs/plans/IMPLEMENTATION_STATUS.md` | Implementation checklist |
| `docs/plans/CONVEX_IMPLEMENTATION.md` | Implementation guide |

---

## Questions for Next Session

1. **Multi-context indexPage**: Should we add a `context` or `section` field to track listing type?
2. **postType support**: Should indexPage entries support multiple detail page types (articles, specs, reviews, products)?
3. **Filtering strategy**: Query-based (e.g., `getIndexByContext`) or index-based?
4. **Priority**: Should we extend indexPage for multi-context first, or move to product system schema?

---

## Revision History

| Version | Date | Key Changes |
|---------|------|------------|
| 1.2.0 | 2024 | Clarified indexPage as multi-context listing system; added questions for expansion |
| 1.1.0 | Prior | Completed articles + indexPage; validated two-tier content model |
| 1.0.0 | Prior | Initial schema and architecture design |

---

**Last Updated**: 2024
**Maintained By**: Development Team
**Next Review**: Before v1.2.0 completion
