'use client';
import { useState, useEffect } from 'react';
import DashboardShell from '../../../components/DashboardShell';
import { LoadingSpinner, FormModal, StatusBadge, DataTable } from '../../../components/UIComponents';
import api from '../../../lib/api';
import { CLASSES, SECTIONS, PRIORITIES } from '../../../lib/constants';

export default function StaffTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetType: 'Class',
    className: '1',
    section: 'A',
    targetStudents: [] as string[],
    dueDate: '',
    priority: 'Medium',
    subject: 'General'
  });

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks');
      setTasks(res.data || []);
      const stuRes = await api.get('/students');
      setStudents(stuRes.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const filteredStudents = students.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => { loadTasks(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', formData);
      setShowModal(false);
      loadTasks();
      setFormData({ title: '', description: '', targetType: 'Class', className: '1', section: 'A', targetStudents: [], dueDate: '', priority: 'Medium', subject: 'General' });
    } catch (e) { alert('Failed to create task'); }
  };

  const columns = [
    { key: 'title', label: 'TITLE', render: (row: any) => <div className="fw-900 text-dark" style={{ fontFamily: 'Outfit', letterSpacing: '-0.02em' }}>{row.title}</div> },
    { key: 'class', label: 'TARGET', render: (row: any) => <span className="badge bg-light text-dark fw-800 rounded-pill px-3 py-2 border shadow-sm">Class {row.className} • {row.section}</span> },
    { key: 'dueDate', label: 'DUE DATE', render: (row: any) => (
      <div className="d-flex align-items-center gap-2">
        <i className="bi bi-clock-history text-danger small"></i>
        <span className="fw-800 text-muted small">{new Date(row.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
      </div>
    )},
    { key: 'status', label: 'STATUS', render: (row: any) => <StatusBadge status={row.status} /> },
    { key: 'submissions', label: 'SUBMISSIONS', render: (row: any) => <span className="fw-900 text-primary small bg-primary-subtle px-3 py-1 rounded-pill">{row.submissions?.length || 0} Students</span> },
  ];

  return (
    <DashboardShell role="staff">
      <div className="mb-4 d-flex justify-content-between align-items-center animate-fade-in">
        <div>
          <h2 className="fw-900 text-dark mb-1 letter-spacing-tight">Assignments & Works</h2>
          <p className="text-muted fw-semibold opacity-75">Publish and track class assignments for your students.</p>
        </div>
        <button className="btn btn-primary rounded-pill px-4 py-2 fw-900 shadow-premium hover-lift border-0" onClick={() => setShowModal(true)} style={{ background: 'var(--brand-gradient)' }}>
          <i className="bi bi-plus-lg me-2"></i>CREATE ASSIGNMENT
        </button>
      </div>

      <div className="row g-4 mb-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="col-md-4">
          <div className="card border-0 premium-glass rounded-4 p-4 h-100">
            <h6 className="extra-small fw-900 uppercase text-muted tracking-wider mb-3">Active Tasks</h6>
            <h2 className="fw-900 mb-0 text-dark">{tasks.length}</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 premium-glass rounded-4 p-4 h-100 border-start border-5 border-info">
            <h6 className="extra-small fw-900 uppercase text-info tracking-wider mb-3">Recent Submissions</h6>
            <h2 className="fw-900 mb-0 text-dark">0</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 premium-glass rounded-4 p-4 h-100 border-start border-5 border-success">
            <h6 className="extra-small fw-900 uppercase text-success tracking-wider mb-3">Avg. Grade</h6>
            <h2 className="fw-900 mb-0 text-dark">A+</h2>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-premium rounded-4 overflow-hidden bg-white animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <DataTable 
          columns={columns} 
          data={tasks} 
          loading={loading} 
          actions={(row) => (
            <div className="d-flex gap-2">
              <button className="btn btn-light btn-sm rounded-pill px-3 fw-bold border" onClick={() => {}}><i className="bi bi-eye me-2"></i>View</button>
              <button className="btn btn-light-danger btn-sm rounded-circle"><i className="bi bi-trash"></i></button>
            </div>
          )}
        />
        {!loading && tasks.length === 0 && (
          <div className="text-center py-5">
            <i className="bi bi-journal-text fs-1 text-muted opacity-25 mb-3 d-block"></i>
            <h5 className="fw-900 text-muted">No assignments created yet.</h5>
            <button className="btn btn-link text-primary fw-800" onClick={() => setShowModal(true)}>Create your first task</button>
          </div>
        )}
      </div>

      <FormModal show={showModal} onClose={() => setShowModal(false)} title="Create New Assignment" onSubmit={handleSubmit}>
        <div className="row g-4">
          <div className="col-12">
            <div className="role-tabs p-1 bg-light rounded-4 mb-3" style={{ maxWidth: '300px' }}>
              <button type="button" className={`btn btn-sm flex-fill rounded-3 fw-900 ${formData.targetType === 'Class' ? 'bg-white shadow-sm text-primary' : 'text-muted border-0'}`} onClick={() => setFormData({...formData, targetType: 'Class'})}>CLASS WISE</button>
              <button type="button" className={`btn btn-sm flex-fill rounded-3 fw-900 ${formData.targetType === 'Student' ? 'bg-white shadow-sm text-primary' : 'text-muted border-0'}`} onClick={() => setFormData({...formData, targetType: 'Student'})}>STUDENT WISE</button>
            </div>
          </div>
          
          <div className="col-12">
            <label className="extra-small fw-900 text-muted uppercase mb-2">Assignment Title</label>
            <input type="text" className="form-control border-0 bg-light-subtle p-3 fw-bold rounded-3" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Physics Lab Report - Waves" />
          </div>

          <div className="col-md-6">
            <label className="extra-small fw-900 text-muted uppercase mb-2">Subject</label>
            <input type="text" className="form-control border-0 bg-light-subtle p-3 fw-bold rounded-3" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="e.g. Mathematics" />
          </div>

          <div className="col-md-6">
            <label className="extra-small fw-900 text-muted uppercase mb-2">Deadline</label>
            <input type="date" className="form-control border-0 bg-light-subtle p-3 fw-bold rounded-3" required value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
          </div>

          {formData.targetType === 'Class' ? (
            <>
              <div className="col-md-6">
                <label className="extra-small fw-900 text-muted uppercase mb-2">Class</label>
                <select className="form-select border-0 bg-light-subtle p-3 fw-bold rounded-3" value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})}>
                  {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="extra-small fw-900 text-muted uppercase mb-2">Section</label>
                <select className="form-select border-0 bg-light-subtle p-3 fw-bold rounded-3" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})}>
                  {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </>
          ) : (
            <div className="col-12">
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="extra-small fw-900 text-muted uppercase mb-0">Search & Select Students ({formData.targetStudents.length} selected)</label>
                  <div className="d-flex gap-3">
                    <button type="button" className="btn btn-link p-0 extra-small fw-900 text-primary uppercase text-decoration-none" onClick={() => setFormData({...formData, targetStudents: students.map(s => s._id)})}>Select All</button>
                    <button type="button" className="btn btn-link p-0 extra-small fw-900 text-danger uppercase text-decoration-none" onClick={() => setFormData({...formData, targetStudents: []})}>Clear All</button>
                  </div>
                </div>
                <div className="position-relative">
                  <input type="text" className="form-control border-0 bg-light p-3 ps-5 fw-bold rounded-4 shadow-sm" placeholder="Search by name or Admission ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  <i className="bi bi-search position-absolute start-0 top-50 translate-middle-y ms-3 text-muted"></i>
                </div>
              </div>
              
              <div className="p-3 bg-light-subtle rounded-4 border shadow-inner" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                <div className="row g-2">
                  {filteredStudents.length > 0 ? filteredStudents.map(s => (
                    <div key={s._id} className="col-md-6">
                      <div className={`p-2 rounded-3 border d-flex align-items-center gap-3 transition-all cursor-pointer ${formData.targetStudents.includes(s._id) ? 'bg-white border-primary shadow-sm' : 'bg-transparent border-light'}`} onClick={() => {
                        const next = formData.targetStudents.includes(s._id) 
                          ? formData.targetStudents.filter(id => id !== s._id)
                          : [...formData.targetStudents, s._id];
                        setFormData({...formData, targetStudents: next});
                      }}>
                        <div className={`form-check-input m-0 rounded-circle border-2 ${formData.targetStudents.includes(s._id) ? 'bg-primary border-primary' : ''}`} style={{ width: '18px', height: '18px' }}>
                          {formData.targetStudents.includes(s._id) && <i className="bi bi-check text-white d-block" style={{ fontSize: '12px', marginTop: '-1px' }}></i>}
                        </div>
                        <div className="overflow-hidden">
                           <div className="fw-800 text-dark small text-truncate">{s.firstName} {s.lastName}</div>
                           <div className="extra-small text-muted fw-bold opacity-50">ID: {s.admissionNo}</div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="col-12 text-center py-4">
                      <p className="text-muted small fw-bold mb-0">No students found matching "{searchTerm}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="col-12">
            <label className="extra-small fw-900 text-muted uppercase mb-2">Instructions</label>
            <textarea className="form-control border-0 bg-light-subtle p-3 fw-bold rounded-3" rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Detailed instructions for the students..."></textarea>
          </div>
        </div>
      </FormModal>

      <style jsx>{`
        .bg-light-subtle { background: #f8fafc !important; border: 1px solid #eef2f6 !important; }
        .letter-spacing-tight { letter-spacing: -0.04em; }
      `}</style>
    </DashboardShell>
  );
}
