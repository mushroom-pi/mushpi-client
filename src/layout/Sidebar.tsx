import { useState } from 'react';
import { FiActivity, FiHome, FiMenu, FiSettings } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';

import styles from './Sidebar.module.css';

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        <div className={styles.brand}>
          <div className={styles.logo}>🍄</div>
          <div className={styles.title}>MushPi</div>
        </div>

        <nav className={styles.nav}>
          <NavLink to="/" className={({ isActive }) => (isActive ? styles.active : '')}>
            <FiHome /> <span>Dashboard</span>
          </NavLink>
          <NavLink to="/pico-units" className={({ isActive }) => (isActive ? styles.active : '')}>
            <FiActivity /> <span>Pico Units</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? styles.active : '')}>
            <FiSettings /> <span>Settings</span>
          </NavLink>
        </nav>

        <div className={styles.footer}>
          <small>v0.1 • offline</small>
        </div>
      </aside>

      {/* topbar for mobile */}
      <div className={styles.topbar}>
        <button aria-label="menu" onClick={() => setOpen(!open)} className={styles.menuBtn}>
          <FiMenu />
        </button>
        <div className={styles.topTitle}>MushPi</div>
      </div>

      {/* backdrop when sidebar open on mobile */}
      {open && <div className={styles.backdrop} onClick={() => setOpen(false)} />}
    </>
  );
}
