import './DonatePage.css';

export const DonatePage = () => {
  return (
    <div className="gfm-page">
      {/* Top Nav */}
      <nav className="gfm-nav">
        <div className="gfm-nav-inner">
          <div className="gfm-nav-left">
            <svg className="gfm-logo" viewBox="0 0 24 24" width="28" height="28" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#274A34"/>
              <path d="M15.5 11H13v-2.5c0-.28-.22-.5-.5-.5h-1c-.28 0-.5.22-.5.5V11H8.5c-.28 0-.5.22-.5.5v1c0 .28.22.5.5.5H11v2.5c0 .28.22.5.5.5h1c.28 0 .5-.22.5-.5V13h2.5c.28 0 .5-.22.5-.5v-1c0-.28-.22-.5-.5-.5z" fill="#CCF88E"/>
            </svg>
            <span className="gfm-wordmark">GoFundMe</span>
          </div>
          <div className="gfm-nav-center">
            <div className="gfm-search-bar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span className="gfm-search-text">Search fundraisers</span>
            </div>
          </div>
          <div className="gfm-nav-right">
            <span className="gfm-nav-link">Donate</span>
            <span className="gfm-nav-link">Fundraise</span>
            <span className="gfm-nav-link">About</span>
            <span className="gfm-nav-link">Sign in</span>
            <button className="gfm-nav-start-btn">Start a GoFundMe</button>
          </div>
        </div>
      </nav>

      {/* Page body placeholder */}
      <div className="gfm-body">
        <p>Campaign content goes here</p>
      </div>
    </div>
  );
};
