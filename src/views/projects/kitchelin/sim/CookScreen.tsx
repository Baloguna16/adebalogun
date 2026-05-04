import { detectedIngredients } from './mockData';

export const CookScreen = () => (
  <>
    <div className="kitchelin-screen-header">
      <h3>Cook</h3>
    </div>
    <div className="kitchelin-screen-body">
      <div className="kitchelin-ingredient-photo">
        📸
      </div>
      <div style={{ fontSize: '0.5rem', color: '#96795E', fontWeight: 600, marginBottom: '4px' }}>
        Detected Ingredients
      </div>
      <div className="kitchelin-ingredient-chips">
        {detectedIngredients.map((item) => (
          <span key={item} className="kitchelin-ingredient-chip">{item}</span>
        ))}
      </div>
      <button className="kitchelin-generate-btn kitchelin-gradient">
        Generate Recipe ✨
      </button>
    </div>
    <div className="kitchelin-tab-bar">
      <div className="kitchelin-tab active">
        <span className="kitchelin-tab-icon">🍳</span>Cook
      </div>
      <div className="kitchelin-tab">
        <span className="kitchelin-tab-icon">🔪</span>Kitchen
      </div>
      <div className="kitchelin-tab">
        <span className="kitchelin-tab-icon">📖</span>Cookbook
      </div>
      <div className="kitchelin-tab">
        <span className="kitchelin-tab-icon">👨‍🍳</span>Chef
      </div>
    </div>
  </>
);
