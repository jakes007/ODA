import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const menuItems = [
  { to: '/', label: 'Home' },
  { to: '/competition/standings', label: 'Standings' },
  { to: '/competition/rankings', label: 'Rankings' },
  { to: '/competition/fixtures', label: 'Fixtures' },
  { to: '/player/player_jason', label: 'Players' }
];

export default function MobileFloatingMenu({ hidden = false }) {
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  if (hidden) {
    return null;
  }
  
  return (
    <div className={`mobile-floating-menu ${open ? 'open' : ''}`}>
      {open && (
        <nav className="mobile-floating-menu-panel">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={closeMenu}
              className={({ isActive }) =>
                `mobile-floating-menu-link${isActive ? ' active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}

      <button
        type="button"
        className="mobile-floating-menu-btn"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? 'Close' : 'Menu'}
      </button>
    </div>
  );
}