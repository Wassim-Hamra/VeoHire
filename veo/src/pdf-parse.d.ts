declare module 'pdf-parse' {
    interface PDFParseResult {
      text: string;
      metadata: any;
    }
  
    function pdfParse(data: Buffer | Uint8Array): Promise<PDFParseResult>;
  
    export = pdfParse;
  }