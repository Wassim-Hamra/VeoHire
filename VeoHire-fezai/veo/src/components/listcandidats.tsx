import { useState, useRef, RefObject } from "react";
import { useOnClickOutside } from "./useOnClickOutside";
import "../assets/styles/ListCandidat.css";

interface CandidateType {
  name: string;
  email: string;
  phone: string;
  score: number;
  pros: string;
  cons: string;
  description: string;
  emailSent: boolean;
}

const initialCandidates: CandidateType[] = [
  { name: 'Alice Johnson', email: 'alice@example.com', phone: '123-456-7890', score: 85, pros: 'Strong communication, Leadership', cons: 'Limited technical knowledge', description: 'A passionate leader with an ability to inspire teams.', emailSent: false },
  { name: 'Bob Smith', email: 'bob@example.com', phone: '234-567-8901', score: 92, pros: 'Analytical thinking, Problem-solving', cons: 'Prefers to work alone', description: 'Expert in data analysis with experience in machine learning.', emailSent: false },
  // Add other candidates similarly...
];

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

const ListCandidats = () => {
  const [candidates, setCandidates] = useState<CandidateType[]>(initialCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState<'accept' | 'reject' | null>(null);
  const [modalCandidateIndex, setModalCandidateIndex] = useState<number | null>(null);
  const expandedRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(expandedRef as RefObject<HTMLElement>, () => {
    setSelectedCandidate(null);
  });

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
      // Update the candidate's emailSent status immediately
      const updatedCandidates = [...candidates];
      updatedCandidates[modalCandidateIndex].emailSent = true;
      setCandidates(updatedCandidates);
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
    <div className="list-candidates">
      <h2>Explore the liste of candidates</h2>
      <div className="candidates-container">
        {candidates.map((candidate, index) => (
          <div
            key={index}
            className={`candidate-item ${selectedCandidate === index ? "selected" : ""}`}
            ref={selectedCandidate === index ? expandedRef : null}
            onClick={() => toggleDetails(index)}
          >
            <div className="candidate-row">
              <div className="candidate-name">{candidate.name}</div>
              <div className="candidate-contact">
                <p>{candidate.email}</p>
                <p>{candidate.phone}</p>
              </div>
              <div className="candidate-score">{candidate.score}</div>
              <div className="candidate-actions">
                {candidate.emailSent ? (
                  <span>Email Sent !</span>
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

export default ListCandidats;
