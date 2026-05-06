'use client';
import { useState, useEffect } from 'react';
import DashboardShell from '../../../components/DashboardShell';
import { StatCard, DataTable, StatusBadge, Pagination, FormModal, ConfirmDialog, LoadingSpinner } from '../../../components/UIComponents';
import api from '../../../lib/api';
import { NOTICE_CATEGORIES, EVENT_AUDIENCE, PRIORITIES, formatDate } from '../../../lib/constants';

export default function EventsAndNoticesPage() {
  const [activeTab, setActiveTab] = useState<'notices' | 'events'>('notices');
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState<any>({ notices: 0, events: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState<any>({});
  const [showDelete, setShowDelete] = useState(null);
  const [academicYears, setAcademicYears] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [nRes, eRes, ayRes] = await Promise.all([
        api.get('/notices'),
        api.get('/events'),
        api.get('/academic-years')
      ]);
      setNotices(nRes.data || []);
      setEvents(eRes.data || []);
      setAcademicYears(ayRes.data || []);
      setStats({
        notices: nRes.data?.length || 0,
        events: eRes.data?.length || 0,
        upcomingEvents: eRes.data?.filter((e: any) => e.status === 'Upcoming').length || 0
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const endpoint = activeTab === 'notices' ? '/notices' : '/events';
      if (editItem) await api.put(`${endpoint}/${editItem._id}`, form);
      else await api.post(endpoint, form);
      setShowForm(false); setEditItem(null); loadData();
    } catch (e: any) { alert(e.message); }
  };

  const handleDelete = async () => {
    const endpoint = activeTab === 'notices' ? '/notices' : '/events';
    await api.delete(`${endpoint}/${showDelete._id}`);
    setShowDelete(null); loadData();
  };

  const openAdd = () => {
    setEditItem(null);
    setForm(activeTab === 'notices' ? { 
      category: 'Academic', audience: 'All', priority: 'Medium' 
    } : { 
      status: 'Upcoming', audience: 'All', date: new Date().toISOString().split('T')[0] 
    });
    setShowForm(true);
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({ ...item, date: item.date?.substring(0, 10), endDate: item.endDate?.substring(0, 10) });
    setShowForm(true);
  };

  const noticeColumns = [
    { label: 'Title', key: 'title', render: (r: any) => <div className="fw-800 text-dark small">{r.title}</div> },
    { label: 'Category', key: 'category', render: (r: any) => <span className="badge bg-light text-primary border extra-small fw-bold">{r.category}</span> },
    { label: 'Audience', key: 'audience', render: (r: any) => <span className="extra-small fw-bold text-muted">{r.audience}</span> },
    { label: 'Priority', key: 'priority', render: (r: any) => (
      <span className={`extra-small fw-900 uppercase ${r.priority === 'High' ? 'text-danger' : r.priority === 'Medium' ? 'text-warning' : 'text-info'}`}>
        {r.priority}
      </span>
    )},
    { label: 'Date', key: 'publishedOn', render: (r: any) => <span className="extra-small text-muted">{formatDate(r.publishedOn)}</span> }
  ];

  const eventColumns = [
    { label: 'Event Name', key: 'name', render: (r: any) => <div className="fw-800 text-dark small">{r.name}</div> },
    { label: 'Date', key: 'date', render: (r: any) => <span className="extra-small fw-bold text-primary"><i className="bi bi-calendar-event me-1"/>{formatDate(r.date)}</span> },
    { label: 'Venue', key: 'venue', render: (r: any) => <span className="extra-small text-muted">{r.venue || 'N/A'}</span> },
    { label: 'Status', key: 'status', render: (r: any) => <StatusBadge status={r.status} /> }
  ];

  return (
    <DashboardShell role="admin">
      <div className="container-fluid py-4">
        {/* STATS */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
             <StatCard horizontal={true} icon="bi-megaphone" label="Active Notices" value={stats.notices} iconBg="rgba(14, 165, 233, 0.1)" />
          </div>
          <div className="col-md-4">
             <StatCard horizontal={true} icon="bi-calendar-check" label="Total Events" value={stats.events} iconBg="rgba(16, 185, 129, 0.1)" />
          </div>
          <div className="col-md-4">
             <StatCard horizontal={true} icon="bi-clock-history" label="Upcoming Events" value={stats.upcomingEvents} iconBg="rgba(245, 158, 11, 0.1)" />
          </div>
        </div>

        {/* TABS & ACTIONS */}
        <div className="card border-0 premium-shadow rounded-4 bg-white overflow-hidden">
          <div className="card-header bg-white border-0 p-4">
            <div className="d-flex justify-content-between align-items-center">
              <div className="nav nav-pills gap-2 bg-light p-1 rounded-4">
                <button className={`nav-link rounded-4 extra-small fw-800 px-4 ${activeTab === 'notices' ? 'active shadow-sm' : 'text-muted'}`} onClick={() => setActiveTab('notices')}>Notice Board</button>
                <button className={`nav-link rounded-4 extra-small fw-800 px-4 ${activeTab === 'events' ? 'active shadow-sm' : 'text-muted'}`} onClick={() => setActiveTab('events')}>Event Calendar</button>
              </div>
              <button className="btn btn-primary rounded-pill px-4 py-2 fw-bold extra-small shadow-sm" onClick={openAdd}>
                <i className={`bi bi-plus-lg me-2`}/>Add {activeTab === 'notices' ? 'Notice' : 'Event'}
              </button>
            </div>
          </div>

          <div className="card-body p-0">
            {loading ? <div className="p-5 text-center"><LoadingSpinner /></div> : (
              <DataTable 
                columns={activeTab === 'notices' ? noticeColumns : eventColumns} 
                data={activeTab === 'notices' ? notices : events} 
                actions={(row: any) => (
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-light rounded-circle" onClick={() => openEdit(row)} title="Edit"><i className="bi bi-pencil small text-primary" /></button>
                    <button className="btn btn-sm btn-light rounded-circle" onClick={() => setShowDelete(row)} title="Delete"><i className="bi bi-trash small text-danger" /></button>
                  </div>
                )}
              />
            )}
          </div>
        </div>
      </div>

      {/* FORM MODAL */}
      <FormModal show={showForm} onClose={() => setShowForm(false)} title={`${editItem ? 'Edit' : 'Add'} ${activeTab === 'notices' ? 'Notice' : 'Event'}`} onSubmit={handleSubmit}>
        <div className="row g-3">
          {activeTab === 'notices' ? (
            <>
              <div className="col-12"><label className="form-label small fw-bold">Title *</label><input className="form-control rounded-3" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="col-md-6"><label className="form-label small fw-bold">Category *</label><select className="form-select rounded-3" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })}>{NOTICE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div className="col-md-6"><label className="form-label small fw-bold">Priority</label><select className="form-select rounded-3" value={form.priority || 'Medium'} onChange={e => setForm({ ...form, priority: e.target.value })}>{PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
              <div className="col-md-6"><label className="form-label small fw-bold">Audience</label><select className="form-select rounded-3" value={form.audience || 'All'} onChange={e => setForm({ ...form, audience: e.target.value })}><option>All</option><option>Students</option><option>Parents</option><option>Staff</option></select></div>
              <div className="col-md-6"><label className="form-label small fw-bold">Academic Year</label><select className="form-select rounded-3" value={form.academicYear || ''} onChange={e => setForm({ ...form, academicYear: e.target.value })}><option value="">Select Year</option>{academicYears.map((ay: any) => <option key={ay._id} value={ay._id}>{ay.name}</option>)}</select></div>
              <div className="col-12"><label className="form-label small fw-bold">Content</label><textarea className="form-control rounded-3" rows={4} value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} /></div>
            </>
          ) : (
            <>
              <div className="col-12"><label className="form-label small fw-bold">Event Name *</label><input className="form-control rounded-3" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="col-md-6"><label className="form-label small fw-bold">Start Date *</label><input type="date" className="form-control rounded-3" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} required /></div>
              <div className="col-md-6"><label className="form-label small fw-bold">End Date</label><input type="date" className="form-control rounded-3" value={form.endDate || ''} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
              <div className="col-md-6"><label className="form-label small fw-bold">Time</label><input className="form-control rounded-3" placeholder="e.g., 10:00 AM" value={form.time || ''} onChange={e => setForm({ ...form, time: e.target.value })} /></div>
              <div className="col-md-6"><label className="form-label small fw-bold">Venue</label><input className="form-control rounded-3" value={form.venue || ''} onChange={e => setForm({ ...form, venue: e.target.value })} /></div>
              <div className="col-md-6"><label className="form-label small fw-bold">Status</label><select className="form-select rounded-3" value={form.status || 'Upcoming'} onChange={e => setForm({ ...form, status: e.target.value })}><option>Upcoming</option><option>In Progress</option><option>Completed</option><option>Cancelled</option></select></div>
              <div className="col-md-6"><label className="form-label small fw-bold">Audience</label><select className="form-select rounded-3" value={form.audience || 'All'} onChange={e => setForm({ ...form, audience: e.target.value })}><option>All</option><option>Students</option><option>Parents</option><option>Staff</option><option>Students, Parents</option></select></div>
              <div className="col-12"><label className="form-label small fw-bold">Description</label><textarea className="form-control rounded-3" rows={3} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            </>
          )}
        </div>
      </FormModal>

      <ConfirmDialog show={!!showDelete} onClose={() => setShowDelete(null)} onConfirm={handleDelete} message={`Delete this ${activeTab === 'notices' ? 'notice' : 'event'}?`} />

      <style jsx>{`
        .extra-small { font-size: 0.65rem; }
        .fw-800 { font-weight: 800; }
        .premium-shadow { box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05) !important; }
        .nav-pills .nav-link.active { background: #fff; color: #3b82f6 !important; }
      `}</style>
    </DashboardShell>
  );
}
