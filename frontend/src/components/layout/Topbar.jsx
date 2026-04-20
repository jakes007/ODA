import logo from '../../assets/oda-logo.png';

export default function Topbar({ onMenuClick }) {
  return (
    <header className="topbar">
      <div className="topbar-row">
        <div className="topbar-brand">
          <img src={logo} alt="ODA Logo" className="topbar-logo" />
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