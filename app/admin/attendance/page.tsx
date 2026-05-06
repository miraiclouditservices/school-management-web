'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '../../../components/DashboardShell';
import { 
  StatCard, StatusBadge, LoadingSpinner, Pagination 
} from '../../../components/UIComponents';
import api from '../../../lib/api';
import { CLASSES, SECTIONS } from '../../../lib/constants';

interface AttendanceRecord {
  student: { _id: string; firstName: string; lastName: string; admissionNo: string };
  status: string;
  checkInTime: string;
  checkOutTime: string;
  remarks: string;
}

interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  percentage: number;
  records: AttendanceRecord[];
}

export default function AttendanceMonitoringPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ 
    className: 'Class 7', 
    section: 'B', 
    date: new Date().toISOString().split('T')[0] 
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<AttendanceSummary>('/attendance/summary', filters);
      setSummary(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleApplyFilters = () => { load(); };
  const handleResetFilters = () => { setFilters({ className: 'Class 7', section: 'B', date: new Date().toISOString().split('T')[0] }); load(); };

  return (
    <DashboardShell role="admin">
      {/* PROFESSIONAL HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-800 mb-0">Attendance Monitoring</h4>
          <p className="text-muted extra-small fw-bold mb-0 text-uppercase opacity-75">Daily Presence & Engagement Registry</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-white btn-sm px-3 rounded-pill premium-shadow border-0 extra-small fw-bold" onClick={() => window.print()}><i className="bi bi-file-earmark-pdf me-1"/>Generate Report</button>
          <button className="btn btn-primary btn-sm px-4 rounded-pill premium-shadow border-0 extra-small fw-800" onClick={() => router.push('/admin/attendance/mark')}><i className="bi bi-pencil-square me-1"/>Mark Attendance</button>
        </div>
      </div>

      {/* HORIZONTAL STATUS CARDS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Students', value: summary?.total || 0, color: 'primary', icon: 'bi-people' },
          { label: 'Present', value: summary?.present || 0, color: 'success', icon: 'bi-check-circle' },
          { label: 'Absent', value: summary?.absent || 0, color: 'danger', icon: 'bi-x-circle' },
          { label: 'Attendance', value: `${summary?.percentage || 0}%`, color: 'info', icon: 'bi-graph-up-arrow' }
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
                 <label className="info-label">Monitoring Date</label>
                 <input type="date" className="form-control form-control-sm border-0 bg-light extra-small fw-bold" value={filters.date} onChange={e => setFilters({...filters, date: e.target.value})} />
              </div>
              <div className="col-md-3">
                 <label className="info-label">Class</label>
                 <select className="form-select form-select-sm border-0 bg-light extra-small fw-bold" value={filters.className} onChange={e => setFilters({...filters, className: e.target.value})}>
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
              </div>
              <div className="col-md-3">
                 <label className="info-label">Section</label>
                 <select className="form-select form-select-sm border-0 bg-light extra-small fw-bold" value={filters.section} onChange={e => setFilters({...filters, section: e.target.value})}>
                    {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
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
      <div className="card border-0 premium-shadow rounded-4 bg-white overflow-hidden mb-5">
        <div className="table-responsive">
           <table className="table table-hover align-middle mb-0">
              <thead className="bg-light-subtle">
                 <tr>
                    <th className="info-label border-0 ps-4 py-3">Student Identity</th>
                    <th className="info-label border-0 py-3 text-center">Current Status</th>
                    <th className="info-label border-0 py-3 text-center">Check In</th>
                    <th className="info-label border-0 py-3 text-center">Check Out</th>
                    <th className="info-label border-0 py-3">Remarks / Observations</th>
                    <th className="info-label border-0 pe-4 py-3 text-end">Actions</th>
                 </tr>
              </thead>
              <tbody>
                 {loading ? (
                    <tr><td colSpan={6} className="text-center py-5"><LoadingSpinner /></td></tr>
                 ) : summary?.records && summary.records.length > 0 ? summary.records.map((r, i) => (
                    <tr key={r.student._id || i}>
                       <td className="ps-4">
                          <div className="d-flex align-items-center gap-3">
                             <div className="ds-user-avatar shadow-sm" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>{(r.student.firstName || 'S')[0]}</div>
                             <div>
                                <div className="fw-800 text-dark extra-small">{r.student.firstName} {r.student.lastName}</div>
                                <div className="text-muted fw-bold" style={{ fontSize: '0.6rem' }}>ID: {r.student.admissionNo}</div>
                             </div>
                          </div>
                       </td>
                       <td className="text-center"><StatusBadge status={r.status} /></td>
                       <td className="text-center fw-bold extra-small text-dark">{r.checkInTime || '--:--'}</td>
                       <td className="text-center fw-bold extra-small text-dark">{r.checkOutTime || '--:--'}</td>
                       <td><div className="text-muted extra-small fw-bold truncate" style={{maxWidth:'200px'}}>{r.remarks || 'No specific remarks.'}</div></td>
                       <td className="pe-4 text-end">
                          <button className="btn btn-sm btn-light p-1 px-2 rounded-2 border-0" title="Full Profile" onClick={() => router.push(`/admin/students/${r.student._id}`)}><i className="bi bi-eye text-primary small"/></button>
                       </td>
                    </tr>
                 )) : (
                    <tr><td colSpan={6} className="text-center py-5 text-muted extra-small fw-bold">No attendance records found for this criteria.</td></tr>
                 )}
              </tbody>
           </table>
        </div>
        <div className="p-3 border-top d-flex justify-content-between align-items-center bg-light-subtle">
           <span className="text-muted extra-small fw-bold opacity-75">Students Registered: {summary?.total || 0}</span>
           <div className="d-flex gap-2">
              <button className="btn btn-sm btn-white rounded-3 extra-small fw-bold border shadow-sm px-3" onClick={() => {}}><i className="bi bi-envelope me-1 text-primary"/>Notify Parents</button>
           </div>
        </div>
      </div>

      <style jsx>{`
        .extra-small { font-size: 0.65rem; }
        .info-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 2px; }
        .btn-white { background: #fff; border: 1px solid #f1f5f9; }
        .premium-shadow { box-shadow: 0 5px 20px -5px rgba(0, 0, 0, 0.05) !important; }
        .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      `}</style>
    </DashboardShell>
  );
}
