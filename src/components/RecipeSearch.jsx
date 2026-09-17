import React, { useState, useEffect, useCallback } from 'react';
import RecipeCard from './RecipeCard';
import { searchRecipesWithDetails, getRecipeInformation, addToShoppingList } from '../utils/recipeAPI';

function RecipeSearch({ searchQuery, onSelectRecipe, user, onAddToGroceryList }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = useCallback(async () => {
    if (!searchQuery || searchQuery.trim() === '') {
      setError('Please enter a search term');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const results = await searchRecipesWithDetails(searchQuery);
      setRecipes(results);
    } catch (err) {
      setError('Failed to fetch recipes. Please try again.');
      console.error('Error searching recipes:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    }
  }, [searchQuery, handleSearch]);

  const handleViewRecipe = async (recipeId) => {
    try {
      setLoading(true);
      const recipeDetails = await getRecipeInformation(recipeId, true);
      onSelectRecipe(recipeDetails);
    } catch (err) {
      setError('Failed to load recipe details.');
      console.error('Error loading recipe:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recipe-search">
      <div className="container">
        <h2 style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>
          {searchQuery ? `Results for "${searchQuery}"` : 'Search for recipes'}
        </h2>
        
        {loading && (
          <div className="loading" style={{ margin: '2rem auto' }}></div>
        )}
        
        {error && (
          <div style={{ color: 'red', textAlign: 'center', margin: '1rem' }}>
            {error}
          </div>
        )}
        
        <div className="recipes" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          padding: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onViewFullRecipe={handleViewRecipe}
              user={user}
              onAddToGroceryList={onAddToGroceryList}
            />
          ))}
        </div>
        
        {!loading && recipes.length === 0 && searchQuery && (
          <p style={{ color: 'white', textAlign: 'center', margin: '2rem' }}>
            No recipes found. Try a different search term.
          </p>
        )}
      </div>
    </div>
  );
}

export default RecipeSearch;
