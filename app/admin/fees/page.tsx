'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '../../../components/DashboardShell';
import { 
  StatCard, StatusBadge, Pagination, FormModal, 
  LoadingSpinner, FilterBar 
} from '../../../components/UIComponents';
import api from '../../../lib/api';
import { CLASSES, SECTIONS, formatCurrency, formatDate } from '../../../lib/constants';

interface FeeRecord {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    rollNo: string;
    currentClass: string;
    section: string;
    admissionNo: string;
  };
  totalFee: number;
  netFee: number;
  paidAmount: number;
  balanceDue: number;
  dueDate: string;
  feeStatus: string;
  tuitionFee: number;
  transportFee: number;
  booksFee: number;
  labFee: number;
  activityFee: number;
  installments: Array<{ name: string; amount: number; dueDate: string; status: string }>;
  payments: Array<{ amount: number; date: string; mode: string; receiptNo: string }>;
}

export default function FeeManagementPage() {
  const router = useRouter();
  const [data, setData] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [filters, setFilters] = useState({ className: '', section: '', status: '', search: '', academicYear: '' });
  const [summary, setSummary] = useState({ totalRevenue: 0, totalCollected: 0, totalBalance: 0, defaultersCount: 0 });
  
  const [showPayModal, setShowPayModal] = useState(false);
  const [showStudentSearch, setShowStudentSearch] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [payForm, setPayForm] = useState({ amount: '', mode: 'Cash', date: new Date().toISOString().split('T')[0] });
  const [processing, setProcessing] = useState(false);

  const fetchStudents = async (query: string) => {
    if (query.length < 2) return;
    try {
      const res = await api.get('/students', { search: query, limit: 5 });
      setStudents(res.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const loadAY = async () => {
      try {
        const res = await api.get('/academic-years');
        setAcademicYears(res.data);
        const active = res.data.find((a: any) => a.isCurrent);
        if (active) setFilters(f => ({ ...f, academicYear: active._id }));
      } catch (e) { console.error(e); }
    };
    loadAY();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [feeRes, summaryRes] = await Promise.all([
        api.get<FeeRecord[]>('/fees', { page, ...filters }),
        api.get<any>('/fees/summary')
      ]);
      setData(feeRes.data);
      setPages(feeRes.pages || 1);
      if (summaryRes.success) setSummary(summaryRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, filters.academicYear]);

  const handleApplyFilters = () => { setPage(1); load(); };
  const handleResetFilters = () => { 
    const currentAY = academicYears.find(a => a.isCurrent)?._id || '';
    setFilters({ className: '', section: '', status: '', search: '', academicYear: currentAY }); 
    setPage(1); 
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee || !payForm.amount) return;
    setProcessing(true);
    try {
      await api.post(`/fees/${selectedFee._id}/collect`, { 
        ...payForm,
        receiptNo: `RCPT-${Date.now().toString().slice(-6)}`
      });
      setShowPayModal(false);
      setPayForm({ amount: '', mode: 'Cash', date: new Date().toISOString().split('T')[0] });
      load();
    } catch (e) { console.error(e); }
    setProcessing(false);
  };

  return (
    <DashboardShell role="admin">
      {/* COMPACT HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="fw-800 mb-0">Financial Oversight</h5>
          <p className="text-muted extra-small fw-bold mb-0 text-uppercase opacity-75">Fee Collections & Ledger Management</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-white btn-sm px-3 rounded-pill premium-shadow border-0 extra-small fw-bold text-primary"><i className="bi bi-file-earmark-pdf me-1"/>Export Defaulters</button>
          <button className="btn btn-primary btn-sm px-4 rounded-pill premium-shadow border-0 extra-small fw-800" onClick={() => setShowStudentSearch(true)}><i className="bi bi-plus-lg me-1"/>New Collection</button>
        </div>
      </div>

      {/* VERTICAL STATUS CARDS - MATCHING STAFF UI */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Revenue', value: summary.totalRevenue, color: 'primary', icon: 'bi-wallet2', sub: 'Projected Earnings' },
          { label: 'Fee Collected', value: summary.totalCollected, color: 'success', icon: 'bi-cash-stack', sub: 'Amount Received' },
          { label: 'Balance Due', value: summary.totalBalance, color: 'danger', icon: 'bi-exclamation-triangle', sub: 'Pending Outstanding' },
          { label: 'Defaulters', value: summary.defaultersCount, color: 'warning', icon: 'bi-people', sub: 'Overdue Students' }
        ].map((s, i) => (
          <div key={i} className="col-md-3 col-6">
            <StatCard 
              horizontal={true}
              icon={s.icon} 
              iconBg={`rgba(var(--bs-${s.color}-rgb), 0.1)`} 
              label={s.label} 
              value={s.label === 'Defaulters' ? s.value : formatCurrency(s.value)} 
            />
          </div>
        ))}
      </div>

      {/* CLEAN FILTERS */}
      <div className="card border-0 premium-shadow rounded-4 bg-white mb-3">
        <div className="card-body p-2 px-3">
           <div className="row g-2 align-items-end">
              <div className="col-md-3">
                 <label className="info-label">Student Search</label>
                 <input className="form-control form-control-sm border-0 bg-light-subtle rounded-3 extra-small" placeholder="Name, ID or Roll..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
              </div>
              <div className="col-md-2 col-6">
                 <label className="info-label">Academic Year</label>
                 <select className="form-select form-select-sm border-0 bg-light-subtle rounded-3 extra-small fw-bold" value={filters.academicYear} onChange={e => setFilters({...filters, academicYear: e.target.value})}>
                    {academicYears.map(ay => <option key={ay._id} value={ay._id}>{ay.name}</option>)}
                 </select>
              </div>
              <div className="col-md-2 col-6">
                 <label className="info-label">Class</label>
                 <select className="form-select form-select-sm border-0 bg-light-subtle rounded-3 extra-small fw-bold" value={filters.className} onChange={e => setFilters({...filters, className: e.target.value})}>
                    <option value="">All Classes</option>
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
              </div>
              <div className="col-md-1 col-6">
                 <label className="info-label">Section</label>
                 <select className="form-select form-select-sm border-0 bg-light-subtle rounded-3 extra-small fw-bold" value={filters.section} onChange={e => setFilters({...filters, section: e.target.value})}>
                    <option value="">All</option>
                    {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
              </div>
              <div className="col-md-2 col-6">
                 <label className="info-label">Fee Status</label>
                 <select className="form-select form-select-sm border-0 bg-light-subtle rounded-3 extra-small fw-bold" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
                    <option value="">All Statuses</option>
                    <option>Paid</option><option>Partially Paid</option><option>Unpaid</option><option>Overdue</option>
                 </select>
              </div>
              <div className="col-md-2 d-flex gap-2">
                 <button className="btn btn-primary btn-sm flex-grow-1 rounded-3 extra-small fw-bold shadow-sm" onClick={handleApplyFilters}>Apply Filters</button>
                 <button className="btn btn-light btn-sm rounded-3 extra-small fw-bold" onClick={handleResetFilters}><i className="bi bi-arrow-counterclockwise"/></button>
              </div>
           </div>
        </div>
      </div>

      {/* FULL WIDTH CLEAN TABLE */}
      <div className="card border-0 premium-shadow rounded-4 bg-white overflow-hidden">
        <div className="table-responsive">
           <table className="table table-hover align-middle mb-0">
              <thead className="bg-light-subtle">
                 <tr>
                    <th className="info-label border-0 ps-4 py-3">Student Identity</th>
                    <th className="info-label border-0 py-3">Academic Placement</th>
                    <th className="info-label border-0 py-3 text-end">Net Payable</th>
                    <th className="info-label border-0 py-3 text-end">Total Paid</th>
                    <th className="info-label border-0 py-3 text-end">Outstanding</th>
                    <th className="info-label border-0 py-3">Collection Status</th>
                    <th className="info-label border-0 pe-4 py-3 text-end">Actions</th>
                 </tr>
              </thead>
              <tbody>
                 {loading ? (
                    <tr><td colSpan={7} className="text-center py-5"><LoadingSpinner /></td></tr>
                 ) : data.length > 0 ? data.map(r => (
                    <tr key={r._id}>
                       <td className="ps-4">
                          <div className="d-flex align-items-center gap-3">
                             <div className="ds-user-avatar shadow-sm" style={{ width: 30, height: 30, fontSize: '0.7rem' }}>{(r.student.firstName || 'S')[0]}</div>
                             <div>
                                <div className="fw-800 text-dark extra-small">{r.student.firstName} {r.student.lastName}</div>
                                <div className="text-muted" style={{ fontSize: '0.6rem' }}>ID: {r.student.admissionNo}</div>
                             </div>
                          </div>
                       </td>
                       <td><span className="badge bg-light text-dark fw-bold border" style={{ fontSize: '0.6rem' }}>Class {r.student.currentClass} - {r.student.section}</span></td>
                       <td className="text-end fw-bold extra-small text-dark">{formatCurrency(r.netFee || r.totalFee)}</td>
                       <td className="text-end fw-bold text-success extra-small">{formatCurrency(r.paidAmount)}</td>
                       <td className="text-end">
                          <span className={`fw-800 ${r.balanceDue > 0 ? 'text-danger' : 'text-muted'} extra-small`}>
                             {formatCurrency(r.balanceDue)}
                          </span>
                       </td>
                       <td><StatusBadge status={r.feeStatus} /></td>
                       <td className="pe-4 text-end">
                          <div className="d-flex gap-1 justify-content-end">
                             <button className="btn btn-sm btn-light p-1 px-2 rounded-2 border-0" title="Quick Payment" onClick={() => { setSelectedFee(r); setShowPayModal(true); }}><i className="bi bi-cash-coin text-primary small"/></button>
                             <button className="btn btn-sm btn-light p-1 px-2 rounded-2 border-0" title="Full Breakdown" onClick={() => router.push(`/admin/fees/${r._id}`)}><i className="bi bi-eye text-secondary small"/></button>
                          </div>
                       </td>
                    </tr>
                 )) : (
                    <tr><td colSpan={7} className="text-center py-5 text-muted extra-small">No financial records matching your criteria.</td></tr>
                 )}
              </tbody>
           </table>
        </div>
        <div className="p-3 border-top d-flex justify-content-between align-items-center bg-light-subtle">
           <span className="text-muted extra-small fw-bold opacity-75">Records Found: {data.length} | Viewing Page {page}</span>
           <Pagination page={page} pages={pages} onPageChange={setPage} />
        </div>
      </div>

      <FormModal show={showPayModal} onClose={() => setShowPayModal(false)} title="Financial Transaction" onSubmit={handlePayment} loading={processing}>
        <div className="p-3 rounded-4 bg-light-subtle border mb-3">
           <div className="row align-items-center">
              <div className="col-auto">
                 <div className="ds-user-avatar shadow-sm" style={{ width: 45, height: 45 }}>{(selectedFee?.student.firstName || 'S')[0]}</div>
              </div>
              <div className="col">
                 <div className="fw-800 text-dark small">{selectedFee?.student.firstName} {selectedFee?.student.lastName}</div>
                 <div className="extra-small text-muted fw-bold">ID: {selectedFee?.student.admissionNo} • OUTSTANDING: <span className="text-danger">{formatCurrency(selectedFee?.balanceDue || 0)}</span></div>
              </div>
           </div>
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="info-label">Collection Amount (₹) *</label>
            <input className="form-control form-control-sm rounded-3 fw-bold" type="number" placeholder="0.00" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} required />
          </div>
          <div className="col-md-6">
            <label className="info-label">Payment Mode *</label>
            <select className="form-select form-select-sm rounded-3 fw-bold" value={payForm.mode} onChange={e => setPayForm({...payForm, mode: e.target.value})}>
              <option>Cash</option><option>Online</option><option>UPI</option><option>Cheque</option><option>Bank Transfer</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="info-label">Date *</label>
            <input className="form-control form-control-sm rounded-3" type="date" value={payForm.date} onChange={e => setPayForm({...payForm, date: e.target.value})} required />
          </div>
          <div className="col-md-6">
            <label className="info-label">Receipt / Ref No.</label>
            <input className="form-control form-control-sm rounded-3" placeholder="RCPT-XXXXXX" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-top d-flex justify-content-end gap-2">
           <button type="button" className="btn btn-light btn-sm rounded-pill px-4 fw-bold extra-small" onClick={() => setShowPayModal(false)}>Cancel</button>
           <button type="submit" className="btn btn-primary btn-sm rounded-pill px-4 fw-800 extra-small shadow-sm">Authorize Payment</button>
        </div>
      </FormModal>

      {/* STUDENT SELECTION MODAL */}
      <FormModal show={showStudentSearch} onClose={() => setShowStudentSearch(false)} title="Select Student for Collection" onSubmit={e => e.preventDefault()}>
        <div className="mb-3">
          <label className="info-label">Search Student (Name or Admission No)</label>
          <div className="ds-search-bar shadow-none border bg-light-subtle py-2">
            <i className="bi bi-search text-muted small"/>
            <input 
              className="extra-small" 
              placeholder="Start typing student name..." 
              value={searchQuery} 
              onChange={e => { setSearchQuery(e.target.value); fetchStudents(e.target.value); }} 
            />
          </div>
        </div>
        <div className="d-flex flex-column gap-2 mt-3" style={{maxHeight: '300px', overflowY: 'auto'}}>
          {students.map(s => (
            <button 
              key={s._id} 
              className="btn btn-light text-start p-3 rounded-4 border-0 bg-light-subtle d-flex justify-content-between align-items-center"
              onClick={async () => {
                const feeRes = await api.get('/fees', { student: s._id });
                if (feeRes.data && feeRes.data.length > 0) {
                  setSelectedFee(feeRes.data[0]);
                  setShowStudentSearch(false);
                  setShowPayModal(true);
                } else {
                  alert('No fee record found for this student. Please create one in Student profile.');
                }
              }}
            >
              <div>
                <div className="fw-800 text-dark extra-small">{s.firstName} {s.lastName}</div>
                <div className="text-muted extra-small fw-bold">ID: {s.admissionNo} • Class {s.currentClass}</div>
              </div>
              <i className="bi bi-chevron-right text-primary"/>
            </button>
          ))}
          {searchQuery.length >= 2 && students.length === 0 && <div className="text-center py-4 text-muted extra-small">No students found.</div>}
        </div>
      </FormModal>

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
