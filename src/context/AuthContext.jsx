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
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signinWithGoogle() {
    try {
      setError(null);
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
      });

      if (error) throw error;
    } catch (err) {
      console.error(err.message);
      setError(err.message);
    }
  }

  async function signout() {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err) {
      console.error(err.message);
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
