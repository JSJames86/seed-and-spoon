/**
 * Recipe Data File
 *
 * This file contains all recipe data for the recipes page.
 * Each recipe object includes metadata, ingredients, instructions, and image paths.
 *
 * TODO: Add actual images to /public/images/recipes/
 * Images should be placed at the paths specified in the image field.
 */

export const recipes = [
  {
    id: 1,
    slug: "cranberry-orange-sauce",
    title: "Cranberry Orange Sauce",
    category: "Sauces",
    difficulty: "Easy",
    prepTime: "5 min",
    cookTime: "15 min",
    servings: "3 cups",
    description: "Sweet, tangy, and festive cranberry orange sauce perfect for holiday meals.",
    image: "/images/recipes/cranberry-orange-sauce.jpg",
    ingredients: [
      "3/4 cup water",
      "1/4 cup freshly squeezed orange juice",
      "2 tbsp orange zest",
      "1/2 cup sugar",
      "12 oz fresh cranberries",
      "1/2 tsp cinnamon"
    ],
    instructions: [
      "In a medium saucepan, combine water, orange juice, orange zest, and sugar over medium heat. Cook, stirring occasionally, until the sugar has dissolved.",
      "Stir in cranberries and bring to a boil; reduce heat and let simmer until sauce has thickened, about 15 minutes.",
      "Let cool completely before serving."
    ],
    tags: ["holiday", "sauce", "vegetarian", "vegan", "gluten-free"],
    nutrition: {
      calories: 50,
      protein: "0g",
      carbs: "13g",
      fat: "0g"
    }
  },
  {
    id: 2,
    slug: "sausage-apple-stuffing",
    title: "Sausage and Apple Stuffing",
    category: "Side Dishes",
    difficulty: "Medium",
    prepTime: "15 min",
    cookTime: "50 min",
    servings: "9-10 cups",
    description: "Classic stuffing with savory Italian sausage, tart apples, and herbs baked to golden perfection.",
    image: "/images/recipes/sausage-apple-stuffing.png",
    ingredients: [
      "12-14 oz herb-seasoned stuffing cubes",
      "1 lb Italian sausage, casings removed",
      "4 Tbsp unsalted butter",
      "1 large onion, diced",
      "2 stalks celery, diced",
      "2 medium Granny Smith apples, peeled, cored, and chopped",
      "1 Tbsp fresh sage, chopped",
      "1 Tbsp fresh thyme, chopped",
      "2.75 cups low-sodium chicken broth",
      "2 large eggs, lightly beaten",
      "1/2 tsp salt",
      "1/2 tsp black pepper",
      "1/2 cup chopped walnuts or pecans (optional)"
    ],
    instructions: [
      "Preheat oven to 350°F (175°C) and grease a 9x13-inch baking dish. Place the stuffing cubes in a large bowl.",
      "Melt 2 Tbsp butter in a skillet. Cook Italian sausage until browned; transfer to stuffing bowl.",
      "Add remaining butter and sauté onion, celery, apples, salt, and pepper until tender. Stir in sage and thyme.",
      "Combine stuffing, sausage, and sautéed vegetables. Whisk broth and eggs together, pour over mixture, and mix gently. Add nuts if desired.",
      "Transfer to baking dish, cover with foil, and bake 30 minutes. Remove foil and bake an additional 20-30 minutes until top is golden."
    ],
    tags: ["holiday", "thanksgiving", "side-dish", "comfort-food"],
    nutrition: {
      calories: 280,
      protein: "12g",
      carbs: "28g",
      fat: "14g"
    }
  },
  {
    id: 3,
    slug: "cajun-turkey",
    title: "Cajun Turkey",
    category: "Meat & Poultry",
    difficulty: "Hard",
    prepTime: "30 min",
    cookTime: "Varies by weight",
    servings: "12-16 servings",
    description: "Juicy, flavorful Cajun-style turkey with a spicy butter marinade and aromatic rub, perfect for roasting or deep-frying.",
    image: "/images/recipes/cajun-turkey.png",
    ingredients: [
      "1 whole turkey (12-16 lbs), thawed",
      "1 cup unsalted butter, melted",
      "1/2 cup chicken stock",
      "1/4 cup Louisiana-style hot sauce",
      "2 Tbsp Worcestershire sauce",
      "2 Tbsp garlic powder",
      "2 Tbsp onion powder",
      "1 tsp cayenne pepper",
      "2 Tbsp smoked paprika",
      "1 Tbsp dried oregano",
      "1 Tbsp dried thyme",
      "2 tsp ground black pepper",
      "1 Tbsp salt",
      "1/4 cup butter or oil (for binder)"
    ],
    instructions: [
      "Thaw and dry turkey thoroughly. Prepare injection marinade by melting butter and whisking together with stock, hot sauce, Worcestershire sauce, garlic powder, onion powder, and cayenne.",
      "Using a meat injector, inject marinade into breast, thighs, and legs. Combine all dry rub spices in a bowl and coat turkey with butter or oil binder.",
      "Rub spice mixture all over turkey. Rest in refrigerator for 2 hours or overnight for best results.",
      "Roast at 325°F (approximately 14 minutes per pound) until thigh reaches internal temperature of 165°F, or deep-fry according to safety instructions.",
      "Let turkey rest 20-30 minutes before carving. Optional: baste with cheesecloth soaked in butter every 45 minutes while roasting."
    ],
    tags: ["holiday", "thanksgiving", "cajun", "spicy", "main-course"],
    nutrition: {
      calories: 320,
      protein: "42g",
      carbs: "2g",
      fat: "16g"
    }
  },
  {
    id: 4,
    slug: "mashed-potatoes",
    title: "Homemade Mashed Potatoes",
    category: "Side Dishes",
    difficulty: "Easy",
    prepTime: "10 min",
    cookTime: "20 min",
    servings: "4-6 servings",
    description: "Creamy, fluffy mashed potatoes made from scratch with butter and milk, perfect for holiday meals.",
    image: "/images/recipes/mashed-potatoes.jpeg",
    ingredients: [
      "2 lbs Russet or Yukon Gold potatoes",
      "1/2 cup whole milk or half-and-half",
      "4 Tbsp butter, cut into pieces",
      "1 Tbsp salt (for cooking water)",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Peel and cut potatoes into chunks. Cover with cold salted water in a large pot.",
      "Bring to a boil, then reduce heat and simmer until fork-tender, about 15-20 minutes.",
      "Drain potatoes well and return to pot. Let them dry out for 1-2 minutes over low heat.",
      "Meanwhile, warm milk and butter together in a small saucepan or microwave.",
      "Mash potatoes using a potato masher or ricer. Gradually add warm milk mixture while mashing until desired consistency is reached.",
      "Season with salt and pepper to taste. Serve hot."
    ],
    tags: ["side-dish", "comfort-food", "vegetarian", "gluten-free", "holiday"],
    nutrition: {
      calories: 220,
      protein: "4g",
      carbs: "32g",
      fat: "9g"
    }
  },
  {
    id: 5,
    slug: "cajun-turkey-gravy",
    title: "Cajun Turkey Gravy",
    category: "Sauces",
    difficulty: "Easy",
    prepTime: "5 min",
    cookTime: "10 min",
    servings: "2.5-3 cups",
    description: "Savory, spicy Cajun-style turkey gravy perfect for drizzling over roasted turkey and mashed potatoes.",
    image: "/images/recipes/cajun-turkey-gravy.jpeg",
    ingredients: [
      "1 packet McCormick Turkey Gravy Mix",
      "1/4 cup all-purpose flour (optional, for thicker gravy)",
      "1 cup turkey pan drippings",
      "2 cups low-sodium chicken broth",
      "1-2 tsp Cajun seasoning (adjust to taste)"
    ],
    instructions: [
      "Skim excess fat from pan drippings, leaving about 1/4 cup fat in the pan.",
      "Whisk together gravy mix and flour (if using) in a bowl.",
      "Gradually add drippings and chicken broth to the dry mixture, whisking constantly until smooth.",
      "Pour mixture into a saucepan and bring to a boil over medium-high heat, stirring frequently.",
      "Stir in Cajun seasoning. Reduce heat and simmer for 5 minutes, stirring occasionally, until gravy thickens.",
      "Taste and adjust seasoning as needed. Serve hot over turkey, mashed potatoes, or stuffing."
    ],
    tags: ["sauce", "cajun", "spicy", "holiday", "gluten-free-option"],
    nutrition: {
      calories: 35,
      protein: "1g",
      carbs: "5g",
      fat: "2g"
    }
  },
  {
    id: 6,
    slug: "janelle-green-beans",
    title: "Janelle's Southern Green Beans",
    category: "Side Dishes",
    difficulty: "Medium",
    prepTime: "10 min",
    cookTime: "1 hr 30 min - 2 hr",
    servings: "6-8 servings",
    description: "Slow-simmered fresh green beans cooked with smoked turkey, onions, garlic, and rich broth for deep, soulful flavor.",
    image: "/images/recipes/green-beans.jpeg",
    ingredients: [
      "2 lbs fresh green beans, trimmed",
      "1 lb smoked turkey legs or necks",
      "6-8 cups water or chicken broth",
      "1 onion, chopped",
      "1 tbsp minced garlic",
      "2 tsp all-purpose seasoning",
      "1 tsp ground black pepper",
      "Optional: 2-3 small potatoes, cubed"
    ],
    instructions: [
      "In a large pot, add smoked turkey and enough water or broth to cover. Bring to a boil, then reduce heat and simmer for 1-2 hours until meat is tender and falling off the bone.",
      "Remove turkey from pot, let cool slightly, then shred the meat. Set aside. Keep the flavorful broth in the pot.",
      "Add green beans, chopped onion, garlic, all-purpose seasoning, and black pepper to the broth. If using potatoes, add them now.",
      "Bring to a boil, then reduce heat and simmer for 40-50 minutes until green beans are tender and flavorful.",
      "Return shredded turkey meat to the pot. Taste and adjust seasoning as needed.",
      "Serve hot as a side dish with cornbread or rice."
    ],
    tags: ["southern", "soul-food", "comfort-food", "side-dish", "holiday"],
    nutrition: {
      calories: 180,
      protein: "18g",
      carbs: "12g",
      fat: "6g"
    }
  },
  {
    id: 7,
    slug: "moist-jiffy-cornbread",
    title: "Moist Jiffy Cornbread with Cinnamon Honey Butter",
    category: "Baking & Desserts",
    difficulty: "Easy",
    prepTime: "10 min",
    cookTime: "20-25 min",
    servings: "8 servings",
    description: "Ultra-moist, cake-like Jiffy cornbread boosted with vanilla pudding mix, served with a sweet cinnamon honey butter spread.",
    image: "/images/recipes/moist-cornbread.png",
    ingredients: [
      "1 box (8.5 oz) Jiffy Corn Muffin Mix",
      "1/2 box (~1.85 oz) instant vanilla pudding mix",
      "1 large egg",
      "1/2 cup milk or buttermilk",
      "1/4 cup sour cream (optional, for extra moisture)",
      "2 Tbsp butter, melted",
      "For Cinnamon Honey Butter:",
      "1/2 cup butter, softened",
      "2 Tbsp honey",
      "1/2 tsp ground cinnamon"
    ],
    instructions: [
      "Preheat oven to 400°F. Grease an 8x8-inch baking pan or 9-inch cast iron skillet.",
      "In a mixing bowl, whisk together egg, milk, sour cream (if using), and melted butter until well combined.",
      "Add Jiffy Corn Muffin Mix and instant vanilla pudding mix to the wet ingredients. Stir until just combined (do not overmix).",
      "Pour batter into prepared pan and smooth the top.",
      "Bake for 20-25 minutes, or until golden brown and a toothpick inserted in the center comes out clean.",
      "While cornbread bakes, make Cinnamon Honey Butter: Beat softened butter with honey and cinnamon until light and fluffy.",
      "Serve cornbread warm with cinnamon honey butter."
    ],
    tags: ["baking", "side-dish", "southern", "comfort-food", "vegetarian"],
    nutrition: {
      calories: 210,
      protein: "4g",
      carbs: "28g",
      fat: "10g"
    }
  },
  {
    id: 8,
    slug: "sweet-potato-pecan-pie",
    title: "Sweet Potato Pecan Pie",
    category: "Baking & Desserts",
    difficulty: "Medium",
    prepTime: "25 min",
    cookTime: "1 hr 15 min",
    servings: "8 slices",
    description: "Velvety sweet potato base layered with a glossy pecan topping — a soulful holiday pie. Fill crust half sweet potato and half pecan topping to avoid overflow.",
    image: "/images/recipes/sweet-potato-pecan-pie.png",
    ingredients: [
      "Sweet Potato Filling:",
      "1 (9-inch) unbaked deep-dish pie crust",
      "1 1/2 cups mashed cooked sweet potatoes",
      "1/4 cup packed light brown sugar",
      "2 large eggs, beaten",
      "2 tbsp unsalted butter, melted",
      "1 tsp vanilla extract",
      "1 tsp orange zest (optional)",
      "1/2 tsp ground cinnamon",
      "1/4 tsp ground nutmeg",
      "1/4 tsp kosher salt",
      "Pecan Topping:",
      "2 large eggs",
      "3/4 cup packed light brown sugar",
      "1/2 cup corn syrup",
      "2 tbsp unsalted butter, melted",
      "1 tsp vanilla extract",
      "1/4 tsp kosher salt",
      "2 cups chopped pecans"
    ],
    instructions: [
      "Preheat oven to 300°F. Fit pie crust into a 9-inch pie plate and chill while preparing fillings.",
      "Make sweet potato filling: In a bowl, whisk together mashed sweet potatoes, brown sugar, eggs, melted butter, vanilla, orange zest (if using), cinnamon, nutmeg, and salt until smooth.",
      "Spread sweet potato filling into chilled pie crust, filling it about halfway (important to avoid overflow).",
      "Make pecan topping: In another bowl, whisk together eggs, brown sugar, corn syrup, melted butter, vanilla, and salt until well combined. Stir in chopped pecans.",
      "Carefully pour pecan topping over the sweet potato layer, filling to just below the crust edge.",
      "Bake for 1 hour and 15 minutes, or until the center is set and filling doesn't jiggle when gently shaken.",
      "Cool pie on a wire rack for at least 45 minutes before slicing. Serve at room temperature or chilled."
    ],
    tags: ["dessert", "pie", "holiday", "thanksgiving", "southern"],
    nutrition: {
      calories: 520,
      protein: "7g",
      carbs: "68g",
      fat: "26g"
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

/**
 * Get recipe by slug
 */
export const getRecipeBySlug = (slug) => {
  return recipes.find(recipe => recipe.slug === slug);
};
