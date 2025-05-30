import React from "react";
import { Aggregation } from "./aggregation";
import { Batch } from "./batching";
import { Cache } from "./cache";

export function QueryClient() {
  return {
    cache: new Cache(),
    batch: new Batch(),
    aggregation: new Aggregation(),
  };
}

export const QueryContext = React.createContext(QueryClient());
