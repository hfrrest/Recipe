import React, { useState } from 'react';
import { addToShoppingList, addToMealPlan } from '../utils/recipeAPI';

function RecipeModal({ recipe, onClose, user }) {
  const [loading, setLoading] = useState(false);
  const [mealPlanLoading, setMealPlanLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedMealSlot, setSelectedMealSlot] = useState(1); // 1 = breakfast, 2 = lunch, 3 = dinner

  if (!recipe) return null;

  const handleBackdropClick = (e) => {
    if (e.target.className === 'modal') {
      onClose();
    }
  };

  const handleAddToGroceryList = async () => {
    if (!user || !user.username || !user.hash) {
      setMessage('Please login to add items to grocery list');
      return;
    }

    if (!recipe.extendedIngredients || recipe.extendedIngredients.length === 0) {
      setMessage('No ingredients available to add');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      // Add each ingredient to the shopping list
      for (const ingredient of recipe.extendedIngredients) {
        const item = {
          item: ingredient.original,
          aisle: ingredient.aisle || 'Miscellaneous',
          parse: true,
        };
        
        await addToShoppingList(user.username, user.hash, item);
      }

      setMessage(`Successfully added ${recipe.extendedIngredients.length} ingredients to grocery list!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to add ingredients to grocery list');
      console.error('Error adding to grocery list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToMealPlan = async () => {
    if (!user || !user.username || !user.hash) {
      setMessage('Please login to add to meal plan');
      return;
    }

    try {
      setMealPlanLoading(true);
      setMessage('');

      // Get today's date in UNIX timestamp (seconds)
      const date = Math.floor(Date.now() / 1000);
      
      const mealPlanItem = {
        date: date,
        slot: selectedMealSlot,
        position: 0,
        type: 'RECIPE',
        value: {
          id: recipe.id,
          servings: recipe.servings || 1,
          title: recipe.title,
          imageType: recipe.image ? recipe.image.split('.').pop() : 'jpg'
        }
      };

      await addToMealPlan(user.username, user.hash, mealPlanItem);
      
      const mealNames = { 1: 'breakfast', 2: 'lunch', 3: 'dinner' };
      setMessage(`Successfully added to meal plan for ${mealNames[selectedMealSlot]}!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to add to meal plan');
      console.error('Error adding to meal plan:', err);
    } finally {
      setMealPlanLoading(false);
    }
  };

  return (
    <div className="modal" style={{ display: 'block' }} onClick={handleBackdropClick}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{recipe.title}</h2>
        {recipe.image && <img src={recipe.image} alt={recipe.title} />}
        
        {message && (
          <div className={message.includes('Success') ? 'success' : 'error'} style={{ marginBottom: '1rem' }}>
            {message}
          </div>
        )}

        <div className="recipe-details">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Ingredients:</h3>
            {user && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select 
                  value={selectedMealSlot} 
                  onChange={(e) => setSelectedMealSlot(Number(e.target.value))}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value={1}>Breakfast</option>
                  <option value={2}>Lunch</option>
                  <option value={3}>Dinner</option>
                </select>
                <button
                  className="btn btn--primary btn--small"
                  onClick={handleAddToMealPlan}
                  disabled={mealPlanLoading}
                >
                  {mealPlanLoading ? 'Adding...' : 'Add to Meal Plan'}
                </button>
                {recipe.extendedIngredients?.length > 0 && (
                  <button
                    className="btn btn--primary btn--small"
                    onClick={handleAddToGroceryList}
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add to Grocery List'}
                  </button>
                )}
              </div>
            )}
          </div>
          <ul className="ingredients-list">
            {recipe.extendedIngredients?.length ? (
              recipe.extendedIngredients.map((ingredient, index) => (
                <li key={index}>{ingredient.original}</li>
              ))
            ) : (
              <li>No ingredients available</li>
            )}
          </ul>
          
          <h3>Instructions:</h3>
          <div className="instructions">
            {recipe.instructions || 'No instructions available'}
          </div>
          
          {recipe.analyzedInstructions?.length > 0 && (
            <div className="step-by-step">
              <h4>Step-by-step:</h4>
              <ol>
                {recipe.analyzedInstructions[0].steps.map((step, index) => (
                  <li key={index}>{step.step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecipeModal;