import { recipeSteps } from './mockData';

export const RecipeScreen = () => (
  <>
    <div className="kitchelin-screen-header">
      <h3>Recipe</h3>
    </div>
    <div className="kitchelin-screen-body">
      <div className="kitchelin-recipe-title">
        Lemon-Herb Roasted Chicken & Potatoes
      </div>
      <div className="kitchelin-recipe-meta">
        <span className="kitchelin-recipe-tag">⏱ 45 min</span>
        <span className="kitchelin-recipe-tag">🍽 4 servings</span>
        <span className="kitchelin-recipe-tag">🔥 Easy</span>
      </div>
      <ol className="kitchelin-recipe-steps">
        {recipeSteps.map((step, i) => (
          <li key={i} className="kitchelin-recipe-step">
            <span className={`kitchelin-step-number ${step.done ? 'done' : ''}`}>
              {step.done ? '✓' : i + 1}
            </span>
            <div>
              <span className="kitchelin-step-text">{step.text}</span>
              {step.timer && (
                <div className="kitchelin-timer-pill">⏱ {step.timer}</div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
    <div className="kitchelin-tab-bar">
      <div className="kitchelin-tab">
        <span className="kitchelin-tab-icon">🍳</span>Cook
      </div>
      <div className="kitchelin-tab">
        <span className="kitchelin-tab-icon">🔪</span>Kitchen
      </div>
      <div className="kitchelin-tab active">
        <span className="kitchelin-tab-icon">📖</span>Cookbook
      </div>
      <div className="kitchelin-tab">
        <span className="kitchelin-tab-icon">👨‍🍳</span>Chef
      </div>
    </div>
  </>
);
