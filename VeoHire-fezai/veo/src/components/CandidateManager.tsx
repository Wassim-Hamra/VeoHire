import { useState, useRef, RefObject } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker";
import { useOnClickOutside } from "./useOnClickOutside";
import "../assets/styles/ListCandidat.css";
import "../assets/styles/UploadCv.css";

interface CandidateType {
  name: string;
  email: string;
  phone: string;
  score: number;
  adjustedScore: number;
  pros: string;
  cons: string;
  description: string;
  emailSent: boolean;
}

const adjustAndFormatScore = (probability: number): number => {
    // Ensure the input is between 0 and 1
    let adjustedScore = Math.max(0, Math.min(1, probability));
    
    // Generate random adjustment
    const getRandomAdjustment = (min: number, max: number): number => {
      return Math.random() * (max - min) + min;
    };
  
    // Apply adjustments based on score range
    if (adjustedScore < 0.5) {
      adjustedScore += getRandomAdjustment(0.1, 0.2);
    } else {
      adjustedScore -= getRandomAdjustment(0.1, 0.3);
    }
  
    // Convert to 10-point scale and ensure it stays within bounds
    const finalScore = Math.max(0, Math.min(10, adjustedScore * 10));
    
    // Round to one decimal place
    return Math.round(finalScore * 10) / 10;
};
  

// Sort function for candidates
const sortCandidatesByScore = (candidates: CandidateType[]): CandidateType[] => {
    return [...candidates].sort((a, b) => b.adjustedScore - a.adjustedScore);
};

const initialCandidates: CandidateType[] = sortCandidatesByScore([
]);

interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal = ({ message, onConfirm, onCancel }: ConfirmationModalProps) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
        <div className="modal-buttons">
          <button className="modal-confirm-btn" onClick={onConfirm}>Confirmer</button>
          <button className="modal-cancel-btn" onClick={onCancel}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

const CandidateManager = () => {
  const [candidates, setCandidates] = useState<CandidateType[]>(initialCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState<'accept' | 'reject' | null>(null);
  const [modalCandidateIndex, setModalCandidateIndex] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [extractedTexts, setExtractedTexts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const expandedRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(expandedRef as RefObject<HTMLElement>, () => {
    setSelectedCandidate(null);
  });

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const processCV = async (text: string): Promise<CandidateType> => {
    const response = await fetch("http://localhost:5160/Workflow/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cv_text: text }),
    });

    if (!response.ok) {
      throw new Error(`Erreur serveur: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      ...result,
      adjustedScore: adjustAndFormatScore(result.score),
      emailSent: false
    };
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
      // Process files one by one and update candidates list immediately after each
      for (const file of selectedFiles) {
        const extractedText = await extractTextFromPDF(file);
        const newCandidate = await processCV(extractedText);
        
        // Update candidates list with new candidate and sort
        setCandidates(prevCandidates => 
          sortCandidatesByScore([...prevCandidates, newCandidate])
        );
      }
    } catch (err: any) {
      console.error("Erreur lors du traitement:", err);
      setError("Erreur lors du traitement des CVs.");
    } finally {
      setIsLoading(false);
      setSelectedFiles([]);
    }
  };

  const handleActionClick = (index: number, action: 'accept' | 'reject', e: React.MouseEvent) => {
    e.stopPropagation();
    setModalCandidateIndex(index);
    setModalAction(action);
    setModalVisible(true);
  };

  const performAction = async () => {
    if (modalCandidateIndex === null || modalAction === null) return;
    const candidate = candidates[modalCandidateIndex];
    const actionText = modalAction === 'accept' ? 'accepter' : 'rejeter';
    try {
      const endpoint = modalAction === 'accept' ? 'accepted' : 'rejected';
      const response = await fetch(`http://localhost:5160/Email/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Name: candidate.name, Email: candidate.email }),
      });
      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.statusText}`);
      }
      
      // Update emailSent status and maintain sort order
      setCandidates(prevCandidates => {
        const updatedCandidates = prevCandidates.map((c, idx) => 
          idx === modalCandidateIndex ? { ...c, emailSent: true } : c
        );
        return sortCandidatesByScore(updatedCandidates);
      });
      
      console.log(`Email de ${actionText} envoyé à ${candidate.name}`);
    } catch (err) {
      console.error(`Erreur lors de l'envoi de l'email à ${candidate.name}:`, err);
    } finally {
      setModalVisible(false);
      setModalAction(null);
      setModalCandidateIndex(null);
    }
  };

  const cancelAction = () => {
    setModalVisible(false);
    setModalAction(null);
    setModalCandidateIndex(null);
  };

  const toggleDetails = (index: number) => {
    setSelectedCandidate(selectedCandidate === index ? null : index);
  };

  return (
    <div>
      <div className="upload-container">
        <h2>Upload and Extract Text</h2>
        <input type="file" accept=".pdf" multiple onChange={handleFileChange} />
        <button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Traitement en cours..." : "Extraire et Traiter"}
        </button>
        {error && <p className="error">{error}</p>}
      </div>


    {candidates.length > 0 ? (
      <div className="list-candidates">
        <h2>List of candidates <h4>(order by score)</h4></h2>
        <div className="candidates-container">
          {candidates.map((candidate, index) => (
            <div
              key={index}
              className={`candidate-item ${selectedCandidate === index ? "selected" : ""}`}
              ref={selectedCandidate === index ? expandedRef : null}
              onClick={() => toggleDetails(index)}
            >
              <div className="candidate-row">
              <div className="candidate-name">
                {candidate.name !== "NaN" && candidate.name}
                </div>
                <div className="candidate-contact">
                {candidate.email !== "NaN" && <p>{candidate.email}</p>}
                {candidate.phone !== "NaN" && <p>{candidate.phone}</p>}
                </div>

                <div className="candidate-score">
                    {candidate.adjustedScore} /10
                </div>
                <div className="candidate-actions">
                  {candidate.emailSent ? (
                    <span>Email sent !</span>
                  ) : (
                    <>
                      <button className="accept-btn" onClick={(e) => handleActionClick(index, 'accept', e)}>
                        Accept
                      </button>
                      <button className="reject-btn" onClick={(e) => handleActionClick(index, 'reject', e)}>
                        Reject
                      </button>
                    </>
                  )}
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
      </div>) : (
        <div className="no-candidates">
            <h2 className="list-candidates h2">No candidates treated yet. Start by uploading some CVs.</h2>
        </div>
        )}

      {modalVisible && modalAction && modalCandidateIndex !== null && (
        <ConfirmationModal
          message={`Êtes-vous sûr de vouloir ${modalAction === 'accept' ? "accepter" : "rejeter"} ${candidates[modalCandidateIndex].name} ?`}
          onConfirm={performAction}
          onCancel={cancelAction}
        />
      )}
    </div> 
  );
};

export default CandidateManager;