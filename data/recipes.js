/**
 * Recipe Data File
 *
 * This file contains all recipe data for the recipes page.
 * Each recipe object includes metadata, ingredients, instructions, and image paths.
 *
 * TODO: Add actual images to /public/images/recipes/
 * Image naming convention: recipe-{id}.jpg (e.g., recipe-1.jpg)
 */

export const recipes = [
  {
    id: 1,
    title: "Hearty Vegetable Soup",
    category: "Soups & Stews",
    difficulty: "Easy",
    prepTime: "15 min",
    cookTime: "30 min",
    servings: 6,
    description: "A warming, nutritious soup packed with seasonal vegetables and aromatic herbs. Perfect for meal prep and feeding a crowd.",
    image: "/images/recipes/recipe-1.jpg", // TODO: Add image
    ingredients: [
      "2 tablespoons olive oil",
      "1 large onion, diced",
      "3 cloves garlic, minced",
      "3 carrots, sliced",
      "3 celery stalks, chopped",
      "1 zucchini, diced",
      "1 cup green beans, trimmed and cut",
      "1 can (14oz) diced tomatoes",
      "6 cups vegetable broth",
      "2 bay leaves",
      "1 teaspoon dried thyme",
      "Salt and pepper to taste",
      "Fresh parsley for garnish"
    ],
    instructions: [
      "Heat olive oil in a large pot over medium heat.",
      "Sauté onion and garlic until fragrant, about 3-4 minutes.",
      "Add carrots and celery, cook for 5 minutes.",
      "Add remaining vegetables, tomatoes, broth, and herbs.",
      "Bring to a boil, then reduce heat and simmer for 20-25 minutes.",
      "Season with salt and pepper to taste.",
      "Remove bay leaves and serve hot, garnished with fresh parsley."
    ],
    tags: ["vegetarian", "vegan", "gluten-free", "healthy", "comfort-food"],
    nutrition: {
      calories: 120,
      protein: "4g",
      carbs: "18g",
      fat: "5g"
    }
  },
  {
    id: 2,
    title: "Quinoa Buddha Bowl",
    category: "Salads & Bowls",
    difficulty: "Easy",
    prepTime: "20 min",
    cookTime: "15 min",
    servings: 4,
    description: "A colorful, nutrient-dense bowl featuring quinoa, roasted vegetables, and a creamy tahini dressing. Customizable and meal-prep friendly.",
    image: "/images/recipes/recipe-2.jpg", // TODO: Add image
    ingredients: [
      "1 cup quinoa, rinsed",
      "2 cups water",
      "2 sweet potatoes, cubed",
      "1 can chickpeas, drained and rinsed",
      "2 cups kale, chopped",
      "1 avocado, sliced",
      "2 tablespoons olive oil",
      "1 teaspoon cumin",
      "1 teaspoon paprika",
      "For tahini dressing:",
      "¼ cup tahini",
      "2 tablespoons lemon juice",
      "2 tablespoons water",
      "1 clove garlic, minced",
      "Salt to taste"
    ],
    instructions: [
      "Preheat oven to 425°F (220°C).",
      "Cook quinoa: combine with water, bring to boil, reduce heat, simmer 15 minutes.",
      "Toss sweet potatoes and chickpeas with olive oil, cumin, and paprika.",
      "Roast for 25-30 minutes until golden and crispy.",
      "Massage kale with a drizzle of olive oil until softened.",
      "Whisk together all dressing ingredients until smooth.",
      "Assemble bowls with quinoa, roasted vegetables, kale, and avocado.",
      "Drizzle with tahini dressing and serve."
    ],
    tags: ["vegetarian", "vegan", "gluten-free", "protein-rich", "meal-prep"],
    nutrition: {
      calories: 425,
      protein: "14g",
      carbs: "52g",
      fat: "18g"
    }
  },
  {
    id: 3,
    title: "Classic Marinara Pasta",
    category: "Pasta & Grains",
    difficulty: "Easy",
    prepTime: "10 min",
    cookTime: "25 min",
    servings: 4,
    description: "A simple yet delicious homemade marinara sauce that's far better than store-bought. Serve over your favorite pasta for a quick weeknight dinner.",
    image: "/images/recipes/recipe-3.jpg", // TODO: Add image
    ingredients: [
      "1 pound pasta (spaghetti or penne)",
      "3 tablespoons olive oil",
      "4 cloves garlic, minced",
      "1 can (28oz) crushed tomatoes",
      "1 can (14oz) diced tomatoes",
      "2 teaspoons dried basil",
      "1 teaspoon dried oregano",
      "½ teaspoon red pepper flakes (optional)",
      "1 tablespoon sugar (optional, to balance acidity)",
      "Salt and black pepper to taste",
      "Fresh basil leaves for garnish",
      "Grated Parmesan cheese (optional)"
    ],
    instructions: [
      "Bring a large pot of salted water to boil for pasta.",
      "Heat olive oil in a large saucepan over medium heat.",
      "Add garlic and sauté until fragrant, about 1 minute.",
      "Add crushed tomatoes, diced tomatoes, basil, oregano, and red pepper flakes.",
      "Stir well and bring to a simmer.",
      "Reduce heat to low and let simmer for 20 minutes, stirring occasionally.",
      "Meanwhile, cook pasta according to package directions until al dente.",
      "Season sauce with salt, pepper, and sugar if needed.",
      "Drain pasta and toss with marinara sauce.",
      "Serve topped with fresh basil and Parmesan cheese."
    ],
    tags: ["vegetarian", "italian", "comfort-food", "quick-meal"],
    nutrition: {
      calories: 380,
      protein: "12g",
      carbs: "68g",
      fat: "8g"
    }
  },
  {
    id: 4,
    title: "Spicy Black Bean Chili",
    category: "Soups & Stews",
    difficulty: "Medium",
    prepTime: "15 min",
    cookTime: "45 min",
    servings: 8,
    description: "A robust, flavorful chili that's perfect for cold days. Packed with protein and fiber, this crowd-pleaser can be made ahead and freezes beautifully.",
    image: "/images/recipes/recipe-4.jpg", // TODO: Add image
    ingredients: [
      "2 tablespoons olive oil",
      "1 large onion, diced",
      "1 bell pepper (red or green), diced",
      "4 cloves garlic, minced",
      "2 tablespoons chili powder",
      "1 tablespoon cumin",
      "1 teaspoon smoked paprika",
      "½ teaspoon cayenne pepper (adjust to taste)",
      "3 cans (15oz each) black beans, drained and rinsed",
      "1 can (28oz) crushed tomatoes",
      "1 can (14oz) diced tomatoes",
      "1 cup vegetable broth",
      "1 tablespoon cocoa powder (secret ingredient!)",
      "Salt and pepper to taste",
      "For serving: sour cream, shredded cheese, cilantro, lime wedges"
    ],
    instructions: [
      "Heat olive oil in a large pot over medium-high heat.",
      "Add onion and bell pepper, cook until softened, about 5 minutes.",
      "Add garlic and spices, cook until fragrant, about 1 minute.",
      "Add black beans, crushed tomatoes, diced tomatoes, and broth.",
      "Stir in cocoa powder (this adds depth to the flavor).",
      "Bring to a boil, then reduce heat to low.",
      "Simmer uncovered for 35-40 minutes, stirring occasionally.",
      "The chili will thicken as it cooks; add more broth if needed.",
      "Season with salt and pepper to taste.",
      "Serve hot with desired toppings."
    ],
    tags: ["vegetarian", "vegan", "gluten-free", "spicy", "comfort-food", "freezer-friendly"],
    nutrition: {
      calories: 245,
      protein: "12g",
      carbs: "38g",
      fat: "5g"
    }
  },
  {
    id: 5,
    title: "Mediterranean Chickpea Salad",
    category: "Salads & Bowls",
    difficulty: "Easy",
    prepTime: "15 min",
    cookTime: "0 min",
    servings: 4,
    description: "A refreshing, no-cook salad bursting with Mediterranean flavors. Perfect for lunch, picnics, or as a side dish. Ready in just 15 minutes!",
    image: "/images/recipes/recipe-5.jpg", // TODO: Add image
    ingredients: [
      "2 cans (15oz each) chickpeas, drained and rinsed",
      "1 cup cherry tomatoes, halved",
      "1 cucumber, diced",
      "½ red onion, finely diced",
      "½ cup Kalamata olives, pitted and halved",
      "½ cup crumbled feta cheese",
      "¼ cup fresh parsley, chopped",
      "For dressing:",
      "¼ cup extra virgin olive oil",
      "2 tablespoons red wine vinegar",
      "1 tablespoon lemon juice",
      "1 teaspoon dried oregano",
      "1 clove garlic, minced",
      "Salt and pepper to taste"
    ],
    instructions: [
      "In a large bowl, combine chickpeas, tomatoes, cucumber, onion, olives, feta, and parsley.",
      "In a small bowl, whisk together all dressing ingredients.",
      "Pour dressing over salad and toss gently to combine.",
      "Let sit for 10 minutes to allow flavors to meld.",
      "Taste and adjust seasoning if needed.",
      "Serve immediately or refrigerate for up to 3 days."
    ],
    tags: ["vegetarian", "gluten-free", "no-cook", "mediterranean", "protein-rich"],
    nutrition: {
      calories: 320,
      protein: "11g",
      carbs: "32g",
      fat: "16g"
    }
  },
  {
    id: 6,
    title: "Coconut Curry Lentils",
    category: "Pasta & Grains",
    difficulty: "Medium",
    prepTime: "10 min",
    cookTime: "35 min",
    servings: 6,
    description: "Creamy, aromatic lentils in a rich coconut curry sauce. This Indian-inspired dish is comforting, nutritious, and incredibly flavorful. Serve over rice or with naan.",
    image: "/images/recipes/recipe-6.jpg", // TODO: Add image
    ingredients: [
      "2 tablespoons coconut oil",
      "1 onion, diced",
      "3 cloves garlic, minced",
      "1 tablespoon fresh ginger, grated",
      "2 tablespoons curry powder",
      "1 teaspoon turmeric",
      "1 teaspoon cumin",
      "½ teaspoon cinnamon",
      "1½ cups red lentils, rinsed",
      "1 can (14oz) coconut milk",
      "3 cups vegetable broth",
      "1 can (14oz) diced tomatoes",
      "2 cups spinach, chopped",
      "Salt to taste",
      "Fresh cilantro for garnish",
      "Lime wedges for serving"
    ],
    instructions: [
      "Heat coconut oil in a large pot over medium heat.",
      "Sauté onion until softened, about 5 minutes.",
      "Add garlic and ginger, cook for 1 minute until fragrant.",
      "Stir in curry powder, turmeric, cumin, and cinnamon, cook for 30 seconds.",
      "Add lentils, coconut milk, broth, and tomatoes.",
      "Bring to a boil, then reduce heat and simmer for 25-30 minutes.",
      "Lentils should be tender and mixture should thicken.",
      "Stir in spinach and cook until wilted, about 2 minutes.",
      "Season with salt to taste.",
      "Serve over basmati rice, garnished with cilantro and lime wedges."
    ],
    tags: ["vegetarian", "vegan", "gluten-free", "indian", "comfort-food", "protein-rich"],
    nutrition: {
      calories: 295,
      protein: "14g",
      carbs: "36g",
      fat: "12g"
    }
  },
  {
    id: 7,
    title: "Roasted Vegetable Medley",
    category: "Sides & Snacks",
    difficulty: "Easy",
    prepTime: "15 min",
    cookTime: "30 min",
    servings: 6,
    description: "Colorful roasted vegetables with herbs and a touch of balsamic. A versatile side dish that pairs well with any main course or can be tossed with grains for a complete meal.",
    image: "/images/recipes/recipe-7.jpg", // TODO: Add image
    ingredients: [
      "2 bell peppers (mixed colors), cut into chunks",
      "2 zucchini, sliced into half-moons",
      "1 red onion, cut into wedges",
      "2 cups broccoli florets",
      "2 cups cauliflower florets",
      "8 oz mushrooms, halved",
      "3 tablespoons olive oil",
      "2 tablespoons balsamic vinegar",
      "2 teaspoons Italian seasoning",
      "4 cloves garlic, minced",
      "1 teaspoon salt",
      "½ teaspoon black pepper",
      "Fresh thyme or rosemary for garnish"
    ],
    instructions: [
      "Preheat oven to 425°F (220°C).",
      "Line two large baking sheets with parchment paper.",
      "In a large bowl, combine all vegetables.",
      "In a small bowl, whisk together olive oil, balsamic vinegar, Italian seasoning, garlic, salt, and pepper.",
      "Pour mixture over vegetables and toss until evenly coated.",
      "Spread vegetables in a single layer on baking sheets (don't overcrowd).",
      "Roast for 25-30 minutes, stirring halfway through.",
      "Vegetables should be tender and caramelized at the edges.",
      "Garnish with fresh herbs and serve warm."
    ],
    tags: ["vegetarian", "vegan", "gluten-free", "side-dish", "healthy"],
    nutrition: {
      calories: 110,
      protein: "4g",
      carbs: "14g",
      fat: "7g"
    }
  },
  {
    id: 8,
    title: "Energy Balls - No Bake",
    category: "Sides & Snacks",
    difficulty: "Easy",
    prepTime: "15 min",
    cookTime: "0 min",
    servings: 20,
    description: "Healthy, no-bake energy balls perfect for snacking. Made with dates, nuts, and seeds, these provide sustained energy and are naturally sweetened. Great for meal prep!",
    image: "/images/recipes/recipe-8.jpg", // TODO: Add image
    ingredients: [
      "1 cup pitted Medjool dates (about 12-14 dates)",
      "1 cup raw almonds or cashews",
      "¼ cup ground flaxseed",
      "2 tablespoons chia seeds",
      "2 tablespoons cocoa powder",
      "2 tablespoons honey or maple syrup",
      "1 teaspoon vanilla extract",
      "Pinch of salt",
      "Optional toppings: shredded coconut, cocoa powder, sesame seeds"
    ],
    instructions: [
      "If dates are dry, soak in warm water for 10 minutes, then drain.",
      "Add almonds to food processor and pulse until coarsely chopped.",
      "Add dates, flaxseed, chia seeds, cocoa powder, honey, vanilla, and salt.",
      "Process until mixture comes together and is slightly sticky.",
      "If too dry, add water 1 teaspoon at a time. If too wet, add more nuts.",
      "Scoop about 1 tablespoon of mixture and roll into balls.",
      "Optional: roll balls in coconut, cocoa powder, or sesame seeds.",
      "Place on parchment-lined tray and refrigerate for 30 minutes to firm up.",
      "Store in airtight container in refrigerator for up to 2 weeks.",
      "Enjoy as a healthy snack or pre-workout energy boost!"
    ],
    tags: ["vegetarian", "vegan", "gluten-free", "no-bake", "healthy", "snack", "meal-prep"],
    nutrition: {
      calories: 85,
      protein: "3g",
      carbs: "11g",
      fat: "4g"
    }
  }
];

/**
 * Get all unique categories from recipes
 */
export const getCategories = () => {
  const categories = recipes.map(recipe => recipe.category);
  return ['All', ...new Set(categories)];
};

/**
 * Filter recipes by category
 */
export const filterRecipesByCategory = (category) => {
  if (category === 'All') return recipes;
  return recipes.filter(recipe => recipe.category === category);
};

/**
 * Get recipe by ID
 */
export const getRecipeById = (id) => {
  return recipes.find(recipe => recipe.id === id);
};
