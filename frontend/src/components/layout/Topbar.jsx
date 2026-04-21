import logo from '../../assets/oda-logo.png';

export default function Topbar({ onMenuClick }) {
  return (
    <header className="topbar">
      <div className="topbar-row">
      <div className="topbar-brand">
  <img src={logo} alt="ODA Logo" className="topbar-logo" />

  <div className="topbar-motto">
    <span className="topbar-divider" />
    <span className="topbar-motto-text">"The Home of Champions"</span>
  </div>
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