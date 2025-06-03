import { serialize } from "@wingmnn/utils";
import type { QueryParams } from "./query";

export function serializeKey<K>(key: QueryParams<K>) {
  return serialize(key);
}
