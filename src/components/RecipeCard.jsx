import React from 'react';

function RecipeCard({ recipe, onViewFullRecipe, onAddToGroceryList, user }) {
  const nutrition = recipe.nutrition?.nutrients || [];
  const calories = nutrition.find(n => n.name === 'Calories')?.amount || 'N/A';
  const protein = nutrition.find(n => n.name === 'Protein')?.amount || 'N/A';
  const carbs = nutrition.find(n => n.name === 'Carbohydrates')?.amount || 'N/A';
  const fat = nutrition.find(n => n.name === 'Fat')?.amount || 'N/A';

  return (
    <div className="recipe">
      <h3>{recipe.title}</h3>
      {recipe.image && (
        <img src={recipe.image} alt={recipe.title} loading="lazy" />
      )}
      <div className="recipe-info">
        <p><strong>Ready in:</strong> {recipe.readyInMinutes || 'N/A'} minutes</p>
        <p><strong>Servings:</strong> {recipe.servings || 'N/A'}</p>
        <p><strong>Health Score:</strong> {recipe.healthScore || 'N/A'}/100</p>
      </div>
      <div className="nutrition-info">
        <p><strong>Calories:</strong> {calories}{typeof calories === 'number' ? ' kcal' : ''}</p>
        <p><strong>Protein:</strong> {protein}{typeof protein === 'number' ? 'g' : ''}</p>
        <p><strong>Carbs:</strong> {carbs}{typeof carbs === 'number' ? 'g' : ''}</p>
        <p><strong>Fat:</strong> {fat}{typeof fat === 'number' ? 'g' : ''}</p>
      </div>
      <div className="recipe-actions">
        <button onClick={() => onViewFullRecipe(recipe.id)} className="view-recipe-btn">
          View Full Recipe
        </button>
        {user && onAddToGroceryList && (
          <button 
            onClick={() => { console.log('RecipeCard: add clicked', { recipeId: recipe.id, user }); onAddToGroceryList(recipe.id); }} 
            className="add-to-grocery-btn"
          >
            Add to Grocery List
          </button>
        )}
      </div>
    </div>
  );
}

export default RecipeCard;
