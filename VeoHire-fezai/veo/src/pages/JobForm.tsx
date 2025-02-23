import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/JobForm.css";

const JobForm = () => {
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    requirements: "",
    keywords: "", // New input field for keywords
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setJobData({ ...jobData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("jobData", JSON.stringify(jobData));
    navigate("/candidatemanager");
  };

  return (
    <>
    <div className="job-form">
      <div className="text-center mb-6">
        <h2>Post Description</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title">Post Title</label>
          <input
            type="text"
            name="title"
            id="title"
            placeholder="Post Title"
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
            placeholder="Describe the offer"
            value={jobData.description}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="requirements">Requirements</label>
          <textarea
            name="requirements"
            id="requirements"
            placeholder="List Your Requirements..."
            value={jobData.requirements}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="keywords">Keywords</label>
          <input
            type="text"
            name="keywords"
            id="keywords"
            placeholder="Keywrods: Ex: 5years, Fullstack"
            value={jobData.keywords}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="button">
          Next
        </button>
      </form>
    </div>
    </>
  );
};

export default JobForm;
