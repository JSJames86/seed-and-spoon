"use client";

import { motion } from "framer-motion";

const words = "We grow food. We serve meals. But mostly, we see people.".split(" ");

export default function HeroContent() {
  return (
    <div className="text-center text-white max-w-4xl">
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, staggerChildren: 0.05 }}
        className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
      >
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={word === "see" ? "text-yellow-300" : ""}
          >
            {word}{" "}
          </motion.span>
        ))}
        <br />
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mb-8 text-lg md:text-xl lg:text-2xl"
      >
        Building food sovereignty in Essex County—one family, one meal, one skill at a time.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="flex flex-col gap-4 sm:flex-row sm:justify-center"
      >
        <a href="#gethelp" className="rounded-lg bg-green-600 px-8 py-4 font-bold text-white transition hover:bg-green-500">
          Get Help
        </a>
        <a href="#donate" className="rounded-lg bg-orange-600 px-8 py-4 font-bold text-white transition hover:bg-orange-500">
          Donate Now
        </a>
        <a href="/volunteer" className="rounded-lg border-2 border-white px-8 py-4 font-bold text-white transition hover:bg-white hover:text-green-900">
          Volunteer
        </a>
      </motion.div>
    </div>
  );
}