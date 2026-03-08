import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import PoliticianProfile from "./pages/PoliticianProfile";
import PoliticalSpectrum from "./pages/PoliticalSpectrum";
import EducationalResources from "./pages/EducationalResources";
import SocialPrograms from "./pages/SocialPrograms";
import NuclearRisks from "./pages/NuclearRisks";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/politician/:id" element={<PoliticianProfile />} />
          <Route path="/spectrum" element={<PoliticalSpectrum />} />
          <Route path="/resources" element={<EducationalResources />} />
          <Route path="/programas-sociais" element={<SocialPrograms />} />
          <Route path="/riscos-nucleares" element={<NuclearRisks />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
