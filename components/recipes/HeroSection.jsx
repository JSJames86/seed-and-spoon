'use client';

import { motion } from 'framer-motion';

/**
 * HeroSection Component
 *
 * Displays the hero banner at the top of the recipes page.
 * Features animated text and a call-to-action design.
 *
 * @component
 * @example
 * <HeroSection />
 */
export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-green-primary via-green-leaf-mid to-forest-mid text-white py-20 px-4 overflow-hidden">
      {/* Background Pattern - Optional decorative element */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Animated Heading */}
        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Discover Delicious Recipes
        </motion.h1>

        {/* Animated Subtitle */}
        <motion.p
          className="text-lg md:text-xl text-center max-w-2xl mx-auto mb-8 text-green-50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        >
          Delicious comfort food and holiday favorites that bring warmth to your
          table. From Southern classics to festive holiday dishes.
        </motion.p>

        {/* Animated Stats/Features */}
        <motion.div
          className="flex flex-wrap justify-center gap-8 mt-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
        >
          <div className="text-center">
            <div className="text-3xl font-bold">8</div>
            <div className="text-sm text-green-50">Recipes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">Easy-Med</div>
            <div className="text-sm text-green-50">Difficulty</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">Comfort</div>
            <div className="text-sm text-green-50">Food Style</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * FALLBACK VERSION (without framer-motion):
 *
 * If you want to remove framer-motion dependency, replace the component with this:
 *
 * export default function HeroSection() {
 *   return (
 *     <section className="relative bg-gradient-to-br from-green-primary via-green-leaf-mid to-forest-mid text-white py-20 px-4 overflow-hidden">
 *       <div className="absolute inset-0 opacity-10">
 *         <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
 *         <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
 *       </div>
 *
 *       <div className="max-w-6xl mx-auto relative z-10">
 *         <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-6 animate-fade-in">
 *           Discover Delicious Recipes
 *         </h1>
 *
 *         <p className="text-lg md:text-xl text-center max-w-2xl mx-auto mb-8 text-green-50 animate-fade-in-delayed">
 *           Healthy, plant-based recipes that nourish your body and delight your
 *           taste buds. From quick weeknight dinners to meal-prep favorites.
 *         </p>
 *
 *         <div className="flex flex-wrap justify-center gap-8 mt-10 animate-fade-in-delayed-more">
 *           <div className="text-center">
 *             <div className="text-3xl font-bold">8+</div>
 *             <div className="text-sm text-green-50">Recipes</div>
 *           </div>
 *           <div className="text-center">
 *             <div className="text-3xl font-bold">30min</div>
 *             <div className="text-sm text-green-50">Average Time</div>
 *           </div>
 *           <div className="text-center">
 *             <div className="text-3xl font-bold">100%</div>
 *             <div className="text-sm text-green-50">Plant-Based</div>
 *           </div>
 *         </div>
 *       </div>
 *     </section>
 *   );
 * }
 *
 * Then add these CSS animations to your globals.css or fallback CSS file:
 *
 * @keyframes fadeIn {
 *   from { opacity: 0; transform: translateY(-10px); }
 *   to { opacity: 1; transform: translateY(0); }
 * }
 *
 * .animate-fade-in {
 *   animation: fadeIn 0.6s ease-out;
 * }
 *
 * .animate-fade-in-delayed {
 *   animation: fadeIn 0.6s ease-out 0.2s both;
 * }
 *
 * .animate-fade-in-delayed-more {
 *   animation: fadeIn 0.6s ease-out 0.4s both;
 * }
 */
