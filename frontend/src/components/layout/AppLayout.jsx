import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const openMobileNav = () => setMobileNavOpen(true);
  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="app-shell">
      <Sidebar />
      <Sidebar mobile isOpen={mobileNavOpen} onClose={closeMobileNav} />

      {mobileNavOpen ? (
        <button
          className="mobile-nav-backdrop"
          onClick={closeMobileNav}
          aria-label="Close navigation overlay"
        />
      ) : null}

      <div className="app-main">
        <Topbar onMenuClick={openMobileNav} />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}