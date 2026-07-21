

This project is an application that helps an immigration lawyer review the documents submitted for a client with a case

For this prototype, we want AI-assisted review, not just document organisation.

The application should help the lawyer:

* see which documents have been submitted for a case;
* identify which required documents are missing;
* flag obvious problems in submitted documents;
* review the AI’s findings before accepting or rejecting them.

For this MVP, hard-coding the checklist is acceptable.

We do not need a UI for lawyers to configure document requirements. However, I would prefer the checklist to be represented in a way that could be replaced later, rather than scattered throughout the application logic.

Different clients may submit different files or incomplete sets, but the required checklist itself does not change.

The AI does not make the final legal decision. The lawyer remains in control.

For the MVP, you can assume one visa type and a predefined checklist of required documents.

For the MVP, assume a single visa type with one fixed checklist of required document categories for every case.

For the MVP, use this fixed checklist:

** Required documents **
1. Passport
 * Must be present.
 * Must not be expired.
 * The holder’s name should match the client’s name.
 * The passport number should be readable.
2. Visa application form
 * Must be present.
 * Must be signed.
 * The applicant’s name should match the client’s name.
 * Required fields should not be empty.
3. Proof of employment
 * Must be present.
 * Should contain the employer’s name.
 * Should contain the applicant’s name.
 * Should be dated within the last 90 days.
4. Bank statement
 * Must be present.
 * Should contain the applicant’s name.
 * Should be dated within the last 90 days.
 * The document should contain at least one visible account balance.

For the prototype, you can assume that uploaded documents are text-based or that text extraction is already available. You do not need to implement OCR.

The application should identify:

missing document categories;
failed validation criteria;
criteria it could not confidently evaluate.

The lawyer should then be able to review each finding and mark it as accepted or dismissed.

For this interview, please build a small web application with a simple UI.

The lawyer should be able to:

* open one client case;
* see the required-document checklist;
* see submitted documents and AI-generated findings;
* distinguish missing, failed, and uncertain checks;
* accept or dismiss individual findings.

A polished design is not necessary. I care more about a clear workflow and a working end-to-end prototype.

For the MVP, supporting plain text files is enough. You can accept .txt files only and treat their contents as the already-extracted document text.

I would evaluate the prototype using a few sample text files representing the four document categories. I care more about the review workflow and validation logic than PDF parsing.

Please make the file-type limitation clear in the UI or README, and structure the extraction step behind an interface so PDF or OCR support could be added later.

For this MVP, build only the lawyer-facing interface.

Assume the client has already submitted the files. You can preload sample documents or let the lawyer upload them into the case for demonstration purposes, but we do not need a separate client portal.

The resubmission loop is also out of scope. The lawyer only needs to review the current submission, accept or dismiss findings, and see which documents still require attention.

You may mention client notifications and document resubmission as a logical next step, but do not implement them unless the core workflow is already complete.
