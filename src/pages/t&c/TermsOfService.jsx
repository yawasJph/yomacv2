
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ScrollText, AlertTriangle, ShieldCheck, ServerCrash, Users } from "lucide-react";
import ToggleThemeButton from "@/components/ui/ToggleThemeButton";

const TermsOfService = () => {
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

      {/* Toggle Theme */}
      <div className="absolute top-4 right-4 z-10">
        <ToggleThemeButton />
      </div>

      <div className="max-w-3xl mx-auto mt-12">
        {/* Cabecera */}
        <div className="text-center mb-12 space-y-4">
          <div className="w-16 h-16 mx-auto bg-linear-to-r from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
            <ScrollText size={32} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Términos de Servicio
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Última actualización: Marzo 2026
          </p>
        </div>

        {/* Contenido de los Términos */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-xl shadow-gray-200/50 dark:shadow-none space-y-8">
          
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
            ¡Bienvenido a YoMAC! Al acceder o utilizar nuestra plataforma, aceptas estar sujeto a los siguientes términos y condiciones. Por favor, léelos cuidadosamente.
          </p>

          {/* Sección 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <Users size={24} />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                1. Naturaleza del Proyecto
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              YoMAC es una iniciativa independiente creada por y para estudiantes, con el objetivo de fomentar la comunidad, el aprendizaje y el entretenimiento. <strong>No es una plataforma oficial</strong> ni está administrada por la dirección o el área de TI del Instituto Manuel Arévalo.
            </p>
          </section>

          {/* Sección 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={24} />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                2. Cuentas y Acceso
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              El acceso a YoMAC está estrictamente limitado a usuarios que posean un correo institucional válido (<code>@institutomanuelarevalo.drelm.edu.pe</code>). Eres responsable de mantener la seguridad de tu cuenta de Google y de cualquier actividad que ocurra bajo tu perfil en nuestra plataforma.
            </p>
          </section>

          {/* Sección 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <AlertTriangle size={24} />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                3. Reglas de Conducta y Contenido
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Queremos que YoMAC sea un espacio seguro y divertido para todos. Al usar el feed, los mensajes directos (DMs), el chat bot o los juegos, aceptas <strong>NO</strong> realizar las siguientes acciones:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
              <li>Publicar contenido ofensivo, discriminatorio o ilegal.</li>
              <li>Acosar, intimidar o hacer bullying a otros estudiantes.</li>
              <li>Subir material explícito (NSFW) o violencia gráfica.</li>
              <li>Hacer spam o suplantar la identidad de autoridades académicas o compañeros.</li>
            </ul>
            <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 p-4 mt-4 rounded-r-lg">
              <p className="text-sm text-red-700 dark:text-red-400">
                <strong>Consecuencias:</strong> Nos reservamos el derecho absoluto de eliminar cualquier publicación o mensaje, y de suspender (banear) de forma permanente cualquier cuenta que viole estas reglas, sin previo aviso.
              </p>
            </div>
          </section>

          {/* Sección 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <ServerCrash size={24} />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                4. Disponibilidad del Servicio y Datos
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              YoMAC es un proyecto en constante desarrollo y aprendizaje. Por ello, no podemos garantizar que el servicio esté disponible el 100% del tiempo. 
              Es posible que durante actualizaciones del sistema o mantenimientos, algunos datos (como mensajes, posts o puntuaciones de juegos) se modifiquen o se pierdan de forma irreversible.
            </p>
          </section>

          {/* Footer del documento */}
          <div className="pt-8 mt-8 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Si tienes dudas sobre estos términos o deseas reportar un problema de moderación, por favor contacta al administrador del sistema.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TermsOfService;