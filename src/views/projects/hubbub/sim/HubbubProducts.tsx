import { products } from './mockData';

export const HubbubProducts = () => (
  <section style={{ padding: '48px 32px', background: '#fff' }}>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '720px',
        margin: '0 auto 24px',
      }}
    >
      <h2 style={{ fontSize: '1.5rem', color: '#1a1a2e' }}>Popular Rentals</h2>
      <span style={{ color: '#888', fontSize: '0.85rem', cursor: 'default' }}>
        Sort by: Popularity
      </span>
    </div>
    <div className="hubbub-product-grid">
      {products.map((product) => (
        <div key={product.name} className="hubbub-product-card">
          <div
            className="hubbub-product-image"
            style={{
              height: '140px',
              background: product.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            {product.name}
          </div>
          <div style={{ padding: '12px 14px' }}>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1a1a2e' }}>
              {product.name}
            </div>
            <div style={{ color: '#3d4fe0', fontWeight: 600, fontSize: '0.9rem', margin: '4px 0' }}>
              {product.price}
            </div>
            <div style={{ color: '#888', fontSize: '0.8rem' }}>{product.availability}</div>
          </div>
        </div>
      ))}
    </div>
  </section>
);
