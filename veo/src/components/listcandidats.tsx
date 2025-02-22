import { useState } from "react";
import "../assets/styles/ListCandidat.css";

// Candidate data directly inside the component
const candidates = [
  { name: 'Alice Johnson', email: 'alice@example.com', phone: '123-456-7890', score: 85, pros: 'Strong communication, Leadership', cons: 'Limited technical knowledge', description: 'A passionate leader with an ability to inspire teams.' },
  { name: 'Bob Smith', email: 'bob@example.com', phone: '234-567-8901', score: 92, pros: 'Analytical thinking, Problem-solving', cons: 'Prefers to work alone', description: 'Expert in data analysis with experience in machine learning.' },
  { name: 'Charlie Brown', email: 'charlie@example.com', phone: '345-678-9012', score: 75, pros: 'Creative, Good with clients', cons: 'Needs supervision', description: 'A creative designer who has worked on several branding projects.' },
  { name: 'David Williams', email: 'david@example.com', phone: '456-789-0123', score: 90, pros: 'Strategic thinker, Team player', cons: 'Can be overly critical', description: 'Experienced project manager who can lead teams efficiently.' },
  { name: 'Emma Davis', email: 'emma@example.com', phone: '567-890-1234', score: 80, pros: 'Detail-oriented, Great time manager', cons: 'Can be impatient', description: 'A highly organized and efficient operations manager.' }
];

const ListCandidats = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);

  // Handle the Accept button action
  const handleAccept = (index: number) => {
    console.log(`Accepted candidate: ${candidates[index].name}`);
  };

  // Handle the Reject button action
  const handleReject = (index: number) => {
    console.log(`Rejected candidate: ${candidates[index].name}`);
  };

  // Toggle the selected candidate details
  const toggleDetails = (index: number) => {
    setSelectedCandidate(selectedCandidate === index ? null : index);
  };

  return (
    <div className="upload-container">
      <h2>Explorez nos candidats</h2>

      <div className="candidate-table">
        {candidates.map((candidate, index) => (
          <div
            className="candidate-row"
            key={index}
            style={{ border: "2px solid green", margin: "10px 0" }}
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
                <button
                  className="accept-btn"
                  onClick={() => handleAccept(index)}
                >
                  Accepter
                </button>
                <button
                  className="reject-btn"
                  onClick={() => handleReject(index)}
                >
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
    </div>
  );
};

export default ListCandidats;
