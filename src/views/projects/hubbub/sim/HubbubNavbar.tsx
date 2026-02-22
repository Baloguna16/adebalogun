export const HubbubNavbar = () => (
  <nav
    className="hubbub-gradient"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 32px',
    }}
  >
    <span
      style={{
        color: '#fff',
        fontSize: '1.5rem',
        fontWeight: 700,
        fontFamily: 'Roboto Slab, serif',
        letterSpacing: '2px',
      }}
    >
      HUBBUB
    </span>
    <div className="hubbub-nav-links">
      {['Browse', 'How It Works', 'List an Item', 'Log In'].map((item) => (
        <span
          key={item}
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'default',
          }}
        >
          {item}
        </span>
      ))}
    </div>
    <span className="hubbub-nav-hamburger">&#9776;</span>
  </nav>
);
