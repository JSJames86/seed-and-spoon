"use client";
import { motion } from "framer-motion";

const words = "We grow food. We serve meals. But mostly, we see people.".split(" ");

export default function HeroContent() {
  return (
    <div className="text-center text-gray-900">
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, staggerChildren: 0.05 }}
        className="mb-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
      >
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={word === "see" ? "text-green-600" : ""}
          >
            {word}{" "}
          </motion.span>
        ))}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mb-10 text-xl md:text-2xl lg:text-3xl text-gray-700 font-light"
      >
        Building food sovereignty in Essex County—one family, one meal, one skill at a time.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="flex flex-col gap-4 sm:flex-row sm:justify-center"
      >
        <a
          href="/get-help"
          className="rounded-lg bg-green-600 px-10 py-4 font-bold text-white text-lg transition-all hover:bg-green-500 hover:scale-105 shadow-xl"
        >
          Get Help
        </a>
        <a
          href="/donate"
          className="rounded-lg bg-orange-600 px-10 py-4 font-bold text-white text-lg transition-all hover:bg-orange-500 hover:scale-105 shadow-xl"
        >
          Donate Now
        </a>
        <a
          href="/volunteer"
          className="rounded-lg border-2 border-green-600 px-10 py-4 font-bold text-green-600 text-lg transition-all hover:bg-green-600 hover:text-white hover:scale-105 shadow-xl"
        >
          Volunteer
        </a>
      </motion.div>
    </div>
  );
}
