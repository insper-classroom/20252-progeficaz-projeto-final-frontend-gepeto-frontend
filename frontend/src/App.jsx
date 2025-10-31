import { BrowserRouter, Routes, Route } from "react-router-dom";
import Chat from "./pages/chat/chat";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard/Dashboard";
import CadastroVeiculo from "./pages/dashboard/CadastroVeiculo";
import EditarVeiculo from "./pages/dashboard/EditarVeiculo";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/cadastro" element={<CadastroVeiculo />} />
        <Route path="/dashboard/editar/:id" element={<EditarVeiculo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
