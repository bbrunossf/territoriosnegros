import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles.css'
import App from './App.tsx'
import ProtectedRoute from "./components/ProtectedRoute";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./routes/login";
import Admin from "./routes/admin";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
  </StrictMode>,
)
