---
paths: backend/src/models/**
---

# Data models (Mongoose 8)

- **Schemas use `{ timestamps: true }`** and export both the `I<Name>` interface and the model.
  Keep the interface and schema in sync when adding fields.
- **Money fields are integer paise** with `min: 0`. Never store rupees or floats.
- **Index deliberately.** Add indexes for fields you filter/sort on at scale (e.g. `clerkId`,
  `email` unique; product text index on `title/description/tags`; compound indexes for list
  queries). Don't leave hot list queries unindexed.
- **Soft-delete, don't hard-delete** where the PRD expects it: toggle `isActive: false`
  (users, products, categories) instead of removing documents.
- **Refs & population:** relate documents with `Schema.Types.ObjectId` + `ref`. Populate only the
  fields you need.
- **Read queries use `.lean()`** when you don't need Mongoose documents/hooks.
- **Denormalized snapshots are intentional:** order items snapshot `title`/`image`/`price` at
  purchase time; cart items snapshot `priceAtAdd`. Preserve these — don't "normalize" them away.
- Keep rating recalculation in the `Review` post-save hook; don't duplicate that logic in controllers.
