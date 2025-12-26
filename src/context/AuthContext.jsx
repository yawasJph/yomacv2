
import { supabaseClient } from "../supabase/supabaseClient";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 👈 loading inicial
  const [error, setError] = useState(null);

  useEffect(() => {
    // Obtiene la sesión al cargar la app
    supabaseClient.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user ?? null);
      setLoading(false);
    });

    // Listener de cambios de sesión
   const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const email = session.user.email;
      const domain = email.split('@')[1];
      const allowedDomains = ['gmail.com'];

      if (!allowedDomains.includes(domain)) {
        await supabaseClient.auth.signOut();
        setUser(null);
        setError("Dominio de correo no autorizado.");
      } else {
        setUser(session.user);  
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  });

    return () => subscription.unsubscribe();
  }, []);

  async function signinWithGoogle() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Esto asegura que si el trigger falla, el error regrese aquí
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error("Error en login:", err.message);
      setError(
        "Solo se permiten correos institucionales (@institutomanuelarevalo.delm.edu.pe)"
      );
    } finally {
      setLoading(false);
    }
  }

  async function signout() {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err) {
      console.error(err.message);
      setError(null)
      setError(err.message);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signinWithGoogle,
        signout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
