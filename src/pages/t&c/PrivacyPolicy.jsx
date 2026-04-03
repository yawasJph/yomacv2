
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Database, Eye, Lock, Trash2 } from "lucide-react";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 relative py-10 px-6 sm:px-8 lg:px-12">
      
      {/* Botón volver */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-900 shadow-sm hover:scale-105 active:scale-95 transition dark:text-white"
          title="Volver"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="max-w-3xl mx-auto mt-12">
        {/* Cabecera */}
        <div className="text-center mb-12 space-y-4">
          <div className="w-16 h-16 mx-auto bg-linear-to-r from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Política de Privacidad
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Última actualización: Marzo 2026
          </p>
        </div>

        {/* Contenido de la Política */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-xl shadow-gray-200/50 dark:shadow-none space-y-8">
          
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
            En YoMAC valoramos tu privacidad y queremos ser 100% transparentes sobre cómo manejamos tu información. Al ser un proyecto estudiantil, nuestro único interés es mantener la plataforma funcionando de forma segura para toda la comunidad del Instituto Manuel Arévalo.
          </p>

          {/* Sección 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <Database size={24} />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                1. ¿Qué datos recopilamos?
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Para que YoMAC funcione correctamente, guardamos la siguiente información en nuestra base de datos cuando inicias sesión y usas la app:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
              <li><strong>Información de tu cuenta de Google:</strong> Tu correo electrónico institucional, nombre completo y foto de perfil (avatar).</li>
              <li><strong>Contenido generado por ti:</strong> Los posts que publicas, los likes que das, los elementos que guardas y tus puntuaciones en los minijuegos.</li>
              <li><strong>Comunicaciones:</strong> Tus interacciones con el Chat Bot (Yawas) y los Mensajes Directos (DMs) que envías a otros usuarios.</li>
            </ul>
          </section>

          {/* Sección 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <Lock size={24} />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                2. ¿Cómo usamos tu información?
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              La información que recopilamos se utiliza <strong>exclusivamente</strong> para operar la plataforma. Esto incluye mostrar tu perfil a otros compañeros, ordenar los rankings de los juegos y permitir la comunicación en tiempo real.
            </p>
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-500 p-4 mt-4 rounded-r-lg">
              <p className="text-sm text-emerald-800 dark:text-emerald-300">
                <strong>Nuestro compromiso:</strong> Nunca venderemos, alquilaremos ni compartiremos tu información personal o tu correo electrónico con terceros o empresas externas.
              </p>
            </div>
          </section>

          {/* Sección 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <Eye size={24} />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                3. Privacidad de Mensajes y Contenido
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Tus publicaciones en el feed y la información de tu perfil (como biografía y enlaces) son visibles para cualquier otro estudiante que haya iniciado sesión en YoMAC o cualquiera que tenga la URL de la aplicacion. 
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-2">
              Los Mensajes Directos (DMs) son privados entre tú y el receptor. Sin embargo, al ser una base de datos centralizada, los administradores del sistema tienen la capacidad técnica de acceder a estos registros. Esto <strong>solo se hará en casos excepcionales</strong> (por ejemplo, reportes graves de acoso, amenazas o violaciones de seguridad) para proteger a la comunidad.
            </p>
          </section>
          {/* Sección 3 - REEMPLAZA ESTA PARTE */}
          {/* <section className="space-y-3">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <Eye size={24} />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                3. Visibilidad de tu Contenido y Mensajes
              </h2>
            </div>
            
            <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>
                <strong>Feed y Perfil Públicos:</strong> YoMAC es una plataforma abierta para mostrar el talento y la vida estudiantil. Tus publicaciones en el feed, los blogs que escribas y la información de tu perfil (como biografía y enlaces) <strong>son visibles para cualquier persona en internet</strong> que tenga el enlace de la aplicación. Sin embargo, únicamente los usuarios verificados que hayan iniciado sesión pueden interactuar (dar likes, comentar, jugar, etc.).
              </p>
              
              <p>
                <strong>Mensajes Directos (DMs) y Chat Bot (Yawas):</strong> Las conversaciones que tienes con otros usuarios y con nuestra IA (Yawas) solo son accesibles desde tu cuenta, pero es importante que sepas que <strong>no cuentan con encriptación de extremo a extremo</strong>. 
              </p>
              
              <p>
                Estos mensajes se almacenan de forma estándar en nuestra base de datos centralizada. Esto significa que los administradores del sistema tienen la capacidad técnica de leerlos. Nos comprometemos a que este acceso <strong>solo se utilizará en casos excepcionales</strong> (por ejemplo: investigar reportes graves de acoso, amenazas, o para resolver problemas técnicos del sistema) con el único fin de proteger a la comunidad.
              </p>
            </div>
          </section> */}

          {/* Sección 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <Trash2 size={24} />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                4. Eliminación de tus Datos
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Eres dueño de tu información. Si en algún momento decides que ya no quieres formar parte de YoMAC, puedes solicitar la eliminación permanente de tu cuenta, tus posts y tus mensajes contactando directamente al administrador de la plataforma.
            </p>
          </section>

          {/* Footer del documento */}
          <div className="pt-8 mt-8 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              El uso continuo de YoMAC implica la aceptación de estas políticas. ¡Gracias por confiar y ser parte de esta comunidad!
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;