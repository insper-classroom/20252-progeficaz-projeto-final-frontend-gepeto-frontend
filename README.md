# 🚗 Projeto Final — Frontend React (Concessionária Inteligente)

![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black&style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white&style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white&style=for-the-badge)
![AWS](https://img.shields.io/badge/AWS-EC2-FF9900?logo=amazon-aws&logoColor=white&style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black&style=for-the-badge)

---

## 🌐 Acesso ao Site

O projeto está hospedado na AWS EC2 e pode ser acessado no link abaixo:

👉 **[http://56.124.79.244:5173](http://56.124.79.244:5173)**  


---

## 🧭 Sobre o Projeto

O **Frontend React** é a interface web do sistema **Concessionária Inteligente (Gepeto)**, conectando-se à API Flask para exibir, cadastrar e recomendar veículos de forma intuitiva e responsiva.

Principais objetivos:
- Exibir veículos cadastrados na base MongoDB;
- Interagir com o chatbot de recomendações usando IA (OpenAI API);
- Permitir login e acesso restrito ao painel administrativo.

---

## 💬 Funcionalidades Principais

### 🧠 Chat de Recomendação
- Interface moderna e dinâmica em estilo SaaS.
- Envia mensagens ao endpoint Flask `/api/recomendacao`.
- Retorna sugestões inteligentes baseadas no perfil do usuário.

---

### 🧰 Dashboard Administrativo
- Tela exclusiva para funcionários autenticados via JWT.
- Permite **CRUD de veículos** (criação, edição, remoção e listagem).
- Design responsivo e leve, usando **Inter + Poppins** e **gradientes azul-violeta**.

---

## ⚙️ Tecnologias Utilizadas

| Categoria | Tecnologia / Framework |
|------------|------------------------|
| Frontend Framework | React + Vite |
| Estilização | CSS moderno (tema Gradient SaaS) |
| Roteamento | React Router DOM |
| Integração com API | Fetch / Axios |
| Backend conectado | Flask (API REST) |
| Deploy | AWS EC2 |
| Dependências | Node.js 20+ e npm 10+ |


