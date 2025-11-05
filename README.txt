MURA STORE

Instruction
Backend:
  cd backend
  npm install
  cp .env.example .env
  # edit .env
  npm start

Frontend:
  cd frontend
  npm install
  npm run dev

Frontend expects API at VITE_API_URL or defaults to http://localhost:4242
