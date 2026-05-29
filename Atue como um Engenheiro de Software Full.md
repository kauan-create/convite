Atue como um Engenheiro de Software Full Stack e Designer de UI/UX especialista em soluções Serverless e Web App.

Preciso que você crie um projeto completo (arquitetura do sistema, modelagem do banco de dados e o código-fonte estruturado) para um aplicativo web de Confirmação de Presença Online (RSVP). 

Siga estritamente os requisitos abaixo para a construção da aplicação:

---

### 1. Escopo Técnico e Arquitetura (Cloud & Serverless)
* **Disponibilidade:** O programa deve rodar 100% em nuvem (24/7 online), sem a necessidade de manter uma máquina local ligada. 
* **Stack Sugerida:** Sugira tecnologias de fácil deploy gratuito ou de baixíssimo custo (Ex: Frontend no Vercel/Netlify, Backend Serverless com Node.js/Python, e Banco de Dados gerenciado na nuvem como Supabase ou Firebase).
* **Código Editável:** O código deve ser limpo, modular, amplamente documentado e totalmente editável para futuras manutenções.

---

### 2. Regras de Negócio e Funcionalidades

#### A. Painel do Administrador (Acesso Protegido)
* **Gerenciamento Manual:** O administrador deve ter uma tela exclusiva para inserir, editar ou excluir manualmente um convidado individual ou um grupo de convidados (ex: Família Silva - 4 integrantes).
* **Visualização:** Uma tabela ou lista mostrando quem já confirmou, quem recusou e quem ainda não respondeu, além do total de adultos e crianças confirmados.

#### B. Tela do Convidado (Interface Pública)
* **Fluxo de Confirmação:** O convidado acessa, busca pelo seu nome ou código do grupo, visualiza os membros do seu grupo e marca quem irá comparecer.
* **Contagem Regressiva:** Deve exibir um contador dinâmico (dias, horas, minutos e segundos) regressando para a data do evento: **28/06/2026**.

---

### 3. Interface e Identidade Visual (UI/UX)
* **Tema:** O tema estético deve ser focado em "Mickey Safari".
* **Paleta de Cores:** Utilize tons de safari e elementos que remetam à proposta (Ex: verde-oliva, tons de areia/bege, marrom-terra, com sutis toques de amarelo ou preto/vermelho que lembrem o Mickey clássico de forma elegante).
* **Estilo:** A interface deve ser moderna, limpa, responsiva (focada em dispositivos móveis, já que a maioria dos convidados acessa pelo celular) e altamente intuitiva.

---

### 4. Modelo de Dados (Banco de Dados)
* Crie a estrutura das tabelas necessárias (Ex: `Grupos`, `Convidados`, `Usuarios_Admin`).
* Garanta o relacionamento correto para que um "Grupo" possa ter múltiplos "Convidados" vinculados.

---

### O que você deve me entregar primeiro:
1. A arquitetura sugerida (quais ferramentas gratuitas/nuvem usar para o banco de dados e hospedagem).
2. O script SQL ou estrutura NoSQL para o Banco de Dados.
3. O código estruturado do Frontend (HTML/CSS/JS ou React/Tailwind) já aplicando o tema visual Mickey Safari e o componente do cronômetro regressivo.
4. O código do Backend/API para gerenciar os convidados e as confirmações.