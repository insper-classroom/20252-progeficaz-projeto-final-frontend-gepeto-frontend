import { BrowserRouter, Routes, Route } from "react-router-dom";
import Chat from "./pages/chat/chat";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard/Dashboard";
import CadastroVeiculo from "./pages/dashboard/CadastroVeiculo";
import RemoverVeiculo from "./pages/dashboard/RemoverVeiculo";
import Interessados from "./pages/dashboard/Interessados";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/cadastro" element={<CadastroVeiculo />} />
        <Route path="/dashboard/remover" element={<RemoverVeiculo />} />
        <Route path="/dashboard/interessados" element={<Interessados />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
