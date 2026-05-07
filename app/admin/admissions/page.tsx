'use client';
import { useState, useEffect, useCallback } from 'react';
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
  
  // FILTERS
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    academicYear: '',
    classSeeking: '',
    modeOfInquiry: '',
    startDate: '',
    endDate: ''
  });

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [form, setForm] = useState<any>({ feeDetails: { applicationFee: {}, admissionFee: {}, schoolFee: {}, transportFee: {}, grandTotal: {} } });
  const [routes, setRoutes] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch auxiliary data if not already fetched
      if (academicYears.length === 0) {
        const [ayRes, transRes] = await Promise.all([
          api.get('/academic-years').catch(() => ({ data: [] })),
          api.get('/transport').catch(() => ({ data: [] }))
        ]);
        setAcademicYears(ayRes.data || []);
        setRoutes(transRes.data || []);
        
        // Auto-set current year if not selected
        if (!filters.academicYear && ayRes.data?.length > 0) {
          const current = ayRes.data.find((ay: any) => ay.isCurrent) || ayRes.data[0];
          setFilters(prev => ({ ...prev, academicYear: current._id }));
          return; // The useEffect will re-trigger with the new filter
        }
      }

      // 2. Fetch Inquiries with all filters
      const queryParams = { 
        page, 
        limit: 10, 
        ...filters
      };
      
      const [r, s] = await Promise.all([
        api.get('/inquiries', queryParams),
        api.get('/inquiries/stats', { academicYear: filters.academicYear })
      ]);

      setData(r.data || []);
      setPages(r.pages || 1);
      setTotalRecords(r.total || 0);
      setStats(s.data || { total: 0, today: 0, converted: 0, lost: 0, pendingFollowUps: 0 });
      
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [page, filters, academicYears.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300); // Debounce search/filter changes
    return () => clearTimeout(timer);
  }, [loadData]);

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
      if (editItem) await api.put(`/inquiries/${editItem._id}`, form);
      else await api.post('/inquiries', form);
      setShowForm(false); setEditItem(null); loadData();
    } catch (e: any) { alert(e.message); }
  };

  const handleDelete = async () => {
    await api.delete(`/inquiries/${showDelete._id}`);
    setShowDelete(null); setSelected(null); loadData();
  };

  const handleConvert = async (id: string) => {
    try {
      await api.post(`/inquiries/${id}/convert`, {});
      loadData(); setSelected(null);
      alert('Inquiry converted to Student successfully!');
    } catch (e: any) { alert(e.message); }
  };

  const openEdit = (item: any) => { 
    setEditItem(item); 
    setForm(item.feeDetails ? item : { ...item, feeDetails: { applicationFee: {}, admissionFee: {}, schoolFee: {}, transportFee: {}, grandTotal: {} } }); 
    setShowForm(true); 
  };
  
  const openAdd = () => { 
    setEditItem(null); 
    setForm({ 
      modeOfInquiry: 'Walk-in', 
      classSeeking: '1', 
      preferredCommunication: 'Call', 
      status: 'New', 
      academicYear: filters.academicYear, 
      feeDetails: { applicationFee: {}, admissionFee: {}, schoolFee: {}, transportFee: {}, grandTotal: {} } 
    }); 
    setShowForm(true); 
  };

  const handleFilterChange = (key: string, val: any) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const columns = [
    { 
      label: 'Student Identity', 
      key: 'studentName',
      render: (row: any) => (
        <div className="d-flex align-items-center gap-2">
          <div className="avatar-initial shadow-sm">
            {row.studentName?.[0]}
          </div>
          <div>
            <div className="fw-800 text-dark extra-small">{row.studentName}</div>
            <div className="text-muted" style={{fontSize: '0.6rem'}}>{row.inquiryId}</div>
          </div>
        </div>
      )
    },
    { label: 'Inquiry Date', key: 'dateOfInquiry', render: (r: any) => <span className="extra-small fw-bold text-muted">{formatDate(r.dateOfInquiry)}</span> },
    { label: 'Mode', key: 'modeOfInquiry', render: (r: any) => <span className="extra-small fw-bold"><i className={`bi bi-${r.modeOfInquiry === 'Walk-in' ? 'person-walking' : 'phone'} me-1 text-primary`} />{r.modeOfInquiry}</span> },
    { label: 'Class Seeking', key: 'classSeeking', render: (r: any) => <span className="badge bg-light text-dark extra-small border">{r.classSeeking}</span> },
    { label: 'Parent Contact', key: 'parentMobile', render: (r: any) => (
      <div>
        <div className="text-primary fw-bold extra-small">{r.parentMobile}</div>
        <div className="extra-small text-muted" style={{fontSize: '0.6rem'}}>{r.fatherName || 'No Parent Name'}</div>
      </div>
    )},
    { label: 'Status', key: 'status', render: (r: any) => <StatusBadge status={r.status} /> },
  ];

  return (
    <DashboardShell role="admin">
      <div className="container-fluid py-3">
        {/* STATS */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Total Inquiries', value: stats.total, icon: 'bi-inbox', color: 'primary' },
            { label: 'Today Inquiries', value: stats.today, icon: 'bi-clock-history', color: 'info', highlight: true },
            { label: 'Converted', value: stats.converted, icon: 'bi-check-circle', color: 'success' },
            { label: 'Lost', value: stats.lost, icon: 'bi-x-circle', color: 'danger' },
            { label: 'Follow-ups', value: stats.pendingFollowUps, icon: 'bi-arrow-repeat', color: 'warning' }
          ].map((s, i) => (
            <div key={i} className="col-md">
               <StatCard 
                 horizontal={true} 
                 icon={s.icon} 
                 iconBg={s.highlight ? `rgba(var(--bs-${s.color}-rgb), 0.2)` : `rgba(var(--bs-${s.color}-rgb), 0.1)`} 
                 label={s.label} 
                 value={s.value}
               />
            </div>
          ))}
        </div>

        {/* DATA TABLE CARD */}
        <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4">
          <div className="card-header bg-white border-0 p-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              <div>
                <h5 className="fw-900 mb-0">Admissions & Inquiry Registry</h5>
                <p className="text-muted extra-small mb-0">Manage student leads and admission pipeline efficiently.</p>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-primary rounded-pill px-4 py-2 fw-bold extra-small" onClick={() => loadData()}><i className="bi bi-arrow-clockwise me-1"/>Refresh</button>
                <button className="btn btn-primary rounded-pill px-4 py-2 fw-900 extra-small shadow" onClick={openAdd}><i className="bi bi-plus-lg me-1"/>NEW INQUIRY</button>
              </div>
            </div>
            
            {/* ADVANCED FILTERS */}
            <div className="bg-light p-3 rounded-4 mb-2">
              <div className="row g-2">
                <div className="col-md-3">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white border-0 ps-3"><i className="bi bi-search text-muted"/></span>
                    <input className="form-control border-0 extra-small" placeholder="Name, Mobile, ID..." value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} />
                  </div>
                </div>
                <div className="col-md-2">
                  <select className="form-select form-select-sm border-0 extra-small" value={filters.status} onChange={e => handleFilterChange('status', e.target.value)}>
                    <option value="">All Status</option>
                    {INQUIRY_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-md-2">
                  <select className="form-select form-select-sm border-0 extra-small" value={filters.classSeeking} onChange={e => handleFilterChange('classSeeking', e.target.value)}>
                    <option value="">All Classes</option>
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-md-2">
                  <select className="form-select form-select-sm border-0 extra-small" value={filters.modeOfInquiry} onChange={e => handleFilterChange('modeOfInquiry', e.target.value)}>
                    <option value="">All Modes</option>
                    {INQUIRY_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <select className="form-select form-select-sm border-0 extra-small" value={filters.academicYear} onChange={e => handleFilterChange('academicYear', e.target.value)}>
                    {academicYears.map((ay: any) => (
                      <option key={ay._id} value={ay._id}>{ay.name} {ay.isCurrent ? '(Current)' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="row g-2 mt-2">
                <div className="col-md-3">
                   <div className="d-flex align-items-center gap-2">
                     <span className="extra-small fw-bold text-muted text-nowrap">From:</span>
                     <input type="date" className="form-control form-control-sm border-0 extra-small" value={filters.startDate} onChange={e => handleFilterChange('startDate', e.target.value)} />
                   </div>
                </div>
                <div className="col-md-3">
                   <div className="d-flex align-items-center gap-2">
                     <span className="extra-small fw-bold text-muted text-nowrap">To:</span>
                     <input type="date" className="form-control form-control-sm border-0 extra-small" value={filters.endDate} onChange={e => handleFilterChange('endDate', e.target.value)} />
                   </div>
                </div>
                <div className="col text-end">
                   <button className="btn btn-link text-danger extra-small fw-bold p-0 text-decoration-none" onClick={() => setFilters({ search: '', status: '', academicYear: academicYears.find((ay: any) => ay.isCurrent)?._id || '', classSeeking: '', modeOfInquiry: '', startDate: '', endDate: '' })}>
                     Clear All Filters
                   </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="p-5 text-center"><LoadingSpinner /></div>
            ) : data.length > 0 ? (
              <>
                <DataTable 
                  columns={columns} 
                  data={data} 
                  onRowClick={setSelected} 
                  actions={(row: any) => (
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-white border rounded-circle p-0" style={{ width:'28px', height:'28px' }} onClick={(e) => { e.stopPropagation(); setSelected(row); }} title="View">
                        <i className="bi bi-eye text-primary small" />
                      </button>
                      <button className="btn btn-sm btn-white border rounded-circle p-0" style={{ width:'28px', height:'28px' }} onClick={(e) => { e.stopPropagation(); openEdit(row); }} title="Edit">
                        <i className="bi bi-pencil text-primary small" />
                      </button>
                      <button className="btn btn-sm btn-white border rounded-circle p-0" style={{ width:'28px', height:'28px' }} onClick={(e) => { e.stopPropagation(); setShowDelete(row); }} title="Delete">
                        <i className="bi bi-trash text-danger small" />
                      </button>
                    </div>
                  )} 
                />
                <div className="d-flex justify-content-between align-items-center p-4 border-top">
                  <small className="text-muted fw-bold extra-small">Showing {data.length} of {totalRecords} records</small>
                  <Pagination page={page} pages={pages} onPageChange={setPage} />
                </div>
              </>
            ) : (
              <div className="p-5 text-center bg-light-subtle">
                <i className="bi bi-inbox text-muted fs-1 mb-3 d-block opacity-25"></i>
                <h6 className="fw-800 text-muted">No inquiry records found.</h6>
                <p className="extra-small text-muted mb-0">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DETAIL SIDE PANEL */}
      {selected && (
        <div className={`ds-side-panel shadow-lg border-start bg-white p-4 ${selected ? 'show' : ''}`}>
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <div className="badge bg-primary-subtle text-primary extra-small mb-2">{selected.inquiryId}</div>
              <h5 className="fw-900 mb-0">{selected.studentName}</h5>
              <p className="text-muted extra-small mb-0 mt-1"><StatusBadge status={selected.status} /></p>
            </div>
            <button className="btn-close shadow-none" onClick={() => setSelected(null)} />
          </div>

          <div className="ds-panel-scroll" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
            <div className="row g-4">
              <div className="col-12">
                <h6 className="ds-section-title"><i className="bi bi-person-badge me-2"/>Lead Information</h6>
                <div className="row g-3">
                  {[
                    ['DOB', formatDate(selected.dateOfBirth)],
                    ['Gender', selected.gender],
                    ['Class Seeking', selected.classSeeking],
                    ['Prev School', selected.previousSchool],
                    ['Inquiry Mode', selected.modeOfInquiry],
                    ['Performance', selected.academicPerformance]
                  ].map(([l, v]) => (
                    <div key={l} className="col-6">
                      <span className="text-muted extra-small d-block mb-1">{l}</span>
                      <span className="fw-bold extra-small text-dark">{v || '-'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-12">
                <h6 className="ds-section-title"><i className="bi bi-people-fill me-2"/>Guardian Details</h6>
                <div className="row g-3">
                  {[
                    ["Father's Name", selected.fatherName],
                    ["Mother's Name", selected.motherName],
                    ['Primary Contact', selected.parentMobile],
                    ['Email Contact', selected.parentEmail],
                    ['Full Address', selected.address]
                  ].map(([l, v]) => (
                    <div key={l} className="col-12">
                      <span className="text-muted extra-small d-block mb-1">{l}</span>
                      <span className="fw-bold extra-small text-dark">{v || '-'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-12">
                <h6 className="ds-section-title"><i className="bi bi-currency-rupee me-2"/>Proposed Fee Structure</h6>
                <div className="bg-primary bg-opacity-10 rounded-4 p-3 border border-primary border-opacity-10">
                   <div className="d-flex justify-content-between mb-2"><span className="extra-small text-muted fw-bold">Quoted Fee</span><span className="extra-small fw-900">₹{selected.feeDetails?.grandTotal?.original || 0}</span></div>
                   <div className="d-flex justify-content-between mb-2"><span className="extra-small text-muted fw-bold">Scholarship/Concession</span><span className="extra-small fw-900 text-danger">-₹{selected.feeDetails?.grandTotal?.concession || 0}</span></div>
                   <div className="d-flex justify-content-between pt-2 border-top border-primary border-opacity-20"><span className="extra-small fw-900 text-primary">Final Commitment</span><span className="extra-small fw-900 text-primary">₹{selected.feeDetails?.grandTotal?.final || 0}</span></div>
                </div>
              </div>

              <div className="col-12">
                <h6 className="ds-section-title"><i className="bi bi-calendar-check me-2"/>Engagement History</h6>
                <div className="p-3 bg-light rounded-4 extra-small fw-bold text-muted mb-3">
                  {selected.additionalNotes || 'No notes provided during inquiry.'}
                </div>
                <div className="card border-0 bg-warning bg-opacity-10 p-3 rounded-4">
                   <div className="extra-small fw-800 text-warning-emphasis uppercase mb-1">Scheduled Follow-up</div>
                   <div className="extra-small fw-900 text-dark">
                     <i className="bi bi-alarm me-2"/>{formatDate(selected.nextFollowUpDate)}
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ds-panel-footer border-top pt-3 mt-4 d-flex gap-2">
            {selected.status !== 'Converted' && (
              <button className="btn btn-primary rounded-pill flex-fill extra-small fw-900 py-2 shadow" onClick={() => handleConvert(selected._id)}>CONVERT TO ADMISSION</button>
            )}
            <button className="btn btn-outline-danger rounded-pill extra-small fw-900 px-3" onClick={() => setShowDelete(selected)}>DELETE</button>
          </div>
        </div>
      )}

      {/* FORM MODAL */}
      <FormModal show={showForm} onClose={() => setShowForm(false)} title={editItem ? 'Modify Inquiry' : 'Create New Lead'} onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label extra-small fw-bold uppercase">Student Name *</label><input className="form-control form-control-sm rounded-3" value={form.studentName || ''} onChange={e => setForm({ ...form, studentName: e.target.value })} required /></div>
          <div className="col-md-6"><label className="form-label extra-small fw-bold uppercase">Class Seeking *</label><select className="form-select form-select-sm rounded-3" value={form.classSeeking || ''} onChange={e => setForm({ ...form, classSeeking: e.target.value })}>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div className="col-md-6"><label className="form-label extra-small fw-bold uppercase">Mode of Inquiry *</label><select className="form-select form-select-sm rounded-3" value={form.modeOfInquiry || ''} onChange={e => setForm({ ...form, modeOfInquiry: e.target.value })}>{INQUIRY_MODES.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
          <div className="col-md-6"><label className="form-label extra-small fw-bold uppercase">Parent Mobile *</label><input className="form-control form-control-sm rounded-3" value={form.parentMobile || ''} onChange={e => setForm({ ...form, parentMobile: e.target.value })} required /></div>
          
          <div className="col-md-6"><label className="form-label extra-small fw-bold uppercase">Status</label><select className="form-select form-select-sm rounded-3" value={form.status || 'New'} onChange={e => setForm({ ...form, status: e.target.value })}>{INQUIRY_STATUS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          <div className="col-md-6"><label className="form-label extra-small fw-bold uppercase">Next Follow-up</label><input type="date" className="form-control form-control-sm rounded-3" value={form.nextFollowUpDate?.substring(0, 10) || ''} onChange={e => setForm({ ...form, nextFollowUpDate: e.target.value })} /></div>

          <div className="col-md-6"><label className="form-label extra-small fw-bold uppercase">Father's Name</label><input className="form-control form-control-sm rounded-3" value={form.fatherName || ''} onChange={e => setForm({ ...form, fatherName: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label extra-small fw-bold uppercase">Mother's Name</label><input className="form-control form-control-sm rounded-3" value={form.motherName || ''} onChange={e => setForm({ ...form, motherName: e.target.value })} /></div>
          
          <div className="col-12 mt-3">
            <h6 className="fw-900 extra-small text-uppercase opacity-75 mb-3 border-bottom pb-2">Proposed Fee Structure</h6>
            <div className="table-responsive">
              <table className="table table-sm table-bordered align-middle">
                <thead className="bg-light extra-small">
                  <tr>
                    <th>FEE HEAD</th>
                    <th>BASE AMOUNT</th>
                    <th>DISCOUNT</th>
                    <th>FINAL</th>
                  </tr>
                </thead>
                <tbody className="extra-small">
                  {[
                    { label: 'Application Fee', key: 'applicationFee' },
                    { label: 'Admission Fee', key: 'admissionFee' },
                    { label: 'Tuition Fee', key: 'schoolFee' },
                  ].map(f => (
                    <tr key={f.key}>
                      <td className="fw-bold">{f.label}</td>
                      <td><input type="number" className="form-control form-control-sm border-0 bg-light" value={form.feeDetails?.[f.key]?.original || ''} onChange={e => updateFee(f.key, 'original', Number(e.target.value))} /></td>
                      <td><input type="number" className="form-control form-control-sm border-0 bg-light" value={form.feeDetails?.[f.key]?.concession || ''} onChange={e => updateFee(f.key, 'concession', Number(e.target.value))} /></td>
                      <td className="fw-bold text-primary">₹{form.feeDetails?.[f.key]?.final || 0}</td>
                    </tr>
                  ))}
                  <tr>
                    <td>
                      <select className="form-select form-select-sm border-0 bg-light extra-small fw-bold" value={form.transportRoute || ''} onChange={e => {
                        const route: any = routes.find((r: any) => r._id === e.target.value);
                        setForm({ ...form, transportRoute: e.target.value });
                        if (route) updateFee('transportFee', 'original', route.fee);
                      }}>
                        <option value="">No Transport</option>
                        {routes.map((r: any) => <option key={r._id} value={r._id}>{r.routeName} (₹{r.fee})</option>)}
                      </select>
                    </td>
                    <td><input type="number" className="form-control form-control-sm border-0 bg-light" value={form.feeDetails?.transportFee?.original || ''} onChange={e => updateFee('transportFee', 'original', Number(e.target.value))} /></td>
                    <td><input type="number" className="form-control form-control-sm border-0 bg-light" value={form.feeDetails?.transportFee?.concession || ''} onChange={e => updateFee('transportFee', 'concession', Number(e.target.value))} /></td>
                    <td className="fw-bold text-primary">₹{form.feeDetails?.transportFee?.final || 0}</td>
                  </tr>
                </tbody>
                <tfoot className="bg-primary bg-opacity-10 extra-small fw-900">
                  <tr>
                    <td>TOTAL PAYABLE</td>
                    <td>₹{form.feeDetails?.grandTotal?.original || 0}</td>
                    <td className="text-danger">₹{form.feeDetails?.grandTotal?.concession || 0}</td>
                    <td className="text-primary fs-6">₹{form.feeDetails?.grandTotal?.final || 0}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          <div className="col-12"><label className="form-label extra-small fw-bold uppercase">Observation / Notes</label><textarea className="form-control form-control-sm rounded-3" rows={2} value={form.additionalNotes || ''} onChange={e => setForm({ ...form, additionalNotes: e.target.value })} /></div>
        </div>
      </FormModal>

      <ConfirmDialog show={!!showDelete} onClose={() => setShowDelete(null)} onConfirm={handleDelete} message="Delete this inquiry lead forever?" />

      <style jsx>{`
        .extra-small { font-size: 0.65rem; }
        .fw-800 { font-weight: 800; }
        .fw-900 { font-weight: 900; }
        .uppercase { text-transform: uppercase; }
        .avatar-initial { background-color: #eff6ff; color: #3b82f6; width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justifyContent: center; font-size: 0.85rem; font-weight: 900; border: 1px solid #dbeafe; }
        .ds-section-title { font-size: 0.65rem; font-weight: 900; text-transform: uppercase; color: #3b82f6; margin-bottom: 1.25rem; letter-spacing: 0.05em; border-left: 3px solid #3b82f6; padding-left: 10px; }
        .ds-side-panel { position: fixed; top: 0; right: -420px; width: 420px; height: 100vh; z-index: 1060; transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1); background: #fff; }
        .ds-side-panel.show { right: 0; }
        .ds-panel-scroll { padding-bottom: 40px; }
        .btn-white { background: #fff; }
      `}</style>
    </DashboardShell>
  );
}
