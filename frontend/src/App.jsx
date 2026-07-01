import { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_ROOT = `${API_BASE_URL}/api`;

function formatList(items) {
  return items.map((item, index) => <li key={index}>{item}</li>);
}

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [randomDish, setRandomDish] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Search dishes or pick a random meal.');

  useEffect(() => {
    fetchDishes();
  }, []);

  const queryString = (params) =>
    new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, value]) => value))).toString();

  const fetchDishes = async (options = {}) => {
    setLoading(true);
    setMessage('Loading dishes...');

    const payload = {
      search: options.search ?? searchTerm,
      ingredients: options.ingredients ?? ingredients.join(','),
    };
    const query = queryString(payload);

    try {
      const response = await fetch(`${API_ROOT}/dishes${query ? `?${query}` : ''}`);
      if (!response.ok) {
        throw new Error('Could not load dishes.');
      }
      const data = await response.json();
      setDishes(data.dishes || []);
      setRandomDish(null);
      setMessage(data.dishes.length ? '' : 'No dishes found for that query.');
    } catch (error) {
      setMessage('Unable to load dishes. Please check the API.');
      setDishes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRandomDish = async () => {
    setLoading(true);
    setMessage('Choosing a random dish...');
    const ingredientsQuery = ingredients.length ? ingredients.join(',') : undefined;

    try {
      const response = await fetch(`${API_ROOT}/random${ingredientsQuery ? `?ingredients=${encodeURIComponent(ingredientsQuery)}` : ''}`);
      if (!response.ok) {
        throw new Error('No matching dishes.');
      }
      const data = await response.json();
      setRandomDish(data.dish);
      setMessage('A delicious random dish is ready.');
    } catch (error) {
      setRandomDish(null);
      setMessage('No random dish matched your ingredient filters.');
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = () => {
    const value = ingredientInput.trim();
    if (!value) return;
    const normalized = value.toLowerCase();
    if (ingredients.some((item) => item.toLowerCase() === normalized)) {
      setIngredientInput('');
      return;
    }
    setIngredients((current) => [...current, value]);
    setIngredientInput('');
  };

  const removeIngredient = (index) => {
    setIngredients((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setIngredients([]);
    setIngredientInput('');
    setRandomDish(null);
    fetchDishes({ search: '', ingredients: '' });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    fetchDishes();
  };

  return (
    <div className="app-shell">
      <header className="hero-panel">
        <div>
          <p className="eyebrow">Dinner of Choose</p>
          <h1>Find the perfect meal with one click.</h1>
        </div>
      </header>

      <main className="content-grid">
        <section className="controls-card">
          <form onSubmit={handleSearchSubmit} className="search-bar">
            <label htmlFor="search">Search dishes</label>
            <input
              id="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Type dish name or ingredient"
            />
            <button type="submit" className="primary-button">
              Search
            </button>
          </form>

          <div className="ingredient-filter">
            <label htmlFor="ingredient">Include ingredient</label>
            <div className="ingredient-actions">
              <input
                id="ingredient"
                value={ingredientInput}
                onChange={(event) => setIngredientInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addIngredient();
                  }
                }}
                placeholder="e.g. tomato, garlic"
              />
              <button type="button" className="secondary-button" onClick={addIngredient}>
                Add
              </button>
            </div>
          </div>

          {ingredients.length > 0 && (
            <div className="filter-chips">
              {ingredients.map((ingredient, index) => (
                <button key={ingredient + index} type="button" className="chip" onClick={() => removeIngredient(index)}>
                  {ingredient} <span>&times;</span>
                </button>
              ))}
            </div>
          )}

          <div className="action-row">
            <button type="button" className="primary-button wide" onClick={fetchRandomDish} disabled={loading}>
              Pick a random dish
            </button>
            <button type="button" className="tertiary-button wide" onClick={clearFilters}>
              Clear filters
            </button>
          </div>

          <div className="status-panel">
            {loading ? <p>Loading…</p> : <p>{message}</p>}
          </div>
        </section>

        {randomDish && (
          <section className="highlight-card">
            <div className="section-header">
              <h2>Random choice</h2>
              <p>This is a randomly selected dish that matches your filters.</p>
            </div>
            <article className="dish-card featured">
              <h3>{randomDish.name}</h3>
              <details>
                <summary>Ingredients</summary>
                <ul>{formatList(randomDish.ingredients)}</ul>
              </details>
              <details>
                <summary>Cooking steps</summary>
                <ol>{formatList(randomDish.steps)}</ol>
              </details>
            </article>
          </section>
        )}

        <section className="results-card">
          <div className="section-header">
            <h2>Available dishes</h2>
            <p>Results are matched against the search query and selected ingredients.</p>
          </div>

          {dishes.length === 0 && !loading ? (
            <div className="empty-state">
              <p>There are no matching dishes. Try a broader search or remove ingredient filters.</p>
            </div>
          ) : (
            <div className="dish-grid">
              {dishes.map((dish) => (
                <article key={dish.id} className="dish-card">
                  <h3>{dish.name}</h3>
                  <details>
                    <summary>Ingredients</summary>
                    <ul>{formatList(dish.ingredients)}</ul>
                  </details>
                  <details>
                    <summary>Cooking steps</summary>
                    <ol>{formatList(dish.steps)}</ol>
                  </details>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
