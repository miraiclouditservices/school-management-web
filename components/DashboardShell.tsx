'use client';
import React, { useEffect, useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout, getUser, getAcademicYear } from '../lib/api';
import { MENUS, QUICK_LINKS } from '../lib/constants';

interface DashboardShellProps {
  children: ReactNode;
  role: string;
  hideSidebar?: boolean;
  hideTopBar?: boolean;
}

export default function DashboardShell({ children, role, hideSidebar, hideTopBar }: DashboardShellProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [academicYear, setAY] = useState('2024 - 2025');

  useEffect(() => {
    setUser(getUser());
    const ay = getAcademicYear();
    if (ay) setAY(ay);
  }, []);

  const menu = MENUS[role] || MENUS.admin;

  return (
    <div className={`ds-container ${hideSidebar ? 'sidebar-hidden' : ''} ${hideTopBar ? 'topbar-hidden' : ''}`}>
      {/* Sidebar */}
      {!hideSidebar && (
        <aside className="ds-sidebar">
        <div className="ds-sidebar-header">
          <div className="ds-brand">
            <div className="ds-logo-sq">
              {user?.schoolName?.[0] || 'S'}
            </div>
            <div className="brand-info">
              <h6 className="ds-school-name">{user?.schoolName || 'Sunrise Public School'}</h6>
              <span className="ds-tagline">{role?.toUpperCase()} PORTAL</span>
            </div>
          </div>
        </div>

        <nav className="ds-nav">
          <div className="ds-menu-section">
            <div className="ds-section-title">Main Menu</div>
            {menu.map(m => (
              <Link key={m.href} href={m.href} className={`ds-nav-item ${pathname === m.href ? 'active' : ''}`}>
                <div className="ds-nav-icon" style={{ color: pathname === m.href ? '#fff' : m.color }}>
                  <i className={`bi ${m.icon}`} />
                </div>
                <span className="nav-label">{m.label}</span>
              </Link>
            ))}
          </div>

        </nav>
      </aside>
      )}

      {/* Main Page Area */}
      <div className="ds-main">
        {!hideTopBar && (
          <header className="ds-header shadow-sm">
            <div className="header-left">
              <div className="menu-toggle d-lg-none me-3"><i className="bi bi-list fs-4" /></div>
              <div className="ds-search-bar">
                <i className="bi bi-search text-muted" />
                <input type="text" placeholder="Search students, classes, timetable..." />
                <span className="ds-search-shortcut">⌘K</span>
              </div>
            </div>

            <div className="ds-header-right">
              
              <div className="dropdown">
                <div className="ds-user-profile" data-bs-toggle="dropdown" style={{ cursor: 'pointer' }}>
                  <div className="ds-user-text d-none d-sm-block text-end">
                    <div className="ds-user-name fw-bold">{user?.name || 'Loading...'}</div>
                    <div className="ds-user-role small text-muted text-uppercase">{role}</div>
                  </div>
                  <div className="ds-user-avatar ms-3">
                    {user?.name?.[0] || 'U'}
                  </div>
                </div>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                  <li><Link className="dropdown-item py-2" href={`/${role}/settings`}><i className="bi bi-gear me-2" />Settings</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item py-2 text-danger" onClick={logout}><i className="bi bi-box-arrow-right me-2" />Logout Account</button></li>
                </ul>
              </div>
            </div>
          </header>
        )}

        <main className={`ds-content ${hideTopBar ? 'pt-0' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
