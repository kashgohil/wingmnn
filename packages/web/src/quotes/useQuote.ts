import React from "react";
import { quotes } from ".";

export function useQuote() {
  const quote = React.useMemo(() => {
    const randomNumber = Math.floor(Math.random() * quotes.length);
    return quotes[randomNumber];
  }, []);

  return quote;
}
