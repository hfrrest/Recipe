import React, { useState, useEffect } from 'react';
import './App.css';
import Navigation from './components/Navigation';
import Header from './components/Header';
import Login from './components/Login';
import MealPlanner from './components/MealPlanner';
import GroceryList from './components/GroceryList';
import RecipeModal from './components/RecipeModal';
import RecipeSearch from './components/RecipeSearch';
import foodImage from './assets/food.jpg';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getRecipeInformation, addToShoppingList, connectUser } from './utils/recipeAPI';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [user, setUser] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        return;
      }

      // Try to augment Firebase user with Spoonacular username/hash
      try {
        const spoonResponse = await connectUser({ username: currentUser.email });
        const merged = { ...currentUser, username: spoonResponse.username, hash: spoonResponse.hash };
        setUser(merged);
      } catch (err) {
        console.warn('Could not connect to Spoonacular for currentUser:', err);
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, []);

  const closeModal = () => {
    setSelectedRecipe(null);
  };

  const navigateToPage = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      setSearchQuery(searchInput);
      setCurrentPage('recipe-search');
    }
  };

  const handleAddToGroceryList = async (recipeId) => {
    console.log('App.handleAddToGroceryList called', { recipeId, user });
    if (!user || !user.username || !user.hash) {
      alert('Please login to add items to grocery list');
      return;
    }

    try {
      const recipeDetails = await getRecipeInformation(recipeId, true);
      if (!recipeDetails.extendedIngredients || recipeDetails.extendedIngredients.length === 0) {
        alert('No ingredients available to add');
        return;
      }

      for (const ingredient of recipeDetails.extendedIngredients) {
        const item = {
          item: ingredient.original,
          aisle: ingredient.aisle || 'Miscellaneous',
          parse: true,
        };
        await addToShoppingList(user.username, user.hash, item);
      }

      alert(`Successfully added ${recipeDetails.extendedIngredients.length} ingredients to grocery list!`);
    } catch (err) {
      console.error('Error adding to grocery list from card:', err);
      alert('Failed to add ingredients to grocery list');
    }
  };

  return (
    <div className="app">
      <div className="background__overlay"></div>
      <img className="background__image" src={foodImage} alt="Food" />
      
      <Navigation onNavigate={navigateToPage} currentPage={currentPage} user={user} />
      
      <Header 
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        handleSearch={handleSearch}
      />

      {currentPage === 'home' && (
        <section id="home-page">
          <div className="container" style={{ color: 'white', textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
              Search for recipes above, plan your meals, or create your grocery list.
            </p>
          </div>
        </section>
      )}

      {currentPage === 'recipe-search' && (
        <section id="recipe-search-page">
          <RecipeSearch 
            searchQuery={searchQuery} 
            onSelectRecipe={setSelectedRecipe}
            user={user}
            onAddToGroceryList={handleAddToGroceryList}
          />
        </section>
      )}

      {currentPage === 'login' && (
        <section id="login-page">
          <Login setUser={setUser} />
        </section>
      )}

      {currentPage === 'meal-planner' && (
        <section id="meal-planner-page">
          <MealPlanner user={user} />
        </section>
      )}

      {currentPage === 'grocery-list' && (
        <section id="grocery-list-page">
          <GroceryList user={user} />
        </section>
      )}
      
      {selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} onClose={closeModal} user={user} />
      )}
    </div>
  );
}

export default App;


