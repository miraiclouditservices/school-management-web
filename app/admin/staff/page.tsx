'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '../../../components/DashboardShell';
import { 
  StatCard, StatusBadge, Pagination, 
  LoadingSpinner, FilterBar 
} from '../../../components/UIComponents';
import api from '../../../lib/api';
import { formatDate } from '../../../lib/constants';

interface StaffRecord {
  _id: string;
  staffId: string;
  name: string;
  department: string;
  designation: string;
  phone: string;
  email: string;
  status: string;
  joiningDate: string;
}

export default function StaffManagementPage() {
  const router = useRouter();
  const [data, setData] = useState<StaffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [stats, setStats] = useState<any>({ total: 0, teaching: 0, active: 0 });
  const [filters, setFilters] = useState({ department: '', status: '', search: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [staffRes, statsRes] = await Promise.all([
        api.get<StaffRecord[]>('/staff', { 
          page, 
          limit: 12,
          search: filters.search,
          searchFields: 'name,staffId,phone',
          department: filters.department,
          status: filters.status
        }),
        api.get<any>('/staff/stats')
      ]);
      setData(staffRes.data);
      setPages(staffRes.pages || 1);
      if (statsRes.success) setStats(statsRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page]);

  const handleApplyFilters = () => { setPage(1); load(); };
  const handleResetFilters = () => { setFilters({ department: '', status: '', search: '' }); setPage(1); load(); };

  return (
    <DashboardShell role="admin">
      {/* PROFESSIONAL HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-800 mb-0">Staff Management</h4>
          <p className="text-muted extra-small fw-bold mb-0 text-uppercase opacity-75">Human Resource & Academic Personnel</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-white btn-sm px-3 rounded-pill premium-shadow border-0 extra-small fw-bold" onClick={() => window.print()}><i className="bi bi-printer me-1"/>Print Registry</button>
          <button className="btn btn-primary btn-sm px-4 rounded-pill premium-shadow border-0 extra-small fw-800" onClick={() => router.push('/admin/staff/add')}><i className="bi bi-plus-lg me-1"/>Add Staff Member</button>
        </div>
      </div>

      {/* COMPACT STATS - HORIZONTAL */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Personnel', value: stats.total, color: 'primary', icon: 'bi-people' },
          { label: 'Teaching Faculty', value: stats.teaching, color: 'success', icon: 'bi-mortarboard' },
          { label: 'Active Status', value: stats.active, color: 'info', icon: 'bi-person-check' },
          { label: 'On Leave', value: stats.onLeave || 0, color: 'warning', icon: 'bi-calendar-event' }
        ].map((s, i) => (
          <div key={i} className="col-md-3 col-6">
            <StatCard horizontal={true} icon={s.icon} iconBg={`rgba(var(--bs-${s.color}-rgb), 0.1)`} label={s.label} value={s.value} />
          </div>
        ))}
      </div>

      {/* DYNAMIC FILTERS */}
      <div className="card border-0 premium-shadow rounded-4 bg-white mb-4">
        <div className="card-body p-3">
           <div className="row g-3 align-items-end">
              <div className="col-md-4">
                 <label className="info-label">Search Personnel</label>
                 <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-0"><i className="bi bi-search"/></span>
                    <input className="form-control border-0 bg-light extra-small" placeholder="Name, ID or Phone..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
                 </div>
              </div>
              <div className="col-md-3">
                 <label className="info-label">Department</label>
                 <select className="form-select form-select-sm border-0 bg-light extra-small fw-bold" value={filters.department} onChange={e => setFilters({...filters, department: e.target.value})}>
                    <option value="">All Departments</option>
                    {['Teaching', 'Administration', 'Accounts', 'Transport', 'Housekeeping', 'Security'].map(d => <option key={d} value={d}>{d}</option>)}
                 </select>
              </div>
              <div className="col-md-3">
                 <label className="info-label">Current Status</label>
                 <select className="form-select form-select-sm border-0 bg-light extra-small fw-bold" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
                    <option value="">All Statuses</option>
                    <option>Active</option><option>On Leave</option><option>Inactive</option><option>Resigned</option>
                 </select>
              </div>
              <div className="col-md-2 d-flex gap-2">
                 <button className="btn btn-primary btn-sm flex-grow-1 rounded-3 extra-small fw-bold shadow-sm" onClick={handleApplyFilters}>Filter</button>
                 <button className="btn btn-light btn-sm rounded-3 extra-small fw-bold" onClick={handleResetFilters}><i className="bi bi-arrow-counterclockwise"/></button>
              </div>
           </div>
        </div>
      </div>

      {/* HIGH DENSITY TABLE */}
      <div className="card border-0 premium-shadow rounded-4 bg-white overflow-hidden mb-4">
        <div className="table-responsive">
           <table className="table table-hover align-middle mb-0">
              <thead className="bg-light-subtle">
                 <tr>
                    <th className="info-label border-0 ps-4 py-3">Staff Identity</th>
                    <th className="info-label border-0 py-3">Dept / Designation</th>
                    <th className="info-label border-0 py-3">Contact Detail</th>
                    <th className="info-label border-0 py-3">Joining Date</th>
                    <th className="info-label border-0 py-3 text-center">Status</th>
                    <th className="info-label border-0 pe-4 py-3 text-end">Actions</th>
                 </tr>
              </thead>
              <tbody>
                 {loading ? (
                    <tr><td colSpan={6} className="text-center py-5"><LoadingSpinner /></td></tr>
                 ) : data.length > 0 ? data.map(r => (
                    <tr key={r._id}>
                       <td className="ps-4">
                          <div className="d-flex align-items-center gap-3">
                             <div className="ds-user-avatar shadow-sm overflow-hidden" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                                {r.photo ? (
                                   <img src={r.photo} alt={r.name} className="w-100 h-100 object-fit-cover" />
                                ) : (
                                   (r.name || 'S')[0]
                                )}
                             </div>
                             <div>
                                <div className="fw-800 text-dark extra-small">{r.name}</div>
                                <div className="text-muted fw-bold" style={{ fontSize: '0.6rem' }}>ID: {r.staffId}</div>
                             </div>
                          </div>
                       </td>
                       <td>
                          <div className="extra-small fw-800 text-dark">{r.department}</div>
                          <div className="text-muted fw-bold" style={{ fontSize: '0.6rem' }}>{r.designation}</div>
                       </td>
                       <td>
                          <div className="extra-small text-dark fw-bold"><i className="bi bi-telephone me-1 opacity-50"/>{r.phone}</div>
                          <div className="extra-small text-primary opacity-75 fw-bold" style={{ fontSize: '0.6rem' }}>{r.email}</div>
                       </td>
                       <td><span className="extra-small fw-bold text-muted">{formatDate(r.joiningDate)}</span></td>
                       <td className="text-center"><StatusBadge status={r.status} /></td>
                       <td className="pe-4 text-end">
                          <div className="d-flex gap-1 justify-content-end">
                             <button className="btn btn-sm btn-light p-1 px-2 rounded-2 border-0" title="View Case File" onClick={() => router.push(`/admin/staff/${r._id}`)}><i className="bi bi-eye text-primary small"/></button>
                             <button className="btn btn-sm btn-light p-1 px-2 rounded-2 border-0" title="Payroll" onClick={() => {}}><i className="bi bi-cash text-success small"/></button>
                          </div>
                       </td>
                    </tr>
                 )) : (
                    <tr><td colSpan={6} className="text-center py-5 text-muted extra-small fw-bold">No staff records found in the registry.</td></tr>
                 )}
              </tbody>
           </table>
        </div>
        <div className="p-3 border-top d-flex justify-content-between align-items-center bg-light-subtle">
           <span className="text-muted extra-small fw-bold opacity-75">Records Found: {stats.total} | Page {page}</span>
           <Pagination page={page} pages={pages} onPageChange={setPage} />
        </div>
      </div>

      <style jsx>{`
        .extra-small { font-size: 0.65rem; }
        .info-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 2px; }
        .btn-white { background: #fff; border: 1px solid #f1f5f9; }
        .premium-shadow { box-shadow: 0 5px 20px -5px rgba(0, 0, 0, 0.05) !important; }
      `}</style>
    </DashboardShell>
  );
}
