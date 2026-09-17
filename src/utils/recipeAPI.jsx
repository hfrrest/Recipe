const API_KEY = '1ef9459f2e2041e9baa6a616d45bb6dd';
const BASE_URL = 'https://api.spoonacular.com';

export async function getRecipeInformation(recipeId, includeNutrition = true) {
  const url = `${BASE_URL}/recipes/${recipeId}/information?apiKey=${API_KEY}&includeNutrition=${includeNutrition}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const recipeData = await response.json();
    return recipeData;
  } catch (error) {
    console.error('Error fetching recipe information:', error);
    throw error;
  }
}

export async function searchRecipesWithDetails(query) {
  const searchUrl = `${BASE_URL}/recipes/complexSearch?apiKey=${API_KEY}&query=${encodeURIComponent(query)}&number=6&addRecipeInformation=true`;
  
  try {
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error searching recipes:', error);
    throw error;
  }
}

export async function searchRecipesByIngredients(ingredients) {
  const searchUrl = `${BASE_URL}/recipes/findByIngredients?apiKey=${API_KEY}&ingredients=${encodeURIComponent(ingredients)}&number=12&ranking=2&ignorePantry=true`;
  
  try {
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const recipes = await response.json();
    
    // Fetch additional details for each recipe to get nutrition info
    const recipesWithDetails = await Promise.all(
      recipes.map(async (recipe) => {
        try {
          const details = await getRecipeInformation(recipe.id, true);
          return {
            ...recipe,
            ...details
          };
        } catch (error) {
          console.error(`Error fetching details for recipe ${recipe.id}:`, error);
          return recipe;
        }
      })
    );
    
    return recipesWithDetails;
  } catch (error) {
    console.error('Error searching recipes by ingredients:', error);
    throw error;
  }
}

// Meal Planner API Functions
export async function connectUser(userData) {
  const url = `${BASE_URL}/users/connect?apiKey=${API_KEY}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error connecting user:', error);
    throw error;
  }
}

export async function generateMealPlan(timeFrame = 'day', targetCalories = null, diet = null, exclude = null) {
  let url = `${BASE_URL}/mealplanner/generate?apiKey=${API_KEY}&timeFrame=${timeFrame}`;
  
  if (targetCalories) url += `&targetCalories=${targetCalories}`;
  if (diet) url += `&diet=${diet}`;
  if (exclude) url += `&exclude=${encodeURIComponent(exclude)}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating meal plan:', error);
    throw error;
  }
}

export async function getMealPlanWeek(username, hash, startDate) {
  const url = `${BASE_URL}/mealplanner/${username}/week/${startDate}?apiKey=${API_KEY}&hash=${hash}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching meal plan week:', error);
    throw error;
  }
}

export async function addToMealPlan(username, hash, mealPlanItem) {
  const url = `${BASE_URL}/mealplanner/${username}/items?apiKey=${API_KEY}&hash=${hash}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mealPlanItem),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding to meal plan:', error);
    throw error;
  }
}

export async function deleteFromMealPlan(username, hash, itemId) {
  const url = `${BASE_URL}/mealplanner/${username}/items/${itemId}?apiKey=${API_KEY}&hash=${hash}`;
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting from meal plan:', error);
    throw error;
  }
}

export async function getShoppingList(username, hash) {
  const url = `${BASE_URL}/mealplanner/${username}/shopping-list?apiKey=${API_KEY}&hash=${hash}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    throw error;
  }
}

export async function generateShoppingList(username, hash, startDate, endDate) {
  // Accept either YYYY-MM-DD strings or Unix timestamps (seconds)
  try {
    let startStr = startDate;
    let endStr = endDate;
    if (typeof startDate === 'number') {
      startStr = new Date(startDate * 1000).toISOString().slice(0,10);
    }
    if (typeof endDate === 'number') {
      endStr = new Date(endDate * 1000).toISOString().slice(0,10);
    }

    const url = `${BASE_URL}/mealplanner/${username}/shopping-list/${startStr}/${endStr}?apiKey=${API_KEY}&hash=${hash}`;

    const response = await fetch(url, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating shopping list:', error);
    throw error;
  }
}
export async function addToShoppingList(username, hash, item) {
  const url = `${BASE_URL}/mealplanner/${username}/shopping-list/items?apiKey=${API_KEY}&hash=${hash}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding to shopping list:', error);
    throw error;
  }
}

export async function deleteFromShoppingList(username, hash, itemId) {
  const url = `${BASE_URL}/mealplanner/${username}/shopping-list/items/${itemId}?apiKey=${API_KEY}&hash=${hash}`;
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting from shopping list:', error);
    throw error;
  }
}
