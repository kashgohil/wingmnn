import React from "react";
import { Aggregation } from "./aggregation";
import { Batch } from "./batching";
import { Cache } from "./cache";
import { serializeKey } from "./utils";

export function QueryClient() {
  return {
    cache: new Cache(),
    batch: new Batch(),
    aggregation: new Aggregation(),

    keyFn: serializeKey,
  };
}

export const QueryContext = React.createContext(QueryClient());
