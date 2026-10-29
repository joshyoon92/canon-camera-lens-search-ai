const NAV = ["Cameras", "Lenses", "Printers", "Video & Cinema", "Supplies", "Support"];

export function Header({ onSearchClick }: { onSearchClick: () => void }) {
  return (
    <>
      <div className="topbar">
        Concept prototype · Prices from usa.canon.com as of Oct 20, 2026
      </div>
      <header className="header">
        <div className="header__inner">
          <a href="#" className="wordmark" aria-label="Home">Canon<span>search</span></a>
          <nav className="nav" aria-label="Main">
            {NAV.map(item => <a key={item} href="#">{item}</a>)}
          </nav>
          <div className="header__actions">
            <button className="icon-btn" onClick={onSearchClick} aria-label="Ask what you're looking for">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            </button>
            <a className="icon-btn" href="#" aria-label="Account">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
            </a>
            <a className="icon-btn" href="#" aria-label="Cart">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.4 11h11l2-8H6.3" /><circle cx="9" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" /></svg>
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
