import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker";
import "../assets/styles/UploadCV.css";

// Sample candidate data
const candidates = [
  { name: 'Alice Johnson', email: 'alice@example.com', phone: '123-456-7890', score: 85, pros: 'Strong communication, Leadership', cons: 'Limited technical knowledge', description: 'A passionate leader with an ability to inspire teams.' },
  { name: 'Bob Smith', email: 'bob@example.com', phone: '234-567-8901', score: 92, pros: 'Analytical thinking, Problem-solving', cons: 'Prefers to work alone', description: 'Expert in data analysis with experience in machine learning.' },
  { name: 'Charlie Brown', email: 'charlie@example.com', phone: '345-678-9012', score: 75, pros: 'Creative, Good with clients', cons: 'Needs supervision', description: 'A creative designer who has worked on several branding projects.' },
  { name: 'David Williams', email: 'david@example.com', phone: '456-789-0123', score: 90, pros: 'Strategic thinker, Team player', cons: 'Can be overly critical', description: 'Experienced project manager who can lead teams efficiently.' },
  { name: 'Emma Davis', email: 'emma@example.com', phone: '567-890-1234', score: 80, pros: 'Detail-oriented, Great time manager', cons: 'Can be impatient', description: 'A highly organized and efficient operations manager.' }
];

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

  // Toggle the selected candidate details
  const toggleDetails = (index: number) => {
    setSelectedCandidate(selectedCandidate === index ? null : index);
  };

  const handleAccept = (index: number) => {
    console.log(`Accepted candidate: ${candidates[index].name}`);
  };

  const handleReject = (index: number) => {
    console.log(`Rejected candidate: ${candidates[index].name}`);
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

          {candidates.map((candidate, index) => (
            <div
              className="candidate-row"
              key={index}
              onClick={() => toggleDetails(index)}
            >
              <div className="candidate-column">{candidate.name}</div>
              <div className="candidate-column">
                <p>{candidate.email}</p>
                <p>{candidate.phone}</p>
              </div>
              <div className="candidate-column">
                <span className="candidate-score">{candidate.score}</span>
              </div>
              <div className="candidate-column">
                <div className="candidate-actions">
                  <button className="accept-btn" onClick={() => handleAccept(index)}>
                    Accepter
                  </button>
                  <button className="reject-btn" onClick={() => handleReject(index)}>
                    Rejeter
                  </button>
                </div>
              </div>
              {selectedCandidate === index && (
                <div className="candidate-details">
                  <p><strong>Pros:</strong> {candidate.pros}</p>
                  <p><strong>Cons:</strong> {candidate.cons}</p>
                  <p><strong>Description:</strong> {candidate.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default UploadCvs;
