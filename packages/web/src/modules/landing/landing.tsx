import { motion } from "motion/react";
import { Content } from "./content";

export function Landing() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="w-full h-full flex relative bg-black-500 gap-8"
    >
      <Content />
    </motion.div>
  );
}
