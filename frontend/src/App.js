import "@/App.css";

import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function App() {
  return (
    <div className="App">
      <BrowserRouter>

      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
