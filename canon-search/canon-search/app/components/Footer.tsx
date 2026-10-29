const COLUMNS = [
  { title: "Shop", links: ["Cameras", "Lenses", "Printers", "Video & Cinema", "Refurbished"] },
  { title: "Support", links: ["Product support", "Order status", "Returns", "Contact us"] },
  { title: "Explore", links: ["Learn photography", "Creator stories", "Events"] },
  { title: "About", links: ["About this concept", "Privacy", "Accessibility"] },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__giant" aria-hidden="true">Canon</div>
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="wordmark wordmark--light">Canon<span>search</span></span>
          <p>An independent concept for AI-assisted camera and lens search.</p>
        </div>
        {COLUMNS.map(col => (
          <nav key={col.title} aria-label={col.title}>
            <h3>{col.title}</h3>
            <ul>{col.links.map(l => <li key={l}><a href="#">{l}</a></li>)}</ul>
          </nav>
        ))}
      </div>
      <p className="footer__legal">
        Not affiliated with or endorsed by Canon Inc. or Canon U.S.A. Product names belong to their owners.
        Specs marked unverified in the catalog should be checked against Canon's product pages.
      </p>
    </footer>
  );
}
