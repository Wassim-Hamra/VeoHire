import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import JobForm from "./pages/JobForm";
import "./assets/styles/global.css";
import Navbar from "./components/navbar";
import Footer from "./components/Footer";
import CandidateManager from "./components/CandidateManager";
import Home from "./components/home";
import PresentationSection from "./components/presentationSection";
import HeroSection from './components/HeroSection';
import Image from './components/Image';

const App = () => {
  return (
    <Router>
      <Navbar></Navbar>
      <PresentationSection></PresentationSection>
      <Routes>
      <Route path="/" element={<>

                                  <Image/>
                                  <Home />
                                  <HeroSection/>

                              </>} />
        <Route path="/jobform" element={<JobForm />} />
        <Route path="/candidatemanager" element={<CandidateManager />} />
      </Routes>
      <Footer></Footer>
    </Router>
  );
};

export default App;