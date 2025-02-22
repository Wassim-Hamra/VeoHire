import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/JobForm.css";

const JobForm = () => {
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    requirements: "",
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setJobData({ ...jobData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/uploadcv");
  };

  return (
    <div className="job-form">
      <div className="text-center mb-6">
        <h2>Décrire le poste</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title">Titre du poste</label>
          <input
            type="text"
            name="title"
            id="title"
            placeholder="Titre du poste"
            value={jobData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description">Description</label>
          <textarea
            name="description"
            id="description"
            placeholder="Décrivez le poste"
            value={jobData.description}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="requirements">Exigences</label>
          <textarea
            name="requirements"
            id="requirements"
            placeholder="Listez les exigences"
            value={jobData.requirements}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>

        <button type="submit" className="button">
          Suivant
        </button>
      </form>
    </div>
  );
};

export default JobForm;