export default function Topbar({ onMenuClick }) {
  return (
    <header className="topbar">
      <div className="topbar-row">
        <div>
          <h1 className="topbar-title">Observatory Darts Association</h1>
          <p className="topbar-subtitle">Competition Management Platform</p>
        </div>

        <button
          className="mobile-menu-btn"
          onClick={onMenuClick}
          aria-label="Open navigation"
          type="button"
        >
          ☰
        </button>
      </div>
    </header>
  );
}