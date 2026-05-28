import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Props = {
  children: ReactNode;
};

export default function ProtectedRoute({
  children,
}: Props) {
  const [loading, setLoading] =
    useState(true);

  const [authenticated,
    setAuthenticated] =
    useState(false);

  useEffect(() => {
    async function verificar() {
      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      setAuthenticated(!!session);

      setLoading(false);
    }

    verificar();
  }, []);

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
