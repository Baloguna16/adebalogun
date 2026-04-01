import './DonatePage.css';

export const DonatePage = () => {
  const handleReveal = () => {
    // Will be implemented in Task 5
  };

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

      {/* Campaign Body */}
      <div className="gfm-body">
        <div className="gfm-content">
          {/* Left Column */}
          <div className="gfm-main">
            <h1 className="gfm-title">Help Ade Replace His Destroyed 3D Printer</h1>

            <div className="gfm-hero">
              <img src="/images/melted-printer.jpg" alt="Destroyed 3D printer with melted filament" className="gfm-hero-img" />
            </div>

            <div className="gfm-organizer">
              <img src="/images/profile.jpg" alt="Ade Balogun" className="gfm-organizer-img" />
              <div className="gfm-organizer-info">
                <span className="gfm-organizer-name">Ade Balogun</span> is organizing this fundraiser
              </div>
            </div>

            <hr className="gfm-divider" />

            <div className="gfm-story">
              <p>I never thought I'd be making one of these but here we are.</p>
              <p>A few weeks ago my 3D printer completely self-destructed in the middle of a print. I came back to find melted plastic everywhere — it fused together into a giant mess and basically destroyed the whole machine from the inside out. I tried fixing it myself which only made things worse and cost me even more money in parts that didn't help.</p>
              <p>The repair guy took one look at it and said it's done. Between the printer itself, all the materials I've wasted, and the parts I bought trying to fix it, I'm over $800 in the hole. I was saving up for a new one but I'm not even close.</p>
              <p>3D printing is my favorite hobby and honestly one of the things that keeps me sane. I was in the middle of making gifts for friends when this happened which makes it even worse.</p>
              <p>Anything helps — even just sharing this. Thank you.</p>
            </div>

            <hr className="gfm-divider" />

            <div className="gfm-reactions">
              <span className="gfm-reaction">💚</span>
              <span className="gfm-reaction">😢</span>
              <span className="gfm-reaction">🙏</span>
              <span className="gfm-reaction-count">8</span>
            </div>

            <div className="gfm-protection">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#274A34">
                <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z"/>
              </svg>
              <span className="gfm-protection-text">Donation protected</span>
            </div>
          </div>

          {/* Right Column — Sidebar */}
          <div className="gfm-sidebar">
            <div className="gfm-donation-card">
              <div className="gfm-raised">
                <span className="gfm-raised-amount">$150 raised</span>
                <span className="gfm-raised-goal"> of $1,200</span>
              </div>

              <div className="gfm-progress-track">
                <div className="gfm-progress-fill" style={{ width: '12.5%' }} />
              </div>

              <div className="gfm-donation-count">6 donations</div>

              <button className="gfm-share-btn" onClick={handleReveal}>Share</button>
              <button className="gfm-donate-btn" onClick={handleReveal}>Donate now</button>

              <div className="gfm-donor-list">
                <div className="gfm-donor-list-header">Recent donations</div>

                <div className="gfm-donor">
                  <div className="gfm-donor-avatar">J</div>
                  <div className="gfm-donor-info">
                    <div className="gfm-donor-name">Jake</div>
                    <div className="gfm-donor-detail"><span className="gfm-donor-amount">$50</span> · 2 hrs</div>
                  </div>
                  <div className="gfm-donor-comment">"Get back to printing bro"</div>
                </div>

                <div className="gfm-donor">
                  <div className="gfm-donor-avatar">F</div>
                  <div className="gfm-donor-info">
                    <div className="gfm-donor-name">Femi</div>
                    <div className="gfm-donor-detail"><span className="gfm-donor-amount">$40</span> · 5 hrs</div>
                  </div>
                  <div className="gfm-donor-comment">"This is so sad lol"</div>
                </div>

                <div className="gfm-donor">
                  <div className="gfm-donor-avatar">S</div>
                  <div className="gfm-donor-info">
                    <div className="gfm-donor-name">Sean</div>
                    <div className="gfm-donor-detail"><span className="gfm-donor-amount">$25</span> · 8 hrs</div>
                  </div>
                </div>

                <div className="gfm-donor">
                  <div className="gfm-donor-avatar">H</div>
                  <div className="gfm-donor-info">
                    <div className="gfm-donor-name">Hugh Jazz</div>
                    <div className="gfm-donor-detail"><span className="gfm-donor-amount">$20</span> · 12 hrs</div>
                  </div>
                  <div className="gfm-donor-comment">"Stay strong man"</div>
                </div>

                <div className="gfm-donor">
                  <div className="gfm-donor-avatar">A</div>
                  <div className="gfm-donor-info">
                    <div className="gfm-donor-name">Anonymous</div>
                    <div className="gfm-donor-detail"><span className="gfm-donor-amount">$15</span> · 1 day</div>
                  </div>
                </div>

                <div className="gfm-donor">
                  <div className="gfm-donor-avatar">L</div>
                  <div className="gfm-donor-info">
                    <div className="gfm-donor-name">Lisa Chen</div>
                    <div className="gfm-donor-detail"><span className="gfm-donor-amount">$10</span> · 1 day</div>
                  </div>
                  <div className="gfm-donor-comment">"Hope this helps!"</div>
                </div>
              </div>

              <div className="gfm-card-footer">
                <div className="gfm-card-meta">Creative Projects</div>
                <div className="gfm-card-meta">Created 2 days ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
