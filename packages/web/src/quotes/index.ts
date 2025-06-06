import { fun } from "./fun";
import { inspirational } from "./inspirational";
import { melancholic } from "./melancholic";
import { spiritual } from "./spiritual";
import { stoic } from "./stoic";

export const quotes = Object.freeze([
  ...fun,
  ...stoic,
  ...melancholic,
  ...spiritual,
  ...inspirational,
]);
