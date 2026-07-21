import type { ExtractableDocument, TextExtractor } from "@/lib/extraction/types";

export class PlainTextExtractor implements TextExtractor {
  async extract(document: ExtractableDocument): Promise<string> {
    if (!document.filename.toLowerCase().endsWith(".txt")) {
      throw new Error(
        `PlainTextExtractor only supports .txt files (got ${document.filename}).`,
      );
    }

    return document.bytes.toString("utf8");
  }
}
