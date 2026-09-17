import React, { useState } from 'react';
import { generateMealPlan, addToMealPlan, getRecipeInformation } from '../utils/recipeAPI';
import './MealPlanner.css';
import RecipeModal from './RecipeModal';

function MealPlanner({ user }) {
  const [timeFrame, setTimeFrame] = useState('day');
  const [targetCalories, setTargetCalories] = useState('2000');
  const [diet, setDiet] = useState('');
  const [exclude, setExclude] = useState('');
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const diets = [
    '', 'Gluten Free', 'Ketogenic', 'Vegetarian', 'Lacto-Vegetarian',
    'Ovo-Vegetarian', 'Vegan', 'Pescetarian', 'Paleo', 'Primal', 'Low FODMAP', 'Whole30'
  ];

  const handleGenerateMealPlan = async () => {
    if (!targetCalories || targetCalories < 1) {
      setError('Please enter a valid calorie target');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const plan = await generateMealPlan(
        timeFrame,
        targetCalories,
        diet || null,
        exclude || null
      );
      
      setMealPlan(plan);
    } catch (err) {
      setError('Failed to generate meal plan. Please try again.');
      console.error('Error generating meal plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToMealPlan = async (meal, slotIndex) => {
    if (!user || !user.username || !user.hash) {
      setError('Please login to save meals to your plan');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Get current date timestamp (start of day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const timestamp = Math.floor(today.getTime() / 1000);

      const mealPlanItem = {
        date: timestamp,
        slot: slotIndex + 1, // 1 = breakfast, 2 = lunch, 3 = dinner
        position: 0,
        type: 'RECIPE',
        value: {
          id: meal.id,
          servings: meal.servings || 1,
          title: meal.title,
          imageType: meal.imageType || 'jpg',
        },
      };

      await addToMealPlan(user.username, user.hash, mealPlanItem);
      alert('Meal added to your plan!');
    } catch (err) {
      setError('Failed to save meal to plan. Please try again.');
      console.error('Error saving meal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeClick = async (recipeId) => {
    try {
      setLoading(true);
      const recipeDetails = await getRecipeInformation(recipeId, true);
      setSelectedRecipe(recipeDetails);
    } catch (err) {
      setError('Failed to load recipe details.');
      console.error('Error loading recipe:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMealSlotName = (index) => {
    const slots = ['Breakfast', 'Lunch', 'Dinner'];
    return slots[index] || `Meal ${index + 1}`;
  };

  return (
    <div className="meal-planner">
      <h1>Meal Planner</h1>
      <p className="meal-planner__subtitle">
        Generate personalized meal plans based on your dietary preferences and calorie goals
      </p>

      <div className="meal-planner__form">
        <div className="form-group">
          <label htmlFor="timeFrame">Time Frame</label>
          <select
            id="timeFrame"
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
          >
            <option value="day">One Day</option>
            <option value="week">One Week</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="calories">Target Calories (per day)</label>
          <input
            type="number"
            id="calories"
            value={targetCalories}
            onChange={(e) => setTargetCalories(e.target.value)}
            placeholder="2000"
            min="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="diet">Diet (optional)</label>
          <select
            id="diet"
            value={diet}
            onChange={(e) => setDiet(e.target.value)}
          >
            <option value="">None</option>
            {diets.filter(d => d).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="exclude">Exclude Ingredients (optional)</label>
          <input
            type="text"
            id="exclude"
            value={exclude}
            onChange={(e) => setExclude(e.target.value)}
            placeholder="e.g., shellfish, peanuts"
          />
        </div>

        <button
          className="btn btn--primary"
          onClick={handleGenerateMealPlan}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Meal Plan'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {mealPlan && (
        <div className="meal-plan-results">
          {timeFrame === 'day' ? (
            <div className="day-plan">
              <h2>Your Daily Meal Plan</h2>
              <div className="nutrients-summary">
                <div className="nutrient">
                  <span className="nutrient__label">Calories:</span>
                  <span className="nutrient__value">
                    {Math.round(mealPlan.nutrients.calories)}
                  </span>
                </div>
                <div className="nutrient">
                  <span className="nutrient__label">Protein:</span>
                  <span className="nutrient__value">
                    {Math.round(mealPlan.nutrients.protein)}g
                  </span>
                </div>
                <div className="nutrient">
                  <span className="nutrient__label">Carbs:</span>
                  <span className="nutrient__value">
                    {Math.round(mealPlan.nutrients.carbohydrates)}g
                  </span>
                </div>
                <div className="nutrient">
                  <span className="nutrient__label">Fat:</span>
                  <span className="nutrient__value">
                    {Math.round(mealPlan.nutrients.fat)}g
                  </span>
                </div>
              </div>

              <div className="meals-grid">
                {mealPlan.meals.map((meal, index) => (
                  <div key={meal.id} className="meal-card">
                    <div className="meal-card__header">
                      <h3>{getMealSlotName(index)}</h3>
                      <span className="meal-time">
                        <i className="fa-regular fa-clock"></i> {meal.readyInMinutes} min
                      </span>
                    </div>
                    <img
                      src={`https://spoonacular.com/recipeImages/${meal.id}-312x231.${meal.imageType}`}
                      alt={meal.title}
                      className="meal-card__image"
                      onClick={() => handleRecipeClick(meal.id)}
                      style={{ cursor: 'pointer' }}
                    />
                    <div className="meal-card__content">
                      <h4>{meal.title}</h4>
                      <p className="servings">
                        <i className="fa-solid fa-utensils"></i> Servings: {meal.servings}
                      </p>
                      <div className="meal-card__actions">
                        <a
                          href={meal.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn--small btn--secondary"
                        >
                          View Recipe
                        </a>
                        {user && (
                          <button
                            className="btn btn--small btn--primary"
                            onClick={() => handleSaveToMealPlan(meal, index)}
                            disabled={loading}
                          >
                            Save to Plan
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="week-plan">
              <h2>Your Weekly Meal Plan</h2>
              {mealPlan.week && Object.entries(mealPlan.week).map(([day, dayData]) => (
                <div key={day} className="day-section">
                  <h3>Day {day}</h3>
                  <div className="nutrients-summary">
                    <div className="nutrient">
                      <span className="nutrient__label">Calories:</span>
                      <span className="nutrient__value">
                        {Math.round(dayData.nutrients.calories)}
                      </span>
                    </div>
                    <div className="nutrient">
                      <span className="nutrient__label">Protein:</span>
                      <span className="nutrient__value">
                        {Math.round(dayData.nutrients.protein)}g
                      </span>
                    </div>
                    <div className="nutrient">
                      <span className="nutrient__label">Carbs:</span>
                      <span className="nutrient__value">
                        {Math.round(dayData.nutrients.carbohydrates)}g
                      </span>
                    </div>
                    <div className="nutrient">
                      <span className="nutrient__label">Fat:</span>
                      <span className="nutrient__value">
                        {Math.round(dayData.nutrients.fat)}g
                      </span>
                    </div>
                  </div>
                  <div className="meals-grid">
                    {dayData.meals.map((meal, index) => (
                      <div key={meal.id} className="meal-card">
                        <div className="meal-card__header">
                          <h4>{getMealSlotName(index)}</h4>
                          <span className="meal-time">
                            <i className="fa-regular fa-clock"></i> {meal.readyInMinutes} min
                          </span>
                        </div>
                        <img
                          src={`https://spoonacular.com/recipeImages/${meal.id}-312x231.${meal.imageType}`}
                          alt={meal.title}
                          className="meal-card__image"
                        />
                        <div className="meal-card__content">
                          <h5>{meal.title}</h5>
                          <p className="servings">Servings: {meal.servings}</p>
                          <a
                            href={meal.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn--small btn--secondary"
                          >
                            View Recipe
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <RecipeModal 
        recipe={selectedRecipe} 
        onClose={() => setSelectedRecipe(null)} 
      />
    </div>
  );
}

export default MealPlanner;