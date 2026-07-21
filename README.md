# manifest-mock-interview-1

Lawyer-facing prototype for reviewing a client immigration document submission.

## Run

```bash
npm install
cp .env.example .env.local   # or edit the existing .env.local
# set OPENAI_API_KEY in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Case API: `GET /api/case`
- Run AI review: `POST /api/review/run`

## Current slices

1. **Case + checklist shell** — preloaded demo case, declared categories, submitted vs missing derived from the checklist.
2. **AI review run** — OpenAI **Responses API** with **`gpt-5.6-luna`** evaluates submitted documents; findings are labelled **missing**, **failed**, or **uncertain**, with explanations and evidence snippets where available.
3. **Accept / dismiss** — lawyers can accept or dismiss each finding; decisions persist in the in-memory repository for the running server session (survived by page refresh until process restart). Re-running AI review replaces findings and clears prior decisions.

Uses the official `openai` Node SDK (latest) and Structured Outputs via `text.format` ([docs](https://developers.openai.com/api/docs/guides/structured-outputs)).

Documents are preloaded from `samples/cases/demo-case/` (`.txt` only). Accept/dismiss of findings is supported for the current server session.

- Case API: `GET /api/case`
- Run AI review: `POST /api/review/run`
- Accept/dismiss finding: `PATCH /api/findings/:findingId` with `{ "reviewStatus": "accepted" | "dismissed" }`
