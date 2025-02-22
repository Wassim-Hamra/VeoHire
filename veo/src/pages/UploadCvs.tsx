import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker";
import "../assets/styles/UploadCV.css";
import ListCandidats from "../components/listcandidats";


const UploadCvs = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [extractedTexts, setExtractedTexts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);

  // 📌 Fonction pour gérer la sélection de fichiers
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  // 📌 Fonction pour extraire du texte d’un PDF
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

  // 📌 Fonction pour envoyer les données à l’API
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
      // Extraire le texte de tous les fichiers PDF sélectionnés
      const texts = await Promise.all(selectedFiles.map(extractTextFromPDF));
      setExtractedTexts(texts);
      console.log("📜 Texte extrait :", texts);

      // Construire le JSON à envoyer
      const data = {
        files: selectedFiles.map((file, index) => ({
          fileName: file.name,
          content: texts[index],
        })),
      };

      console.log("📡 Envoi des données à l'API...");
      const response = await fetch("https://localhost:5001/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("✅ Réponse de l'API :", result);
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi à l'API :", error);
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

      {/* Candidate List Section */}
      <section className="candidate-list-section">
        <h2>Explorez nos candidats</h2>

        <div className="candidate-table">
          <div className="candidate-header">
            <div className="candidate-column">Nom</div>
            <div className="candidate-column">Email & Téléphone</div>
            <div className="candidate-column">Score</div>
            <div className="candidate-column">Actions</div>
          </div>
        </div>
        <ListCandidats/>
      </section>
    </div>
  );
};

export default UploadCvs;
