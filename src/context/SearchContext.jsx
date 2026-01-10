import { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [queryG, setQuery] = useState(searchParams.get("q") || "");

  // 🔄 sincroniza URL → estado
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const updateQuery = (value) => {
    setQuery(value);
    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  return (
    <SearchContext.Provider value={{ queryG, updateQuery }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
