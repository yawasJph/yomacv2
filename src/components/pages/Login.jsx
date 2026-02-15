import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import ToggleThemeButton from "../ui/ToggleThemeButton";
import { Link, useNavigate } from "react-router-dom";

import { ArrowLeft } from "lucide-react";
import { notify } from "@/utils/toast/notifyv3";


const Login = () => {
  const { signinWithGoogle, loading, error } = useAuth();
  const navigate = useNavigate();

  // Dentro de tu componente Login:
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorDescription = params.get("error_description");

    if (errorDescription) {
      // Si el error viene del Trigger, el mensaje suele ser "Database error saving new user"
      // o el mensaje personalizado que pusiste en el RAISE EXCEPTION
      // toast.error("Error de acceso", {
      //   description:
      //     "Solo se permiten correos institucionales. Si usaste el correcto, contacta a soporte.",
      //   duration: 5000,
      // });
      notify.error(
        "Error de acceso: Solo se permiten correos institucionales",
        "(login)Si usaste el correcto, contacta a soporte.",
      );

      // Limpiamos la URL para que el mensaje no vuelva a salir si el usuario recarga
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 relative">
      {/* min-h-screen*/}

      {/* Botón volver – solo móvil */}
      <div className="absolute top-4 left-4 z-10 lg:hidden">
        <button
          onClick={() => navigate(-1)}
          className="
      p-2
      rounded-full
      bg-white/90 dark:bg-black/80
      backdrop-blur
      shadow-md
      hover:scale-105
      active:scale-95
      transition
    "
        >
          <ArrowLeft size={20} className="text-gray-700 dark:text-gray-200" />
        </button>
      </div>
      {/* ToggleThemeButton en la esquina superior derecha */}
      <div className="absolute top-4 right-4 z-10">
        <ToggleThemeButton />
      </div>

      <div className="max-w-7xl mx-auto min-h-screen flex flex-col lg:flex-row items-center justify-center">
        {/* Sección izquierda - 2/3 del espacio en desktop */}
        <div className="w-full lg:w-2/3 flex items-center justify-center px-6 sm:px-8 lg:px-12 py-8 lg:py-0">
          <div className="max-w-md w-full space-y-6 text-center lg:text-left">
            {/* Logo grande */}

            <div className="flex items-center gap-4 mb-8 justify-center lg:justify-start">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-r from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center overflow-hidden">
                <Link to="/">
                  <img
                    src="/logo.png"
                    alt="YoMac logo"
                    className="w-full h-full object-cover"
                  />
                </Link>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                YoMAC
              </h1>
            </div>

            {/* Descripción */}
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
                Bienvenido a YoMAC
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Únete a nuestra comunidad y comparte tus ideas, conecta con
                otros usuarios y descubre contenido increíble.
              </p>
            </div>
          </div>
        </div>

        {/* Sección derecha - 1/3 del espacio en desktop */}
        <div className="w-full lg:w-1/3 flex items-center justify-center px-6 sm:px-8 lg:px-12 py-8 lg:py-0 border-t lg:border-t-0 lg:border-l border-emerald-500/10 dark:border-emerald-500/20">
          <div className="w-full max-w-sm">
            {/* Card de login */}
            <div className="bg-white dark:bg-black border-2 border-emerald-500/20 dark:border-emerald-500/30 rounded-3xl p-8 sm:p-10 shadow-lg dark:shadow-emerald-500/5">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Iniciar sesión
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Continúa con tu cuenta de Google
                  </p>
                </div>

                {/* Botón de Google */}
                <button
                  onClick={signinWithGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all duration-200 font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {/* Icono de Google */}
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      <span className="text-base">Continuar con Google</span>
                    </>
                  )}
                </button>

                {/* Mensaje de error */}
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 text-center">
                      {error}
                    </p>
                  </div>
                )}

                {/* Términos y condiciones */}
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 leading-relaxed">
                  Al continuar, aceptas nuestros{" "}
                  <a
                    href="#"
                    className="text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Términos de servicio
                  </a>{" "}
                  y{" "}
                  <a
                    href="#"
                    className="text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Política de privacidad
                  </a>
                </p>
              </div>
            </div>
            {/* Dentro del Card de login, justo antes del botón de Google */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 flex gap-3 mt-3">
              <div className="text-blue-600 dark:text-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <p className="text-xs text-blue-800 dark:text-blue-300 leading-tight">
                <span className="font-bold block mb-1">Nota importante:</span>
                Para acceder, debes utilizar obligatoriamente tu{" "}
                <strong>correo institucional</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
