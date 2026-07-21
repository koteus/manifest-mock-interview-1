import { getCaseView } from "@/lib/case/get-case-view";
import { buildCategoryLabelLookup } from "@/lib/case/category-labels";
import { CaseHeader } from "./components/CaseHeader";
import { ChecklistSection } from "./components/ChecklistSection";
import { DocumentsSection } from "./components/DocumentsSection";
import { FindingsPanel } from "./components/FindingsPanel";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getCaseView();
  const categoryLabels = buildCategoryLabelLookup(data.checklist.categories);

  return (
    <main className={styles.page}>
      <CaseHeader caseRecord={data.case} />
      <ChecklistSection checklistStatus={data.checklistStatus} />
      <DocumentsSection
        checklistStatus={data.checklistStatus}
        documents={data.documents}
        categoryLabels={categoryLabels}
      />
      <FindingsPanel
        initialFindings={data.findings}
        documents={data.documents}
        checklistCategories={data.checklist.categories}
      />
    </main>
  );
}
