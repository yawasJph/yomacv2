const NoResultsMessage = ({ query }) => {
  return (
    <div className="p-20 text-center">
      <p className="text-gray-500 dark:text-gray-400">
        No encontramos resultados para "{query}". Prueba con otras palabras
        clave.
      </p>
    </div>
  );
};

export default NoResultsMessage;
