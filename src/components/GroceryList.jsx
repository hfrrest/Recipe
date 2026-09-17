import React, { useState, useEffect, useCallback } from 'react';
import { 
  getShoppingList, 
  generateShoppingList, 
  addToShoppingList, 
  deleteFromShoppingList 
} from '../utils/recipeAPI';
import './GroceryList.css';

function GroceryList({ user }) {
  const [shoppingList, setShoppingList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newItem, setNewItem] = useState('');

  const loadShoppingList = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const list = await getShoppingList(user.username, user.hash);
      setShoppingList(list);
    } catch (err) {
      setError('Failed to load shopping list.');
      console.error('Error loading shopping list:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.username && user.hash) {
      loadShoppingList();
    }
  }, [user, loadShoppingList]);

  const handleGenerateShoppingList = async () => {
    if (!user || !user.username || !user.hash) {
      setError('Please login to generate a shopping list');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Generate for current week
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = Math.floor(today.getTime() / 1000);
      
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 7);
      const endTimestamp = Math.floor(endDate.getTime() / 1000);

      await generateShoppingList(user.username, user.hash, startDate, endTimestamp);
      await loadShoppingList();
      
      alert('Shopping list generated from your meal plan!');
    } catch (err) {
      setError('Failed to generate shopping list. Make sure you have meals in your plan.');
      console.error('Error generating shopping list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    
    if (!newItem.trim()) {
      setError('Please enter an item');
      return;
    }

    if (!user || !user.username || !user.hash) {
      setError('Please login to add items');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const item = {
        item: newItem,
        aisle: 'Miscellaneous',
        parse: true,
      };

      await addToShoppingList(user.username, user.hash, item);
      setNewItem('');
      await loadShoppingList();
    } catch (err) {
      setError('Failed to add item to shopping list.');
      console.error('Error adding item:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!user || !user.username || !user.hash) {
      setError('Please login to delete items');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await deleteFromShoppingList(user.username, user.hash, itemId);
      await loadShoppingList();
    } catch (err) {
      setError('Failed to delete item from shopping list.');
      console.error('Error deleting item:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.username) {
    return (
      <div className="grocery-list">
        <h1>Grocery List</h1>
        <div className="login-prompt">
          <i className="fa-solid fa-cart-shopping fa-3x"></i>
          <p>Please login to access your shopping list</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grocery-list">
      <h1>
        <i className="fa-solid fa-cart-shopping"></i> Grocery List
      </h1>
      
      <div className="grocery-actions">
        <button
          className="btn btn--primary"
          onClick={handleGenerateShoppingList}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate from Meal Plan'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <form className="add-item-form" onSubmit={handleAddItem}>
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add item to shopping list..."
          disabled={loading}
        />
        <button type="submit" className="btn btn--secondary" disabled={loading}>
          <i className="fa-solid fa-plus"></i> Add
        </button>
      </form>

      {shoppingList && (
        <div className="shopping-list-content">
          {shoppingList.aisles && shoppingList.aisles.length > 0 ? (
            shoppingList.aisles.map((aisle) => (
              <div key={aisle.aisle} className="aisle-section">
                <h2>{aisle.aisle}</h2>
                <ul className="items-list">
                  {aisle.items.map((item) => (
                    <li key={item.id} className="shopping-item">
                      <div className="item-info">
                        <input type="checkbox" />
                        <span className="item-name">{item.name}</span>
                        {item.measures && (
                          <span className="item-measure">
                            {item.measures.original.amount} {item.measures.original.unit}
                          </span>
                        )}
                      </div>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={loading}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="empty-list">
              <i className="fa-solid fa-basket-shopping fa-3x"></i>
              <p>Your shopping list is empty</p>
              <p className="empty-list__hint">
                Generate a list from your meal plan or add items manually
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GroceryList;