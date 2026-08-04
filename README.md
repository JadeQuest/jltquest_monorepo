# JLTQuest Monorepo

This repository is managed as a pnpm workspace and contains the folder structure for:
- **`backend`**: Node.js / Express REST API and services
- **`frontend`**: Web application
- **`mobile`**: Mobile application (Flutter / React Native)

---

## 📁 Repository Structure

```
jltquest_monorepo/
├── backend/            # Express Backend API
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   └── package.json
├── frontend/           # Web Application
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   ├── public/
│   └── package.json
├── mobile/             # Mobile Application
│   ├── lib/
│   │   ├── models/
│   │   ├── screens/
│   │   ├── services/
│   │   └── widgets/
│   └── pubspec.yaml
├── package.json        # Workspace Root Config
└── pnpm-workspace.yaml # PNPM Workspace Definition
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- pnpm >= 8 (`npm i -g pnpm`)

### Installation

Install all workspace dependencies:
```bash
pnpm install
```
