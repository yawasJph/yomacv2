import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabaseClient } from "../../supabase/supabaseClient";
import { shuffleArray } from "../../utils/trivia/triviaUtils";

export const useTriviaQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      // Obtener todas las categorías disponibles
      const { data: categories } = await supabaseClient
        .from("trivia_categories")
        .select("*");

      if (categories && categories?.length > 0) {
        // Elegir una al azar
        const randomCat =
          categories[Math.floor(Math.random() * categories.length)];
        setActiveCategory(randomCat);

        // Llamar a la RPC pasándole el ID de la categoría sorteada
        const { data: qs, error } = await supabaseClient.rpc(
          "get_random_questions",
          {
            p_category_id: randomCat.id,
            p_limit: 10,
          }
        );

        if (error) throw error;

        if (qs && qs.length > 0) {
          const shuffledQuestions = qs.map((q) => {
            // Identificar el texto de la respuesta correcta antes de mezclar
            const correctText = q.options[q.correct_option_index];

            // Mezclar las opciones
            const newOptions = shuffleArray(q.options);

            // Encontrar el nuevo índice donde quedó el texto correcto
            const newCorrectIndex = newOptions.indexOf(correctText);

            return {
              ...q,
              options: newOptions,
              correct_option_index: newCorrectIndex,
            };
          });

          setQuestions(shuffledQuestions);
        }
      }
    } catch (error) {
      toast.error("No se pudieron cargar las preguntas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return {
    questions,
    activeCategory,
    isLoading,
    refetchQuestions: fetchQuestions,
  };
};