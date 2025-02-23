import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker";
import "../assets/styles/UploadCV.css";

const UploadCvs = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [extractedTexts, setExtractedTexts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      reader.onload = async () => {
        try {
          const pdfData = new Uint8Array(reader.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
          let extractedText = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            extractedText += textContent.items.map((item: any) => item.str).join(" ") + "\n";
          }

          resolve(extractedText);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => {
        reject(reader.error);
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (selectedFiles.length === 0) {
      setError("Aucun fichier sélectionné !");
      setIsLoading(false);
      return;
    }

    try {
      // Extract text from all selected PDF files
      const texts = await Promise.all(selectedFiles.map(extractTextFromPDF));
      // Combine texts into one single string
      const combinedText = texts.join("\n");
      setExtractedTexts([combinedText]);

      // Build the payload with only the cv_text field
      const payload = { cv_text: combinedText };

      const response = await fetch("http://localhost:5160/Cv/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Réponse de l'API :", result);
    } catch (err: any) {
      console.error("Erreur lors de l'envoi à l'API :", err);
      setError("Erreur lors de l'envoi des données à l'API.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Uploader et Extraire du Texte</h2>
      <input type="file" accept=".pdf" multiple onChange={handleFileChange} />
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Extraction en cours..." : "Extraire et Envoyer"}
      </button>

      {error && <p className="error">{error}</p>}

      {extractedTexts.length > 0 && (
        <div className="text-output">
          <h3>Texte Extrait :</h3>
          <pre>{JSON.stringify(extractedTexts, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default UploadCvs;
