import { perks } from './mockData';

export const HubbubPerks = () => (
  <section
    className="hubbub-gradient"
    style={{ padding: '48px 32px' }}
  >
    <h2
      style={{
        textAlign: 'center',
        fontSize: '1.5rem',
        color: '#fff',
        marginBottom: '32px',
      }}
    >
      Why Hubbub?
    </h2>
    <div className="hubbub-perks-grid">
      {perks.map((perk) => (
        <div key={perk.title} style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{perk.icon}</div>
          <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '6px' }}>
            {perk.title}
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.85, lineHeight: 1.5 }}>
            {perk.description}
          </div>
        </div>
      ))}
    </div>
  </section>
);
