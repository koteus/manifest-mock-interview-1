export interface ExtractableDocument {
  filename: string;
  bytes: Buffer;
}

export interface TextExtractor {
  /**
   * Extract plain text from a document payload.
   * MVP supports .txt only; PDF/OCR can implement the same interface later.
   */
  extract(document: ExtractableDocument): Promise<string>;
}
