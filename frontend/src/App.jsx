import { BrowserRouter, Routes, Route } from "react-router-dom";
import Chat from "./pages/chat/Chat";
import Login from "./pages/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import CadastroVeiculo from "./pages/dashboard/CadastroVeiculo";
import EditarVeiculo from "./pages/dashboard/EditarVeiculo";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/cadastro" element={<ProtectedRoute><CadastroVeiculo /></ProtectedRoute>} />
        <Route path="/dashboard/editar/:id" element={<ProtectedRoute><EditarVeiculo /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
