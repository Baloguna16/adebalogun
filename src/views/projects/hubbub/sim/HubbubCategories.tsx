import { categories } from './mockData';

export const HubbubCategories = () => (
  <section style={{ padding: '48px 32px', background: '#f7f9fc' }}>
    <h2 style={{ textAlign: 'center', fontSize: '1.5rem', color: '#1a1a2e', marginBottom: '32px' }}>
      Browse Categories
    </h2>
    <div className="hubbub-category-grid">
      {categories.map((cat) => (
        <div key={cat.label} className="hubbub-category-card">
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{cat.emoji}</div>
          <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.95rem' }}>{cat.label}</div>
        </div>
      ))}
    </div>
  </section>
);
