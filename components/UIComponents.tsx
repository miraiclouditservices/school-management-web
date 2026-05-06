'use client';
import React, { ReactNode, FormEvent } from 'react';
import { STATUS_COLORS } from '../lib/constants';

interface StatCardProps {
  icon: string;
  iconBg?: string;
  label: string;
  value: string | number;
  sub?: string;
  onClick?: () => void;
  trend?: number;
  horizontal?: boolean;
}

export function StatCard({ icon, iconBg, label, value, sub, onClick, trend, horizontal }: StatCardProps) {
  const accentColor = iconBg || '#3b82f6';

  if (horizontal) {
    return (
      <div className="card ds-stat-card border-0 shadow-sm h-100 hover-lift animate-fade-in" onClick={onClick} 
        style={{ 
          cursor: onClick ? 'pointer' : 'default', 
          borderRadius: '24px', 
          background: '#ffffff',
          position: 'relative',
          border: '1px solid #f1f5f9 !important'
        }}>
        <div className="card-body p-3 d-flex align-items-center gap-2">
          <div className="overflow-hidden flex-grow-1">
            <div className="d-flex justify-content-between align-items-center">
              <div className="fw-900 text-dark" style={{ fontSize: '1.6rem', letterSpacing: '-0.06em', lineHeight: '1', fontFamily: 'Outfit' }}>{value}</div>
              {trend !== undefined && (
                <div className="trend-pill px-2 py-1 rounded-pill" style={{ 
                  fontSize: '0.65rem', 
                  background: trend > 0 ? '#dcfce7' : '#fee2e2', 
                  color: trend > 0 ? '#059669' : '#dc2626',
                  fontWeight: '900'
                }}>
                  {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </div>
              )}
            </div>
            <div className="text-muted fw-900 uppercase opacity-60 mt-1" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>{label}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card ds-stat-card border-0 shadow-sm h-100 hover-lift animate-fade-in" onClick={onClick} 
      style={{ 
        cursor: onClick ? 'pointer' : 'default', 
        borderRadius: '24px', 
        background: '#ffffff',
        border: '1px solid #f1f5f9 !important'
      }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-end mb-3">
          {trend !== undefined && (
            <div className={`trend-badge px-3 py-1 rounded-pill fw-900 d-flex align-items-center gap-1 shadow-sm`} 
              style={{ fontSize: '0.7rem', background: trend > 0 ? '#dcfce7' : '#fee2e2', color: trend > 0 ? '#059669' : '#dc2626' }}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div>
          <div className="text-muted fw-900 uppercase mb-2 opacity-50" style={{ fontSize: '0.7rem', letterSpacing: '0.12em' }}>{label}</div>
          <div className="fw-900 text-dark" style={{ fontSize: '2.6rem', letterSpacing: '-0.07em', lineHeight: '0.9', fontFamily: 'Outfit' }}>{value}</div>
          {sub && <div className="text-muted mt-3 fw-bold opacity-60 extra-small" style={{ letterSpacing: '0.02em' }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}


export function StatusBadge({ status }: { status: string }) {
  const statusConfig: any = {
    'Present': { bg: '#dcfce7', text: '#059669', icon: 'bi-check-circle-fill' },
    'Absent': { bg: '#fee2e2', text: '#dc2626', icon: 'bi-x-circle-fill' },
    'Late': { bg: '#fffbeb', text: '#d97706', icon: 'bi-clock-fill' },
    'Leave': { bg: '#eff6ff', text: '#2563eb', icon: 'bi-info-circle-fill' },
    'Pending': { bg: '#f1f5f9', text: '#64748b', icon: 'bi-dash-circle-fill' },
    'Approved': { bg: '#dcfce7', text: '#059669', icon: 'bi-patch-check-fill' },
    'Rejected': { bg: '#fee2e2', text: '#dc2626', icon: 'bi-patch-exclamation-fill' }
  };
  
  const config = statusConfig[status] || { bg: '#f1f5f9', text: '#64748b', icon: 'bi-circle' };
  
  return (
    <span className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill fw-900 uppercase shadow-sm border border-white" style={{
      background: config.bg,
      color: config.text,
      fontSize: '0.65rem',
      letterSpacing: '0.04em'
    }}>
      <i className={`bi ${config.icon}`} style={{ fontSize: '0.8rem' }} />
      {status}
    </span>
  );
}

interface PaginationProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pages, onPageChange }: PaginationProps) {
  if (pages <= 1) return null;
  return (
    <nav><ul className="pagination pagination-sm mb-0 gap-1">
      <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
        <button className="page-link border-0 rounded-3 shadow-sm" onClick={() => onPageChange(page - 1)}>
          <i className="bi bi-chevron-left" />
        </button>
      </li>
      {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
        <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
          <button className="page-link border-0 rounded-3 shadow-sm mx-1" onClick={() => onPageChange(p)} style={p === page ? { background: '#3b82f6' } : {}}>{p}</button>
        </li>
      ))}
      <li className={`page-item ${page >= pages ? 'disabled' : ''}`}>
        <button className="page-link border-0 rounded-3 shadow-sm" onClick={() => onPageChange(page + 1)}>
          <i className="bi bi-chevron-right" />
        </button>
      </li>
    </ul></nav>
  );
}

interface DataTableProps {
  columns: Array<{ key: string, label: string, render?: (row: any) => ReactNode }>;
  data: any[];
  onRowClick?: (row: any) => void;
  actions?: (row: any) => ReactNode;
  loading?: boolean;
}

export function DataTable({ columns, data, onRowClick, actions, loading }: DataTableProps) {
  return (
    <div className="ds-table-wrap">
      <table className="ds-table">
        <thead>
          <tr>
            {columns.map(c => <th key={c.key}>{c.label}</th>)}
            {actions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-5"><LoadingSpinner full={false} size="sm" /></td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-5 text-muted">No records found</td></tr>
          ) : (
            data.map((row, i) => (
              <tr key={row._id || i} onClick={() => onRowClick?.(row)} style={{ cursor: onRowClick ? 'pointer' : 'default' }}>
                {columns.map(c => <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>)}
                {actions && <td onClick={e => e.stopPropagation()}>{actions(row)}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

interface FormModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit: (e: FormEvent) => void;
  loading?: boolean;
}

export function FormModal({ show, onClose, title, children, onSubmit, loading }: FormModalProps) {
  if (!show) return null;
  return (
    <div className="modal show d-block" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" style={{ maxHeight: 'calc(100vh - 40px)' }}>
        <form onSubmit={onSubmit} className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
          <div className="modal-header border-0 px-4 pt-4">
            <h5 className="modal-title fw-bold">{title}</h5>
            <button type="button" className="btn-close shadow-none" onClick={onClose} />
          </div>
          <div className="modal-body px-4 py-3" style={{ overflowY: 'auto' }}>
            {children}
          </div>
          <div className="modal-footer border-0 px-4 pb-4">
            <button type="button" className="btn btn-light px-4 fw-semibold" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-brand px-4 fw-semibold" disabled={loading}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" /> Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function WelcomeHeader({ name }: { name: string }) {
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
  return (
    <div className="d-flex justify-content-between align-items-center mb-5">
      <div>
        <h2 className="fw-800 text-dark mb-1" style={{ letterSpacing: '-0.03em' }}>Welcome Back, {name} 👋</h2>
        <p className="text-muted fw-medium mb-0">Here's what's happening today.</p>
      </div>
      <div className="d-none d-md-flex align-items-center gap-2 bg-white px-3 py-2 rounded-3 shadow-sm border border-light">
        <i className="bi bi-calendar3 text-primary"></i>
        <span className="small fw-bold text-secondary">{date}</span>
      </div>
    </div>
  );
}

export function DashboardCard({ title, children, actions, fullWidth }: { title: string, children: ReactNode, actions?: ReactNode, fullWidth?: boolean }) {
  return (
    <div className={`card border-0 shadow-sm rounded-4 overflow-hidden mb-4 ${fullWidth ? 'w-100' : ''}`} style={{ border: '1px solid #f1f5f9 !important' }}>
      <div className="card-header bg-white border-0 py-4 px-4 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-800" style={{ letterSpacing: '-0.01em' }}>{title}</h5>
        {actions}
      </div>
      <div className="card-body p-0">
        {children}
      </div>
    </div>
  );
}

export function TaskItem({ title, subtitle, date, status, icon, iconBg }: { title: string, subtitle: string, date?: string, status: string, icon: string, iconBg: string }) {
  return (
    <div className="d-flex align-items-center p-3 ds-item-hover border-bottom border-light cursor-pointer">
      <div className="rounded-3 p-2 me-3 d-flex align-items-center justify-content-center" style={{ background: iconBg, width: '40px', height: '40px' }}>
        <i className={`bi ${icon} text-dark opacity-75`}></i>
      </div>
      <div className="flex-grow-1">
        <div className="fw-bold text-dark small">{title}</div>
        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{subtitle}</div>
        {date && <div className="text-danger mt-1 fw-semibold" style={{ fontSize: '0.7rem' }}>Due: {date}</div>}
      </div>
      <div className="text-end">
        <span className="badge rounded-pill bg-primary-subtle text-primary small fw-bold px-3 py-1" style={{ fontSize: '0.65rem' }}>{status}</span>
        <div className="text-muted mt-1"><i className="bi bi-three-dots-vertical"></i></div>
      </div>
    </div>
  );
}

export function SidebarWidget({ title, children, action }: { title: string, children: ReactNode, action?: ReactNode }) {
  return (
    <div className="ds-widget">
      <div className="ds-widget-title">
        <span>{title}</span>
        {action}
      </div>
      <div className="ds-widget-content">
        {children}
      </div>
    </div>
  );
}

export function MiniItem({ icon, iconBg, name, sub, color }: { icon: string, iconBg?: string, name: string, sub: string, color?: string }) {
  return (
    <div className="ds-mini-item">
      <div className="ds-mini-icon" style={{ background: iconBg || '#f1f5f9', color: color || '#1e293b' }}>
        <i className={`bi ${icon}`} />
      </div>
      <div className="ds-mini-info">
        <div className="ds-mini-name">{name}</div>
        <div className="ds-mini-sub">{sub}</div>
      </div>
    </div>
  );
}

export function FilterBar({ children, onReset, onApply }: { children: ReactNode, onReset: () => void, onApply: () => void }) {
  return (
    <div className="ds-filter-bar shadow-sm">
      {children}
      <div className="ms-auto d-flex gap-2">
        <button className="btn btn-light btn-sm fw-bold px-3" onClick={onReset}><i className="bi bi-arrow-counterclockwise me-1"/>Reset</button>
        <button className="btn btn-primary btn-sm fw-bold px-3" onClick={onApply}><i className="bi bi-funnel me-1"/>Apply Filters</button>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size, full }: { size?: 'sm' | 'md' | 'lg', full?: boolean }) {
  const s = size === 'sm' ? '1.5rem' : size === 'lg' ? '4rem' : '3rem';
  return (
    <div className={`text-center ${full === false ? '' : 'py-5'}`}>
      <div className="spinner-grow text-primary" style={{ width: s, height: s }} />
      {full !== false && <p className="text-muted mt-3 fw-medium">Preparing your data...</p>}
    </div>
  );
}

export function ConfirmDialog({ show, onClose, onConfirm, title = 'Confirm Action', message }: { show: boolean, onClose: () => void, onConfirm: () => void, title?: string, message: string }) {
  if (!show) return null;
  return (
    <div className="modal show d-block" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
          <div className="modal-header border-0 px-4 pt-4">
            <h5 className="modal-title fw-bold">{title}</h5>
            <button className="btn-close shadow-none" onClick={onClose} />
          </div>
          <div className="modal-body px-4 py-3">
            <p className="text-muted">{message}</p>
          </div>
          <div className="modal-footer border-0 px-4 pb-4">
            <button type="button" className="btn btn-light px-4 fw-semibold" onClick={onClose}>Cancel</button>
            <button type="button" className="btn btn-danger px-4 fw-semibold" onClick={onConfirm}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  );
}
