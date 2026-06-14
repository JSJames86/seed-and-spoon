/**
 * Recipe Data File
 *
 * This file contains all recipe data for the recipes page.
 * Each recipe object includes metadata, ingredients, instructions, and image paths.
 *
 * `instacartImage` points to a 500x500 square crop in
 * /public/images/recipes/instacart/, used for the Instacart Developer
 * Platform "Create Recipe Page" API's image_url field.
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
    cookTimeMinutes: 15,
    servings: "3 cups",
    description: "Sweet, tangy, and festive cranberry orange sauce perfect for holiday meals.",
    image: "/images/recipes/cranberry-orange-sauce.jpg",
    instacartImage: "/images/recipes/instacart/cranberry-orange-sauce.jpg",
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
    cookTimeMinutes: 50,
    servings: "9-10 cups",
    description: "Classic stuffing with savory Italian sausage, tart apples, and herbs baked to golden perfection.",
    image: "/images/recipes/sausage-apple-stuffing.png",
    instacartImage: "/images/recipes/instacart/sausage-apple-stuffing.jpg",
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
    cookTimeMinutes: 240,
    servings: "12-16 servings",
    description: "Juicy, flavorful Cajun-style turkey with a spicy butter marinade and aromatic rub, perfect for roasting or deep-frying.",
    image: "/images/recipes/cajun-turkey.png",
    instacartImage: "/images/recipes/instacart/cajun-turkey.jpg",
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
    cookTimeMinutes: 20,
    servings: "4-6 servings",
    description: "Creamy, fluffy mashed potatoes made from scratch with butter and milk, perfect for holiday meals.",
    image: "/images/recipes/mashed-potatoes.jpeg",
    instacartImage: "/images/recipes/instacart/mashed-potatoes.jpg",
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
    cookTimeMinutes: 10,
    servings: "2.5-3 cups",
    description: "Savory, spicy Cajun-style turkey gravy perfect for drizzling over roasted turkey and mashed potatoes.",
    image: "/images/recipes/cajun-turkey-gravy.jpeg",
    instacartImage: "/images/recipes/instacart/cajun-turkey-gravy.jpg",
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
    cookTimeMinutes: 105,
    servings: "6-8 servings",
    description: "Slow-simmered fresh green beans cooked with smoked turkey, onions, garlic, and rich broth for deep, soulful flavor.",
    image: "/images/recipes/green-beans.jpeg",
    instacartImage: "/images/recipes/instacart/green-beans.jpg",
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
    cookTimeMinutes: 22,
    servings: "8 servings",
    description: "Ultra-moist, cake-like Jiffy cornbread boosted with vanilla pudding mix, served with a sweet cinnamon honey butter spread.",
    image: "/images/recipes/moist-cornbread.png",
    instacartImage: "/images/recipes/instacart/moist-cornbread.jpg",
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
    cookTimeMinutes: 75,
    servings: "8 slices",
    description: "Velvety sweet potato base layered with a glossy pecan topping — a soulful holiday pie. Fill crust half sweet potato and half pecan topping to avoid overflow.",
    image: "/images/recipes/sweet-potato-pecan-pie.png",
    instacartImage: "/images/recipes/instacart/sweet-potato-pecan-pie.jpg",
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
  },
  {
    id: 9,
    slug: "big-mac-bowl",
    title: "Big Mac Bowl",
    category: "Main Dishes",
    difficulty: "Easy",
    prepTime: "15 min",
    cookTime: "20 min",
    cookTimeMinutes: 20,
    servings: "4 servings",
    description: "All the flavor of a Big Mac without the bun—seasoned beef, lettuce, pickles, cheese, and creamy special sauce in a low-carb bowl.",
    cuisine: ["American"],
    ingredients: [
      "1 lb lean ground beef",
      "1/2 cup onion, chopped",
      "2 tsp yellow mustard",
      "1 tsp garlic powder",
      "1 tsp onion powder",
      "Salt and black pepper",
      "1/2 cup light mayonnaise",
      "1/3 cup ketchup",
      "1/4 cup dill pickles, chopped",
      "1 1/2 tbsp pickle juice",
      "8 cups iceberg lettuce, shredded",
      "1 cup cheddar cheese",
      "1 cup dill pickles",
      "1 cup tomatoes",
      "1/2 cup red onion"
    ],
    instructions: [
      "Brown ground beef in skillet over medium-high heat.",
      "Add onion, mustard, garlic powder, onion powder, salt, and pepper.",
      "Cook until onions are soft and beef is fully cooked; drain fat.",
      "Mix mayo, ketchup, pickles, pickle juice, garlic powder, onion powder, paprika to make sauce.",
      "Layer lettuce in bowls.",
      "Top with beef mixture, cheese, pickles, tomatoes, and onion.",
      "Drizzle with sauce and serve immediately."
    ],
    tags: ["low-carb", "keto-friendly", "fast-food-inspired", "high-protein", "no-bun"]
  },
  {
    id: 10,
    slug: "creamy-lemon-chicken-orzo",
    title: "Creamy Lemon Chicken Orzo",
    category: "Main Dishes",
    difficulty: "Easy",
    prepTime: "10 min",
    cookTime: "30 min",
    cookTimeMinutes: 30,
    servings: "4 servings",
    description: "One-pot creamy orzo with tender chicken, lemon, garlic, and herbs for a bright and comforting dinner.",
    cuisine: ["Mediterranean", "American"],
    ingredients: [
      "2 tbsp olive oil",
      "1 lb chicken breast, cubed",
      "1 tsp salt",
      "1/2 tsp black pepper",
      "3 cloves garlic, minced",
      "1 tsp oregano",
      "2 cups chicken broth",
      "1 cup orzo",
      "1/2 cup heavy cream",
      "Juice and zest of 1 lemon",
      "2 cups spinach",
      "Fresh parsley"
    ],
    instructions: [
      "Heat olive oil in skillet and cook chicken with salt and pepper.",
      "Add garlic and oregano; sauté until fragrant.",
      "Add broth and orzo; simmer until pasta absorbs liquid.",
      "Stir in cream, lemon juice, and zest.",
      "Add spinach and cook until wilted.",
      "Garnish with parsley and serve."
    ],
    tags: ["one-pot", "creamy", "lemon", "comfort-food"]
  },
  {
    id: 11,
    slug: "crunchy-coconut-chicken",
    title: "Crunchy Coconut Chicken",
    category: "Main Dishes",
    difficulty: "Easy",
    prepTime: "15 min",
    cookTime: "30 min",
    cookTimeMinutes: 30,
    servings: "4 servings",
    description: "Crispy baked chicken coated in coconut and panko for a kid-friendly, crunchy dinner.",
    cuisine: ["American", "Fusion"],
    ingredients: [
      "1.5 lbs chicken breast strips",
      "1 cup flour",
      "2 eggs",
      "1.5 cups panko breadcrumbs",
      "1 cup shredded coconut",
      "1 tsp salt",
      "1/2 tsp garlic powder",
      "1/2 tsp black pepper"
    ],
    instructions: [
      "Preheat oven to 400°F.",
      "Set up flour, egg, and coconut-panko stations.",
      "Dredge chicken in flour, egg, then coconut mixture.",
      "Place on baking sheet and spray lightly with oil.",
      "Bake 22–25 minutes until golden and cooked through."
    ],
    tags: ["crispy", "baked", "kid-friendly", "sheet-pan"]
  },
  {
    id: 12,
    slug: "orange-chicken",
    title: "Orange Chicken",
    category: "Main Dishes",
    difficulty: "Medium",
    prepTime: "15 min",
    cookTime: "30 min",
    cookTimeMinutes: 30,
    servings: "4 servings",
    description: "Crispy chicken tossed in a sticky, sweet orange glaze with soy, ginger, and garlic.",
    cuisine: ["Asian"],
    ingredients: [
      "1.5 lbs chicken thighs",
      "1/2 cup cornstarch",
      "3 tbsp oil",
      "3/4 cup orange juice",
      "1/4 cup soy sauce",
      "1/4 cup honey",
      "2 tbsp rice vinegar",
      "Garlic and ginger",
      "1 tsp sesame oil"
    ],
    instructions: [
      "Coat chicken in cornstarch.",
      "Pan-fry until crispy and golden.",
      "Cook garlic and ginger in pan.",
      "Add sauce ingredients and simmer.",
      "Return chicken and toss in glaze.",
      "Serve over rice."
    ],
    tags: ["takeout-style", "crispy", "sweet-savory"]
  },
  {
    id: 13,
    slug: "hawaiian-shoyu-chicken",
    title: "Hawaiian Shoyu Chicken",
    category: "Main Dishes",
    difficulty: "Medium",
    prepTime: "10 min",
    cookTime: "50 min",
    cookTimeMinutes: 50,
    servings: "4-6 servings",
    description: "Slow-baked soy-glazed chicken with garlic, ginger, and sweet caramelized sauce.",
    cuisine: ["Hawaiian", "Asian"],
    ingredients: [
      "3 lbs chicken thighs",
      "1 cup soy sauce",
      "1 cup water",
      "1 cup sugar",
      "3/4 cup mirin",
      "Garlic and ginger"
    ],
    instructions: [
      "Mix marinade ingredients.",
      "Brown chicken in skillet.",
      "Add sauce and bake until caramelized.",
      "Baste occasionally while cooking.",
      "Serve over rice."
    ],
    tags: ["sweet-savory", "glazed", "oven-baked"]
  },
  {
    id: 14,
    slug: "chicken-broccoli-stir-fry",
    title: "Chicken and Broccoli Stir-Fry",
    category: "Main Dishes",
    difficulty: "Easy",
    prepTime: "10 min",
    cookTime: "20 min",
    cookTimeMinutes: 20,
    servings: "4 servings",
    description: "Quick skillet stir-fry with tender chicken, crisp broccoli, and savory sauce.",
    cuisine: ["Asian"],
    ingredients: [
      "1.5 lbs chicken breast",
      "4 cups broccoli",
      "3 tbsp oil",
      "Garlic",
      "Soy sauce",
      "Oyster sauce",
      "Honey",
      "Cornstarch"
    ],
    instructions: [
      "Cook chicken until browned.",
      "Stir-fry broccoli until crisp-tender.",
      "Add garlic.",
      "Add sauce and simmer until thickened.",
      "Combine and serve over rice."
    ],
    tags: ["quick", "healthy", "stir-fry"]
  },
  {
    id: 15,
    slug: "greek-orzo-skillet",
    title: "Greek Orzo Skillet",
    category: "Main Dishes",
    difficulty: "Medium",
    prepTime: "10 min",
    cookTime: "35 min",
    cookTimeMinutes: 35,
    servings: "4 servings",
    description: "Mediterranean one-pan orzo with chicken, feta, spinach, olives, and sun-dried tomatoes.",
    cuisine: ["Mediterranean"],
    ingredients: [
      "1.5 lbs chicken thighs",
      "1.5 cups orzo",
      "2.5 cups broth",
      "Sun-dried tomatoes",
      "Spinach",
      "Feta cheese",
      "Olives",
      "Garlic"
    ],
    instructions: [
      "Brown chicken.",
      "Cook aromatics.",
      "Add orzo and broth and simmer.",
      "Stir in spinach, olives, feta.",
      "Serve warm."
    ],
    tags: ["one-pan", "cheesy", "vegetable-rich"]
  },
  {
    id: 16,
    slug: "chicken-alfredo-gnocchi-sundried-tomato",
    title: "Sun-Dried Tomato Chicken Gnocchi",
    category: "Main Dishes",
    difficulty: "Medium",
    prepTime: "10 min",
    cookTime: "30 min",
    cookTimeMinutes: 30,
    servings: "4 servings",
    description: "Creamy skillet gnocchi with chicken, sun-dried tomatoes, spinach, and Parmesan.",
    cuisine: ["Italian"],
    ingredients: [
      "1.5 lbs chicken breast",
      "1 lb gnocchi",
      "Sun-dried tomatoes",
      "Garlic",
      "Chicken broth",
      "Heavy cream",
      "Parmesan",
      "Spinach"
    ],
    instructions: [
      "Cook chicken until browned.",
      "Sauté garlic and sun-dried tomatoes.",
      "Add gnocchi and liquid; simmer.",
      "Stir in cream and Parmesan.",
      "Add spinach and chicken back in."
    ],
    tags: ["creamy", "one-pan", "comfort-food"]
  },
  {
    id: 17,
    slug: "chicken-lettuce-wraps",
    title: "Chicken Lettuce Wraps",
    category: "Main Dishes",
    difficulty: "Easy",
    prepTime: "10 min",
    cookTime: "15 min",
    cookTimeMinutes: 15,
    servings: "4 servings",
    description: "Savory ground chicken lettuce wraps with hoisin, soy sauce, garlic, and water chestnuts.",
    cuisine: ["Asian"],
    ingredients: [
      "1 lb ground chicken",
      "Garlic",
      "Ginger",
      "Water chestnuts",
      "Soy sauce",
      "Hoisin sauce",
      "Sesame oil",
      "Lettuce cups"
    ],
    instructions: [
      "Cook chicken until crumbled and browned.",
      "Add aromatics and water chestnuts.",
      "Add sauces and simmer.",
      "Serve in lettuce cups."
    ],
    tags: ["low-carb", "handheld", "quick"]
  },
  {
    id: 18,
    slug: "lazy-chicken-pot-pie",
    title: "Lazy Chicken Pot Pie",
    category: "Main Dishes",
    difficulty: "Medium",
    prepTime: "10 min",
    cookTime: "45 min",
    cookTimeMinutes: 45,
    servings: "4-6 servings",
    description: "Creamy chicken and vegetables topped with puff pastry for a fast comfort-food classic.",
    cuisine: ["American"],
    ingredients: [
      "3 cups cooked chicken",
      "Butter",
      "Flour",
      "Chicken broth",
      "Milk",
      "Frozen vegetables",
      "Puff pastry"
    ],
    instructions: [
      "Make creamy sauce base.",
      "Add chicken and vegetables.",
      "Top with puff pastry.",
      "Bake until golden."
    ],
    tags: ["comfort-food", "baked", "family-meal"]
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

/**
 * Cook time filter options for the recipes page FilterBar.
 * `value` is matched against `recipe.cookTimeMinutes` in filterRecipes().
 */
export const COOK_TIME_FILTERS = [
  { value: 'all', label: 'Any time' },
  { value: '15', label: '15 min or less' },
  { value: '30', label: '30 min or less' },
  { value: '30+', label: 'Over 30 min' },
];

/**
 * Get tags for the FilterBar, sorted alphabetically.
 *
 * Only tags shared by 2 or more recipes are included - with 18 recipes the
 * full tag vocabulary is ~40 entries, most used by a single recipe, which
 * would make the Tags filter unusably long. Recipes remain searchable by
 * their one-off tags via the search bar (title match) or category filter.
 */
export const getAllTags = () => {
  const counts = recipes.flatMap(recipe => recipe.tags).reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(counts).filter(tag => counts[tag] >= 2).sort();
};

/**
 * Pure filter function combining search, category, cook time, and tag
 * filters with AND logic. UI-free and testable - this is the seam a real
 * data source/API swaps into later.
 *
 * @param {Array} recipeList - recipes to filter
 * @param {Object} filters
 * @param {string} [filters.search] - case-insensitive title search
 * @param {string} [filters.category] - 'All' or a category name
 * @param {string} [filters.cookTime] - 'all' | '15' | '30' | '30+'
 * @param {string[]} [filters.tags] - tags the recipe must include
 */
export const filterRecipes = (recipeList, filters = {}) => {
  const { search = '', category = 'All', cookTime = 'all', tags = [] } = filters;
  const query = search.trim().toLowerCase();

  return recipeList.filter((recipe) => {
    const matchesSearch = !query || recipe.title.toLowerCase().includes(query);
    const matchesCategory = category === 'All' || recipe.category === category;
    const matchesCookTime =
      cookTime === 'all' ||
      (cookTime === '15' && recipe.cookTimeMinutes <= 15) ||
      (cookTime === '30' && recipe.cookTimeMinutes <= 30) ||
      (cookTime === '30+' && recipe.cookTimeMinutes > 30);
    // Recipe must match every selected tag (AND). For "match any" (OR), swap .every() for .some().
    const matchesTags = tags.every(tag => recipe.tags.includes(tag));

    return matchesSearch && matchesCategory && matchesCookTime && matchesTags;
  });
};
