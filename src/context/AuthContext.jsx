import { supabaseClient } from "../supabase/supabaseClient";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 👈 loading inicial
  const [error, setError] = useState(null);

  // useEffect(() => {
  //   supabaseClient.auth.getSession().then(({ data }) => {
  //     setUser(data?.session?.user ?? null);
  //     setLoading(false);
  //   });

  //   const {
  //     data: { subscription },
  //   } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
  //     if (session?.user) {
  //       const email = session.user.email;
  //       const domain = email.split("@")[1];
  //       const allowedDomains = ["gmail.com"];

  //       if (!allowedDomains.includes(domain)) {
  //         await supabaseClient.auth.signOut();
  //         setUser(null);
  //         setError("Dominio de correo no autorizado.");
  //       } else {
  //         setUser(session.user);
  //       }
  //     } else {
  //       setUser(null);
  //     }
  //     setLoading(false);
  //   });

  //   return () => subscription.unsubscribe();
  // }, []);

  // Helper para verificar baneo

  useEffect(() => {
    // Función centralizada para validar usuario
    const validateUser = async (session) => {
      if (!session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      const email = session.user.email;
      const domain = email?.split("@")[1];
      const allowedDomains = ["gmail.com"];

      // 1. Validar Dominio
      if (!allowedDomains.includes(domain)) {
        await supabaseClient.auth.signOut();
        setUser(null);
        setError("Dominio de correo no autorizado.");
        setLoading(false);
        return;
      }

      // 2. Validar Baneo
      try {
        const { data: profile, error: profileError } = await supabaseClient
          .from("profiles")
          .select("is_banned, ban_reason")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profile?.is_banned) {
          await supabaseClient.auth.signOut();
          setUser(null);
          setError(`Cuenta suspendida: ${profile.ban_reason || "Infracción de normas"}`);
        } else {
          // Si todo está ok, RECIÉN aquí seteamos al usuario
          setUser(session.user);
          setError(null);
        }
      } catch (err) {
        console.error("Error validando baneo:", err);
        // En caso de error de red, dejamos entrar para no romper la sesión
        setUser(session.user);
      } finally {
        setLoading(false); // IMPORTANTE: Solo dejamos de cargar cuando termina la validación
      }
    };

    // Al cargar la app por primera vez
    supabaseClient.auth.getSession().then(({ data }) => {
      validateUser(data?.session);
    });

    // Listener para cambios (login, logout, etc)
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      // Solo validamos si es un evento distinto a la carga inicial para evitar doble validación
      if (_event === "SIGNED_IN" || _event === "SIGNED_OUT") {
        validateUser(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signinWithGoogle() {
    try {
      setLoading(true);
      setError(null);

      // 1. Calculamos a dónde debe volver el usuario
      const currentPath = window.location.pathname;

      // Si está en el login, la base URL será el Home.
      // Si no, será la URL actual (para que funcione en Games, Profile, etc.)
      const returnTo =
        currentPath === "/login"
          ? window.location.origin // Esto es http://localhost:5173 o tu dominio
          : window.location.href; // La URL completa actual

      // Guardamos la marca para la música si no es el login
      if (currentPath !== "/login") {
        localStorage.setItem("should_play_bgm", "true");
      }

      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Esto asegura que si el trigger falla, el error regrese aquí
          redirectTo: returnTo,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error("Error en login:", err.message);
      localStorage.removeItem("should_play_bgm");
      setError(
        "Solo se permiten correos institucionales (@institutomanuelarevalo.delm.edu.pe)",
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
      setError(null);
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
