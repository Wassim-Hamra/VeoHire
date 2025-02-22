import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import JobForm from "./pages/JobForm";
import UploadCV from "./pages/UploadCvs";
import "./assets/styles/global.css";
import Navbar from "./components/navbar";
import Home from "./components/home";
import PresentationSection from "./components/presentationSection";

const App = () => {
  return (
    <Router>
      <Navbar></Navbar>
      <PresentationSection></PresentationSection>
      <Home></Home>
      <Routes>
        <Route path="/" element={<JobForm />} />
        <Route path="/uploadcv" element={<UploadCV />} />
      </Routes>
    </Router>
    
  );
};

export default App;