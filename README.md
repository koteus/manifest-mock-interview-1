# manifest-mock-interview-1

Lawyer-facing prototype for reviewing a client immigration document submission.

## Slice 1 (current)

Open the demo case, see the four-document checklist, submitted `.txt` files with declared categories, and requirements derived as missing when no file declares that category.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Case API: `GET /api/case`.

Documents are preloaded from `samples/cases/demo-case/` (`.txt` only). Upload, AI review, and accept/dismiss land in later slices.
