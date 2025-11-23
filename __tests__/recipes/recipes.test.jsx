/**
 * Recipe Feature Tests
 *
 * Tests for the recipes page components using Jest and React Testing Library.
 *
 * SETUP REQUIRED:
 * 1. Install testing dependencies:
 *    npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom
 *
 * 2. Create jest.config.js in project root:
 *    module.exports = {
 *      testEnvironment: 'jsdom',
 *      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
 *      moduleNameMapper: {
 *        '^@/(.*)$': '<rootDir>/$1',
 *        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
 *      },
 *    };
 *
 * 3. Create jest.setup.js in project root:
 *    import '@testing-library/jest-dom';
 *
 * 4. Add to package.json scripts:
 *    "test": "jest",
 *    "test:watch": "jest --watch"
 *
 * RUN TESTS:
 * npm test
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Import components
import CategoryFilter from '@/components/recipes/CategoryFilter';
import RecipeGrid from '@/components/recipes/RecipeGrid';
import RecipeCard from '@/components/recipes/RecipeCard';
import RecipeModal from '@/components/recipes/RecipeModal';
import RecipesPage from '@/app/recipes/page';

// Import data
import { recipes, getCategories } from '@/data/recipes';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    article: ({ children, ...props }) => <article {...props}>{children}</article>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe('Recipe Data', () => {
  test('should have 8 recipes', () => {
    expect(recipes).toHaveLength(8);
  });

  test('all recipes should have required fields', () => {
    recipes.forEach((recipe) => {
      expect(recipe).toHaveProperty('id');
      expect(recipe).toHaveProperty('title');
      expect(recipe).toHaveProperty('category');
      expect(recipe).toHaveProperty('difficulty');
      expect(recipe).toHaveProperty('ingredients');
      expect(recipe).toHaveProperty('instructions');
    });
  });

  test('getCategories should return all unique categories plus "All"', () => {
    const categories = getCategories();
    expect(categories).toContain('All');
    expect(categories.length).toBeGreaterThan(1);
  });
});

describe('CategoryFilter Component', () => {
  const mockCategories = ['All', 'Soups & Stews', 'Salads & Bowls', 'Pasta & Grains'];
  const mockOnCategoryChange = jest.fn();

  beforeEach(() => {
    mockOnCategoryChange.mockClear();
  });

  test('renders all category buttons', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        activeCategory="All"
        onCategoryChange={mockOnCategoryChange}
      />
    );

    mockCategories.forEach((category) => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  test('highlights active category', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        activeCategory="Soups & Stews"
        onCategoryChange={mockOnCategoryChange}
      />
    );

    const activeButton = screen.getByText('Soups & Stews');
    expect(activeButton).toHaveClass('active');
  });

  test('calls onCategoryChange when category is clicked', async () => {
    const user = userEvent.setup();

    render(
      <CategoryFilter
        categories={mockCategories}
        activeCategory="All"
        onCategoryChange={mockOnCategoryChange}
      />
    );

    const saladsButton = screen.getByText('Salads & Bowls');
    await user.click(saladsButton);

    expect(mockOnCategoryChange).toHaveBeenCalledWith('Salads & Bowls');
    expect(mockOnCategoryChange).toHaveBeenCalledTimes(1);
  });

  test('is keyboard accessible', async () => {
    const user = userEvent.setup();

    render(
      <CategoryFilter
        categories={mockCategories}
        activeCategory="All"
        onCategoryChange={mockOnCategoryChange}
      />
    );

    const firstButton = screen.getByText('All');
    firstButton.focus();

    expect(firstButton).toHaveFocus();
  });
});

describe('RecipeGrid Component', () => {
  const mockOnRecipeClick = jest.fn();

  beforeEach(() => {
    mockOnRecipeClick.mockClear();
  });

  test('renders recipe cards when recipes are provided', () => {
    const testRecipes = recipes.slice(0, 3);

    render(<RecipeGrid recipes={testRecipes} onRecipeClick={mockOnRecipeClick} />);

    testRecipes.forEach((recipe) => {
      expect(screen.getByText(recipe.title)).toBeInTheDocument();
    });
  });

  test('displays empty state when no recipes', () => {
    render(<RecipeGrid recipes={[]} onRecipeClick={mockOnRecipeClick} />);

    expect(screen.getByText('No recipes found')).toBeInTheDocument();
  });

  test('displays correct number of recipes', () => {
    const testRecipes = recipes.slice(0, 5);

    render(<RecipeGrid recipes={testRecipes} onRecipeClick={mockOnRecipeClick} />);

    const recipeCards = screen.getAllByRole('button', { name: /View recipe:/i });
    expect(recipeCards).toHaveLength(5);
  });
});

describe('RecipeCard Component', () => {
  const testRecipe = recipes[0];
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  test('renders recipe information correctly', () => {
    render(<RecipeCard recipe={testRecipe} onClick={mockOnClick} index={0} />);

    expect(screen.getByText(testRecipe.title)).toBeInTheDocument();
    expect(screen.getByText(testRecipe.category)).toBeInTheDocument();
    expect(screen.getByText(testRecipe.difficulty)).toBeInTheDocument();
    expect(screen.getByText(testRecipe.description)).toBeInTheDocument();
  });

  test('calls onClick when card is clicked', async () => {
    const user = userEvent.setup();

    render(<RecipeCard recipe={testRecipe} onClick={mockOnClick} index={0} />);

    const card = screen.getByRole('button', { name: `View recipe: ${testRecipe.title}` });
    await user.click(card);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test('is keyboard accessible with Enter key', () => {
    render(<RecipeCard recipe={testRecipe} onClick={mockOnClick} index={0} />);

    const card = screen.getByRole('button', { name: `View recipe: ${testRecipe.title}` });

    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test('is keyboard accessible with Space key', () => {
    render(<RecipeCard recipe={testRecipe} onClick={mockOnClick} index={0} />);

    const card = screen.getByRole('button', { name: `View recipe: ${testRecipe.title}` });

    fireEvent.keyDown(card, { key: ' ', code: 'Space' });
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test('displays recipe tags', () => {
    render(<RecipeCard recipe={testRecipe} onClick={mockOnClick} index={0} />);

    const displayedTags = testRecipe.tags.slice(0, 3);
    displayedTags.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });
});

describe('RecipeModal Component', () => {
  const testRecipe = recipes[0];
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  test('does not render when recipe is null', () => {
    const { container } = render(<RecipeModal recipe={null} onClose={mockOnClose} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders recipe details when recipe is provided', () => {
    render(<RecipeModal recipe={testRecipe} onClose={mockOnClose} />);

    expect(screen.getByText(testRecipe.title)).toBeInTheDocument();
    expect(screen.getByText('Ingredients')).toBeInTheDocument();
    expect(screen.getByText('Instructions')).toBeInTheDocument();
  });

  test('displays all ingredients', () => {
    render(<RecipeModal recipe={testRecipe} onClose={mockOnClose} />);

    testRecipe.ingredients.forEach((ingredient) => {
      expect(screen.getByText(ingredient)).toBeInTheDocument();
    });
  });

  test('displays all instructions', () => {
    render(<RecipeModal recipe={testRecipe} onClose={mockOnClose} />);

    testRecipe.instructions.forEach((instruction) => {
      expect(screen.getByText(instruction)).toBeInTheDocument();
    });
  });

  test('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();

    render(<RecipeModal recipe={testRecipe} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText('Close recipe details');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when Escape key is pressed', () => {
    render(<RecipeModal recipe={testRecipe} onClose={mockOnClose} />);

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('displays nutrition information', () => {
    render(<RecipeModal recipe={testRecipe} onClose={mockOnClose} />);

    if (testRecipe.nutrition) {
      expect(screen.getByText('Nutrition (per serving)')).toBeInTheDocument();
      expect(screen.getByText(testRecipe.nutrition.calories.toString())).toBeInTheDocument();
    }
  });

  test('is accessible with proper ARIA attributes', () => {
    render(<RecipeModal recipe={testRecipe} onClose={mockOnClose} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });
});

describe('RecipesPage Integration', () => {
  test('renders all main sections', () => {
    render(<RecipesPage />);

    // Check for hero section content
    expect(screen.getByText('Discover Delicious Recipes')).toBeInTheDocument();

    // Check for category filter
    expect(screen.getByText('Filter by Category')).toBeInTheDocument();

    // Check that recipes are rendered
    expect(screen.getByText(recipes[0].title)).toBeInTheDocument();
  });

  test('filters recipes by category', async () => {
    const user = userEvent.setup();

    render(<RecipesPage />);

    // Initially, all recipes should be visible
    expect(screen.getByText(recipes[0].title)).toBeInTheDocument();

    // Click on a specific category
    const soupCategory = screen.getByText('Soups & Stews');
    await user.click(soupCategory);

    // Only soup recipes should be visible
    const soupRecipes = recipes.filter(r => r.category === 'Soups & Stews');
    soupRecipes.forEach(recipe => {
      expect(screen.getByText(recipe.title)).toBeInTheDocument();
    });
  });

  test('opens modal when recipe card is clicked', async () => {
    const user = userEvent.setup();

    render(<RecipesPage />);

    const firstRecipeCard = screen.getByRole('button', {
      name: `View recipe: ${recipes[0].title}`
    });

    await user.click(firstRecipeCard);

    // Modal should now show ingredients and instructions
    await waitFor(() => {
      expect(screen.getByText('Ingredients')).toBeInTheDocument();
      expect(screen.getByText('Instructions')).toBeInTheDocument();
    });
  });

  test('closes modal when close button is clicked', async () => {
    const user = userEvent.setup();

    render(<RecipesPage />);

    // Open modal
    const firstRecipeCard = screen.getByRole('button', {
      name: `View recipe: ${recipes[0].title}`
    });
    await user.click(firstRecipeCard);

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByLabelText('Close recipe details')).toBeInTheDocument();
    });

    // Close modal
    const closeButton = screen.getByLabelText('Close recipe details');
    await user.click(closeButton);

    // Modal content should no longer be visible
    await waitFor(() => {
      expect(screen.queryByText('Ingredients')).not.toBeInTheDocument();
    });
  });
});

/**
 * TEST PLAN (Manual Testing Checklist)
 *
 * If you cannot run automated tests, use this manual test plan:
 *
 * 1. CATEGORY FILTERING
 *    - [ ] Click each category button
 *    - [ ] Verify that only recipes from that category are shown
 *    - [ ] Verify "All" shows all recipes
 *    - [ ] Check that active category is highlighted
 *
 * 2. MODAL FUNCTIONALITY
 *    - [ ] Click on a recipe card
 *    - [ ] Verify modal opens with full recipe details
 *    - [ ] Verify all ingredients are displayed
 *    - [ ] Verify all instructions are numbered correctly
 *    - [ ] Verify nutrition information is shown
 *    - [ ] Click close button - modal should close
 *    - [ ] Open modal again, press Escape key - modal should close
 *    - [ ] Click outside modal (on backdrop) - modal should close
 *
 * 3. KEYBOARD ACCESSIBILITY
 *    - [ ] Tab through category buttons - all should be focusable
 *    - [ ] Tab through recipe cards - all should be focusable
 *    - [ ] Press Enter on a focused recipe card - modal should open
 *    - [ ] With modal open, press Escape - modal should close
 *    - [ ] After closing modal, focus should return to the recipe card
 *
 * 4. RESPONSIVE DESIGN
 *    - [ ] Test on mobile viewport (375px width)
 *    - [ ] Test on tablet viewport (768px width)
 *    - [ ] Test on desktop viewport (1440px width)
 *    - [ ] Verify grid layout adjusts appropriately
 *    - [ ] Verify modal is scrollable on small screens
 *
 * 5. IMAGE LAZY LOADING
 *    - [ ] Open browser DevTools Network tab
 *    - [ ] Scroll down the page
 *    - [ ] Verify images load as they come into viewport
 *
 * 6. PERFORMANCE
 *    - [ ] Category switching should be instant (client-side)
 *    - [ ] No flickering when filtering
 *    - [ ] Smooth animations on card hover
 *    - [ ] Modal opens/closes smoothly
 */
