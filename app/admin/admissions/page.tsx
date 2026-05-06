'use client';
import { useState, useEffect } from 'react';
import DashboardShell from '../../../components/DashboardShell';
import { StatCard, DataTable, StatusBadge, Pagination, FormModal, ConfirmDialog, LoadingSpinner } from '../../../components/UIComponents';
import api from '../../../lib/api';
import { INQUIRY_MODES, INQUIRY_STATUS, CLASSES, formatDate } from '../../../lib/constants';

export default function AdmissionsPage() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0, converted: 0, lost: 0, pendingFollowUps: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ayFilter, setAyFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [form, setForm] = useState<any>({ feeDetails: { applicationFee: {}, admissionFee: {}, schoolFee: {}, transportFee: {}, grandTotal: {} } });
  const [routes, setRoutes] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      // 1. Load Academic Years first to ensure we have a filter context
      const ayRes = await api.get('/academic-years').catch(() => ({ data: [] }));
      const years = ayRes.data || [];
      setAcademicYears(years);

      // 2. Determine the best academic year to filter by
      let currentAyId = ayFilter;
      if (!currentAyId && years.length > 0) {
        const current = years.find((ay: any) => ay.isCurrent) || years[0];
        currentAyId = current._id;
        setAyFilter(currentAyId);
      }

      // 3. Fetch data using the determined year (or empty if truly none exist yet)
      const [r, s, transRes] = await Promise.all([
        api.get('/inquiries', { page, limit: 10, search, status: statusFilter, academicYear: currentAyId }),
        api.get('/inquiries/stats', { academicYear: currentAyId }),
        api.get('/transport').catch(() => ({ data: [] }))
      ]);

      setData(r.data || []);
      setPages(r.pages || 1);
      setTotalRecords(r.total || 0);
      setStats(s.data || { total: 0, today: 0, converted: 0, lost: 0, pendingFollowUps: 0 });
      setRoutes(transRes.data || []);
      
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, search, statusFilter, ayFilter]);

  const updateFee = (type: string, field: string, val: number) => {
    const feeDetails = form.feeDetails || { applicationFee: {}, admissionFee: {}, schoolFee: {}, transportFee: {}, grandTotal: {} };
    const updatedFee = { ...feeDetails[type], [field]: Number(val) };
    updatedFee.final = (updatedFee.original || 0) - (updatedFee.concession || 0);
    const newFeeDetails = { ...feeDetails, [type]: updatedFee };
    
    const types = ['applicationFee', 'admissionFee', 'schoolFee', 'transportFee'];
    const grand = { original: 0, concession: 0, final: 0 };
    types.forEach(t => {
      grand.original += newFeeDetails[t]?.original || 0;
      grand.concession += newFeeDetails[t]?.concession || 0;
      grand.final += newFeeDetails[t]?.final || 0;
    });
    newFeeDetails.grandTotal = grand;
    setForm({ ...form, feeDetails: newFeeDetails });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const submissionData = { ...form };
      
      // Removed manual validation alert - Backend now handles auto-assignment
      
      if (editItem) await api.put(`/inquiries/${editItem._id}`, submissionData);
      else await api.post('/inquiries', submissionData);
      setShowForm(false); setEditItem(null); load();
    } catch (e: any) { alert(e.message); }
  };

  const handleDelete = async () => {
    await api.delete(`/inquiries/${showDelete._id}`);
    setShowDelete(null); setSelected(null); load();
  };

  const handleConvert = async (id: string) => {
    await api.post(`/inquiries/${id}/convert`);
    load(); setSelected(null);
  };

  const openEdit = (item: any) => { 
    setEditItem(item); 
    setForm(item.feeDetails ? item : { ...item, feeDetails: { applicationFee: {}, admissionFee: {}, schoolFee: {}, transportFee: {}, grandTotal: {} } }); 
    setShowForm(true); 
  };
  
  const openAdd = () => { 
    setEditItem(null); 
    const defaultYear = ayFilter || academicYears.find((ay: any) => ay.isCurrent)?._id || academicYears[0]?._id;
    setForm({ 
      modeOfInquiry: 'Walk-in', 
      classSeeking: '1', 
      preferredCommunication: 'Call', 
      status: 'New', 
      academicYear: defaultYear, 
      feeDetails: { applicationFee: {}, admissionFee: {}, schoolFee: {}, transportFee: {}, grandTotal: {} } 
    }); 
    setShowForm(true); 
  };

  const columns = [
    { 
      label: 'Student Name', 
      key: 'studentName',
      render: (row: any) => (
        <div className="d-flex align-items-center gap-2">
          <div className="avatar-circle shadow-sm" style={{ backgroundColor: '#eff6ff', color: '#3b82f6', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
            {row.studentName?.[0]}
          </div>
          <div>
            <div className="fw-800 text-dark" style={{ fontSize: '0.75rem' }}>{row.studentName}</div>
            <div className="text-muted extra-small">{row.inquiryId}</div>
          </div>
        </div>
      )
    },
    { label: 'Date', key: 'dateOfInquiry', render: (r: any) => <span className="extra-small fw-bold text-muted">{formatDate(r.dateOfInquiry)}</span> },
    { label: 'Mode', key: 'modeOfInquiry', render: (r: any) => <span className="extra-small fw-bold"><i className={`bi bi-${r.modeOfInquiry === 'Walk-in' ? 'person-walking' : 'phone'} me-1 text-primary`} />{r.modeOfInquiry}</span> },
    { label: 'Class', key: 'classSeeking', render: (r: any) => <span className="badge bg-light text-dark extra-small border">{r.classSeeking}</span> },
    { label: 'Parent Mobile', key: 'parentMobile', render: (r: any) => <span className="text-primary fw-bold extra-small">{r.parentMobile}</span> },
    { label: 'Status', key: 'status', render: (r: any) => <StatusBadge status={r.status} /> },
  ];

  return (
    <DashboardShell role="admin">
      <div className="container-fluid py-3">
        {/* STATS */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Total Inquiries', value: stats.total, icon: 'bi-inbox', color: 'primary' },
            { label: 'Today', value: stats.today, icon: 'bi-clock-history', color: 'info' },
            { label: 'Converted', value: stats.converted, icon: 'bi-check-circle', color: 'success' },
            { label: 'Lost', value: stats.lost, icon: 'bi-x-circle', color: 'danger' },
            { label: 'Follow-ups', value: stats.pendingFollowUps, icon: 'bi-arrow-repeat', color: 'warning' }
          ].map((s, i) => (
            <div key={i} className="col-md">
               <StatCard horizontal={true} icon={s.icon} iconBg={`rgba(var(--bs-${s.color}-rgb), 0.1)`} label={s.label} value={s.value} />
            </div>
          ))}
        </div>

        {/* DATA TABLE CARD */}
        <div className="card border-0 premium-shadow rounded-4 bg-white overflow-hidden">
          <div className="card-header bg-white border-0 p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-800 mb-0">Admissions & Inquiry</h6>
                <p className="text-muted extra-small mb-0">Pipeline management</p>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-light rounded-pill px-3 py-1 fw-bold extra-small" onClick={() => load()}><i className="bi bi-arrow-clockwise me-1"/>Refresh</button>
                <button className="btn btn-primary rounded-pill px-3 py-1 fw-bold extra-small shadow-sm" onClick={openAdd}><i className="bi bi-plus-lg me-1"/>Add Inquiry</button>
              </div>
            </div>
            
            <div className="row g-2">
              <div className="col-md-5">
                <div className="ds-search-bar w-100 shadow-none border-light bg-light-subtle py-1">
                  <i className="bi bi-search text-muted small"/>
                  <input className="extra-small" placeholder="Search inquiries..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="col-md-3">
                <select className="form-select border-light bg-light-subtle rounded-3 extra-small py-2" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  {INQUIRY_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <select className="form-select border-light bg-light-subtle rounded-3 extra-small py-2" value={ayFilter} onChange={e => setAyFilter(e.target.value)}>
                   {academicYears.length === 0 && <option value="">Loading years...</option>}
                   {academicYears.map((ay: any) => (
                     <option key={ay._id} value={ay._id}>{ay.name} {ay.isCurrent ? '(Current)' : ''}</option>
                   ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card-body p-0">
            {loading && data.length === 0 ? <div className="p-5 text-center"><LoadingSpinner /></div> : (
              <>
                <DataTable columns={columns} data={data} onRowClick={setSelected} actions={(row: any) => (
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-white border-0 bg-light-subtle rounded-circle" style={{ width:'28px', height:'28px' }} onClick={(e) => { e.stopPropagation(); setSelected(row); }} title="View">
                      <i className="bi bi-eye text-primary small" />
                    </button>
                    <button className="btn btn-sm btn-white border-0 bg-light-subtle rounded-circle" style={{ width:'28px', height:'28px' }} onClick={(e) => { e.stopPropagation(); openEdit(row); }} title="Edit">
                      <i className="bi bi-pencil text-primary small" />
                    </button>
                    <button className="btn btn-sm btn-white border-0 bg-light-subtle rounded-circle" style={{ width:'28px', height:'28px' }} onClick={(e) => { e.stopPropagation(); setShowDelete(row); }} title="Delete">
                      <i className="bi bi-trash text-danger small" />
                    </button>
                  </div>
                )} />
                <div className="d-flex justify-content-between align-items-center p-3 border-top">
                  <small className="text-muted fw-bold extra-small">Displaying {data.length} of {totalRecords} records</small>
                  <Pagination page={page} pages={pages} onPageChange={setPage} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* DETAIL SIDE PANEL */}
      {selected && (
        <div className="ds-side-panel shadow-lg border-start bg-white p-4 show">
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <div className="badge bg-primary-subtle text-primary extra-small mb-2">{selected.inquiryId}</div>
              <h5 className="fw-800 mb-0">{selected.studentName}</h5>
              <p className="text-muted extra-small mb-0"><StatusBadge status={selected.status} /></p>
            </div>
            <button className="btn-close shadow-none" onClick={() => setSelected(null)} />
          </div>

          <div className="ds-panel-scroll" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
            <div className="row g-4">
              <div className="col-12">
                <h6 className="ds-section-title"><i className="bi bi-person me-2"/>Student Information</h6>
                <div className="row g-2">
                  {[
                    ['DOB', formatDate(selected.dateOfBirth)],
                    ['Gender', selected.gender],
                    ['Class Seeking', selected.classSeeking],
                    ['Prev School', selected.previousSchool],
                    ['Performance', selected.academicPerformance]
                  ].map(([l, v]) => (
                    <div key={l} className="col-6">
                      <span className="text-muted extra-small d-block mb-1">{l}</span>
                      <span className="fw-bold extra-small">{v || '-'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-12">
                <h6 className="ds-section-title"><i className="bi bi-people me-2"/>Parent Information</h6>
                <div className="row g-2">
                  {[
                    ["Father's Name", selected.fatherName],
                    ["Mother's Name", selected.motherName],
                    ['Mobile', selected.parentMobile],
                    ['Email', selected.parentEmail]
                  ].map(([l, v]) => (
                    <div key={l} className="col-6">
                      <span className="text-muted extra-small d-block mb-1">{l}</span>
                      <span className="fw-bold extra-small">{v || '-'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-12">
                <h6 className="ds-section-title"><i className="bi bi-wallet2 me-2"/>Financial Overview</h6>
                <div className="bg-light-subtle rounded-3 p-3 border">
                   <div className="d-flex justify-content-between mb-1"><span className="extra-small text-muted">Total Fee</span><span className="extra-small fw-bold">₹{selected.feeDetails?.grandTotal?.original || 0}</span></div>
                   <div className="d-flex justify-content-between mb-1"><span className="extra-small text-muted">Concession</span><span className="extra-small fw-bold text-danger">-₹{selected.feeDetails?.grandTotal?.concession || 0}</span></div>
                   <div className="d-flex justify-content-between pt-2 border-top"><span className="extra-small fw-800">Final Payable</span><span className="extra-small fw-800 text-primary">₹{selected.feeDetails?.grandTotal?.final || 0}</span></div>
                </div>
              </div>

              <div className="col-12">
                <h6 className="ds-section-title"><i className="bi bi-chat-dots me-2"/>Notes & Follow-up</h6>
                <div className="p-3 bg-light rounded-3 extra-small fw-bold text-muted border-start border-primary border-4">
                  {selected.additionalNotes || 'No additional notes.'}
                </div>
                <div className="mt-3">
                   <div className="info-label">Next Follow-up</div>
                   <div className="badge bg-warning-subtle text-warning-emphasis extra-small fw-bold">
                     <i className="bi bi-calendar-event me-2"/>{formatDate(selected.nextFollowUpDate)}
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ds-panel-footer border-top pt-3 mt-4 d-flex gap-2">
            {selected.status !== 'Converted' && (
              <button className="btn btn-primary rounded-pill flex-fill extra-small fw-bold" onClick={() => handleConvert(selected._id)}>Convert to Admission</button>
            )}
            <button className="btn btn-outline-danger rounded-pill extra-small fw-bold" onClick={() => setShowDelete(selected)}>Delete</button>
          </div>
        </div>
      )}

      {/* FORM MODAL */}
      <FormModal show={showForm} onClose={() => setShowForm(false)} title={editItem ? 'Edit Inquiry' : 'Add Inquiry'} onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label small fw-bold">Student Name *</label><input className="form-control form-control-sm rounded-3" value={form.studentName || ''} onChange={e => setForm({ ...form, studentName: e.target.value })} required /></div>
          <div className="col-md-6"><label className="form-label small fw-bold">Class Seeking *</label><select className="form-select form-select-sm rounded-3" value={form.classSeeking || ''} onChange={e => setForm({ ...form, classSeeking: e.target.value })}>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div className="col-md-6"><label className="form-label small fw-bold">Mode of Inquiry *</label><select className="form-select form-select-sm rounded-3" value={form.modeOfInquiry || ''} onChange={e => setForm({ ...form, modeOfInquiry: e.target.value })}>{INQUIRY_MODES.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
          <div className="col-md-6"><label className="form-label small fw-bold">Parent Mobile *</label><input className="form-control form-control-sm rounded-3" value={form.parentMobile || ''} onChange={e => setForm({ ...form, parentMobile: e.target.value })} required /></div>
          
          <div className="col-md-6"><label className="form-label small fw-bold">Status</label><select className="form-select form-select-sm rounded-3" value={form.status || 'New'} onChange={e => setForm({ ...form, status: e.target.value })}>{INQUIRY_STATUS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          <div className="col-md-6"><label className="form-label small fw-bold">Next Follow-up Date</label><input type="date" className="form-control form-control-sm rounded-3" value={form.nextFollowUpDate?.substring(0, 10) || ''} onChange={e => setForm({ ...form, nextFollowUpDate: e.target.value })} /></div>

          <div className="col-md-6"><label className="form-label small fw-bold">Father's Name</label><input className="form-control form-control-sm rounded-3" value={form.fatherName || ''} onChange={e => setForm({ ...form, fatherName: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label small fw-bold">Mother's Name</label><input className="form-control form-control-sm rounded-3" value={form.motherName || ''} onChange={e => setForm({ ...form, motherName: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label small fw-bold">Parent Email</label><input type="email" className="form-control form-control-sm rounded-3" value={form.parentEmail || ''} onChange={e => setForm({ ...form, parentEmail: e.target.value })} /></div>
          
          <div className="col-md-3"><label className="form-label small fw-bold">Gender</label><select className="form-select form-select-sm rounded-3" value={form.gender || ''} onChange={e => setForm({ ...form, gender: e.target.value })}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></div>
          <div className="col-md-3"><label className="form-label small fw-bold">DOB</label><input type="date" className="form-control form-control-sm rounded-3" value={form.dateOfBirth?.substring(0, 10) || ''} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} /></div>
          
          <div className="col-12"><label className="form-label small fw-bold">Address</label><textarea className="form-control form-control-sm rounded-3" rows={2} value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
          
          <div className="col-12 mt-3">
            <h6 className="fw-800 extra-small text-uppercase opacity-75 mb-2">Fee Configuration</h6>
            <div className="table-responsive">
              <table className="table table-sm table-bordered align-middle">
                <thead className="bg-light extra-small">
                  <tr>
                    <th>Fee Type</th>
                    <th>Original</th>
                    <th>Concession</th>
                    <th>Final</th>
                  </tr>
                </thead>
                <tbody className="extra-small">
                  {[
                    { label: 'Application', key: 'applicationFee' },
                    { label: 'Admission', key: 'admissionFee' },
                    { label: 'School Fee', key: 'schoolFee' },
                  ].map(f => (
                    <tr key={f.key}>
                      <td className="fw-bold">{f.label}</td>
                      <td><input type="number" className="form-control form-control-sm border-0 bg-light" value={form.feeDetails?.[f.key]?.original || ''} onChange={e => updateFee(f.key, 'original', Number(e.target.value))} /></td>
                      <td><input type="number" className="form-control form-control-sm border-0 bg-light" value={form.feeDetails?.[f.key]?.concession || ''} onChange={e => updateFee(f.key, 'concession', Number(e.target.value))} /></td>
                      <td className="fw-bold">₹{form.feeDetails?.[f.key]?.final || 0}</td>
                    </tr>
                  ))}
                  <tr>
                    <td>
                      <select className="form-select form-select-sm border-0 bg-light extra-small" value={form.transportRoute || ''} onChange={e => {
                        const route: any = routes.find((r: any) => r._id === e.target.value);
                        setForm({ ...form, transportRoute: e.target.value });
                        if (route) updateFee('transportFee', 'original', route.fee);
                      }}>
                        <option value="">No Transport</option>
                        {routes.map((r: any) => <option key={r._id} value={r._id}>{r.routeName} - ₹{r.fee}</option>)}
                      </select>
                    </td>
                    <td><input type="number" className="form-control form-control-sm border-0 bg-light" value={form.feeDetails?.transportFee?.original || ''} onChange={e => updateFee('transportFee', 'original', Number(e.target.value))} /></td>
                    <td><input type="number" className="form-control form-control-sm border-0 bg-light" value={form.feeDetails?.transportFee?.concession || ''} onChange={e => updateFee('transportFee', 'concession', Number(e.target.value))} /></td>
                    <td className="fw-bold">₹{form.feeDetails?.transportFee?.final || 0}</td>
                  </tr>
                </tbody>
                <tfoot className="bg-primary bg-opacity-10 extra-small fw-800">
                  <tr>
                    <td>GRAND TOTAL</td>
                    <td>₹{form.feeDetails?.grandTotal?.original || 0}</td>
                    <td className="text-danger">₹{form.feeDetails?.grandTotal?.concession || 0}</td>
                    <td className="text-primary">₹{form.feeDetails?.grandTotal?.final || 0}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          <div className="col-12"><label className="form-label small fw-bold">Additional Notes</label><textarea className="form-control form-control-sm rounded-3" rows={2} value={form.additionalNotes || ''} onChange={e => setForm({ ...form, additionalNotes: e.target.value })} /></div>
        </div>
      </FormModal>

      <ConfirmDialog show={!!showDelete} onClose={() => setShowDelete(null)} onConfirm={handleDelete} message="Delete this inquiry record?" />

      <style jsx>{`
        .extra-small { font-size: 0.65rem; }
        .fw-800 { font-weight: 800; }
        .premium-shadow { box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05) !important; }
        .btn-white { background: #fff; border: 1px solid #f1f5f9; }
        .ds-section-title { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #3b82f6; margin-bottom: 1rem; }
        .ds-side-panel { position: fixed; top: 0; right: -400px; width: 400px; height: 100vh; z-index: 1050; transition: 0.3s; padding-top: 2rem !important; }
        .ds-side-panel.show { right: 0; }
        .info-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 4px; display: block; }
      `}</style>
    </DashboardShell>
  );
}
