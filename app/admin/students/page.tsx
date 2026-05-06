'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '../../../components/DashboardShell';
import { DataTable, LoadingSpinner, StatusBadge, StatCard } from '../../../components/UIComponents';
import api from '../../../lib/api';
import { CLASSES, SECTIONS } from '../../../lib/constants';

export default function StudentsPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [ayFilter, setAyFilter] = useState('');
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, onboarding: 0 });

  const columns = [
    { 
      label: 'Student Name', 
      key: 'firstName',
      render: (row: any) => (
        <div className="d-flex align-items-center gap-2">
          <div className="ds-user-avatar shadow-sm overflow-hidden" style={{ width: '32px', height: '32px', borderRadius: '10px', fontSize: '0.7rem' }}>
             {row.photo ? (
                <img src={row.photo} alt={row.firstName} className="w-100 h-100 object-fit-cover" />
             ) : (
                <>{row.firstName?.[0]}{row.lastName?.[0]}</>
             )}
          </div>
          <div>
            <div className="fw-800 text-dark" style={{ fontSize: '0.75rem' }}>{row.firstName} {row.lastName}</div>
            <div className="text-muted" style={{ fontSize: '0.65rem' }}>{row.admissionNo}</div>
          </div>
        </div>
      )
    },
    { label: 'Class', key: 'currentClass', render: (row: any) => <span className="fw-bold text-muted" style={{ fontSize: '0.75rem' }}>{row.currentClass}-{row.section}</span> },
    { label: 'Father Name', key: 'father.name', render: (row: any) => <span style={{ fontSize: '0.75rem' }}>{row.father?.name}</span> },
    { label: 'Mobile', key: 'father.mobile', render: (row: any) => <span className="text-primary fw-bold" style={{ fontSize: '0.75rem' }}>{row.father?.mobile}</span> },
    { label: 'Status', key: 'admissionStatus', render: (row: any) => <StatusBadge status={row.admissionStatus} /> },
  ];

  const loadInitialData = async () => {
    try {
      const res = await api.get('/academic-years');
      setAcademicYears(res.data);
      const current = res.data.find((a: any) => a.isCurrent);
      if (current) setAyFilter(current._id);
    } catch (e) { console.error(e); }
  };

  const load = async () => {
    setLoading(true);
    try {
      const [res, statsRes] = await Promise.all([
        api.get('/students', { 
          page, 
          search, 
          searchFields: 'firstName,lastName,admissionNo,rollNo', 
          currentClass: classFilter, 
          section: sectionFilter,
          academicYear: ayFilter,
          limit: 10 
        }),
        api.get('/students/stats')
      ]);
      setData(Array.isArray(res.data) ? res.data : []);
      setPages(res.pages || 1);
      setTotalRecords(res.total || 0);
      setStats(statsRes.data || { total: 0, active: 0, inactive: 0, onboarding: 0 });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadInitialData(); }, []);
  useEffect(() => { load(); }, [page, search, classFilter, sectionFilter, ayFilter]);

  const handleSelect = (student: any) => {
    router.push(`/admin/students/${student._id}`);
  };

  return (
    <DashboardShell role="admin">
      <div className="container-fluid py-3">
      {/* UNIFIED HORIZONTAL STATS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Enrollment', value: stats.total, icon: 'bi-people', color: 'primary' },
          { label: 'Active Students', value: stats.active, icon: 'bi-person-check', color: 'success' },
          { label: 'New Admissions', value: stats.onboarding, icon: 'bi-plus-circle', color: 'info' },
          { label: 'Withdrawn', value: stats.inactive, icon: 'bi-person-x', color: 'danger' }
        ].map((s, i) => (
          <div key={i} className="col-md-3">
             <StatCard horizontal={true} icon={s.icon} iconBg={`rgba(var(--bs-${s.color}-rgb), 0.1)`} label={s.label} value={s.value} />
          </div>
        ))}
      </div>

        {/* Directory List with Enhanced Filters */}
        <div className="card border-0 premium-shadow rounded-4 bg-white overflow-hidden">
          <div className="card-header bg-white border-0 p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-800 mb-0">Student Directory</h6>
                <p className="text-muted extra-small mb-0">Real-time academic ledger</p>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-light rounded-pill px-3 py-1 fw-bold extra-small" onClick={() => load()}><i className="bi bi-arrow-clockwise me-1"/>Refresh</button>
                <button className="btn btn-primary rounded-pill px-3 py-1 fw-bold extra-small shadow-sm" onClick={() => router.push('/admin/students/add')}><i className="bi bi-plus-lg me-1"/>Enroll Student</button>
              </div>
            </div>
            
            <div className="row g-2">
              <div className="col-md-4">
                <div className="ds-search-bar w-100 shadow-none border-light bg-light-subtle py-1">
                  <i className="bi bi-search text-muted small"/>
                  <input className="extra-small" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="col-md-2">
                <select className="form-select border-light bg-light-subtle rounded-3 extra-small py-2" value={classFilter} onChange={e => setClassFilter(e.target.value)}>
                  <option value="">All Classes</option>
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <select className="form-select border-light bg-light-subtle rounded-3 extra-small py-2" value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}>
                  <option value="">All Sections</option>
                  {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <select className="form-select border-light bg-light-subtle rounded-3 extra-small py-2" value={ayFilter} onChange={e => setAyFilter(e.target.value)}>
                   <option value="">All Academic Years</option>
                   {academicYears.map(ay => <option key={ay._id} value={ay._id}>{ay.name} {ay.isCurrent ? '(Current)' : ''}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card-body p-0">
            {loading ? <div className="p-5 text-center"><LoadingSpinner /></div> : (
              <>
                <DataTable columns={columns} data={data} onRowClick={handleSelect} actions={row => (
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-white border-0 bg-light-subtle rounded-circle" style={{ width:'28px', height:'28px' }} onClick={(e) => { e.stopPropagation(); router.push(`/admin/students/${row._id}`); }} title="View">
                      <i className="bi bi-eye text-primary small" />
                    </button>
                    <button className="btn btn-sm btn-white border-0 bg-light-subtle rounded-circle" style={{ width:'28px', height:'28px' }} onClick={(e) => { e.stopPropagation(); router.push(`/admin/students/edit/${row._id}`); }} title="Edit">
                      <i className="bi bi-pencil text-primary small" />
                    </button>
                  </div>
                )} />
                <div className="d-flex justify-content-between align-items-center p-3 border-top">
                  <small className="text-muted fw-bold extra-small">Displaying {data.length} of {totalRecords} records</small>
                  <div className="pagination-premium">
                    <button className="btn btn-sm btn-light rounded-pill px-3 py-1 extra-small me-2" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                    <span className="extra-small fw-800 mx-2 text-muted">Page {page} / {pages}</span>
                    <button className="btn btn-sm btn-light rounded-pill px-3 py-1 extra-small" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .extra-small { font-size: 0.65rem; }
        .stat-icon-sm { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1rem; }
        .btn-white { background: #fff; border: 1px solid #f1f5f9; }
        .premium-shadow { box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05) !important; }
      `}</style>
    </DashboardShell>
  );
}
