export const HubbubHero = () => (
  <section
    style={{
      background: '#e8f4fc',
      padding: '64px 32px',
      textAlign: 'center',
    }}
  >
    <h1 style={{ fontSize: '2.25rem', color: '#1a1a2e', marginBottom: '12px' }}>
      Rent Anything on Hubbub
    </h1>
    <p style={{ color: '#555', fontSize: '1.1rem', marginBottom: '32px' }}>
      The marketplace for students to rent what they need and save.
    </p>
    <div
      style={{
        maxWidth: '480px',
        margin: '0 auto',
        display: 'flex',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
      }}
    >
      <div
        style={{
          flex: 1,
          padding: '12px 16px',
          background: '#fff',
          color: '#999',
          textAlign: 'left',
          fontSize: '0.95rem',
        }}
      >
        Search for items...
      </div>
      <div
        style={{
          padding: '12px 24px',
          background: '#3d4fe0',
          color: '#fff',
          fontWeight: 600,
          fontSize: '0.95rem',
          cursor: 'default',
        }}
      >
        Search
      </div>
    </div>
  </section>
);
