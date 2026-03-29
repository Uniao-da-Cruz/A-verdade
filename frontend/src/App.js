import "@/App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import MapaPeriferias from "@/pages/MapaPeriferias";
import PoliticianRegistryPage from "@/pages/PoliticianRegistryPage";

function HomeRedirect() {
  return <Navigate to="/auth" replace />;
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/dashboard"
              element={(
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/registro-politicos"
              element={(
                <ProtectedRoute>
                  <PoliticianRegistryPage />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/mapa-periferias"
              element={(
                <ProtectedRoute>
                  <MapaPeriferias />
                </ProtectedRoute>
              )}
            />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
}

export default App;
