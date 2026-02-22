const footerColumns = [
  { heading: 'Company', links: ['About', 'Blog', 'Careers'] },
  { heading: 'Support', links: ['Help Center', 'Safety', 'Contact'] },
  { heading: 'Legal', links: ['Terms', 'Privacy', 'Cookies'] },
];

export const HubbubFooter = () => (
  <footer style={{ background: '#111', padding: '40px 32px 24px', color: '#fff' }}>
    <div className="hubbub-footer-inner">
      <div>
        <div
          style={{
            fontFamily: 'Roboto Slab, serif',
            fontSize: '1.25rem',
            fontWeight: 700,
            letterSpacing: '2px',
            marginBottom: '8px',
          }}
        >
          HUBBUB
        </div>
        <div style={{ color: '#888', fontSize: '0.8rem' }}>Rent smarter. Waste less.</div>
      </div>
      {footerColumns.map((col) => (
        <div key={col.heading}>
          <div style={{ fontWeight: 600, marginBottom: '10px', fontSize: '0.9rem' }}>
            {col.heading}
          </div>
          {col.links.map((link) => (
            <div
              key={link}
              style={{
                color: '#69b6e7',
                fontSize: '0.85rem',
                marginBottom: '6px',
                cursor: 'default',
              }}
            >
              {link}
            </div>
          ))}
        </div>
      ))}
    </div>
    <div
      style={{
        textAlign: 'center',
        color: '#555',
        fontSize: '0.75rem',
        marginTop: '32px',
        borderTop: '1px solid #222',
        paddingTop: '16px',
      }}
    >
      &copy; 2022 Hubbub Inc. All rights reserved.
    </div>
  </footer>
);
