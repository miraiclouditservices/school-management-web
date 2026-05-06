'use client';
import { useState, useEffect } from 'react';
import DashboardShell from '../../../components/DashboardShell';
import { LoadingSpinner, StatusBadge, DataTable } from '../../../components/UIComponents';
import api from '../../../lib/api';

export default function StudentTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/my-tasks')
      .then(res => {
        setTasks(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'title', label: 'ASSIGNMENT', render: (row: any) => (
      <div>
        <div className="fw-900 text-dark" style={{ fontFamily: 'Outfit', letterSpacing: '-0.02em' }}>{row.title}</div>
        <div className="extra-small text-muted fw-bold uppercase mt-1">{row.subject}</div>
      </div>
    )},
    { key: 'assignedBy', label: 'TEACHER', render: (row: any) => (
      <div className="d-flex align-items-center gap-2">
        <div className="ds-user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>{row.assignedBy?.name?.charAt(0)}</div>
        <span className="fw-800 text-muted small">{row.assignedBy?.name}</span>
      </div>
    )},
    { key: 'dueDate', label: 'DEADLINE', render: (row: any) => (
      <div className="d-flex flex-column">
        <span className="fw-900 text-dark small">{new Date(row.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
        <span className="extra-small text-danger fw-bold uppercase">Before 5:00 PM</span>
      </div>
    )},
    { key: 'status', label: 'YOUR STATUS', render: (row: any) => (
      <StatusBadge status={row.isSubmitted ? 'Submitted' : 'Pending'} />
    )},
  ];

  return (
    <DashboardShell role="student">
      <div className="mb-4 d-flex justify-content-between align-items-center animate-fade-in">
        <div>
          <h2 className="fw-900 text-dark mb-1 letter-spacing-tight">Class Works</h2>
          <p className="text-muted fw-semibold opacity-75">Your active assignments and pending submissions.</p>
        </div>
        <div className="premium-glass px-4 py-2 rounded-pill d-flex align-items-center gap-3">
           <div className="text-end">
              <p className="extra-small text-muted fw-900 uppercase mb-0">Completion</p>
              <h5 className="fw-900 text-primary mb-0">{tasks.length > 0 ? Math.round((tasks.filter(t => t.isSubmitted).length / tasks.length) * 100) : 0}%</h5>
           </div>
           <div className="status-dot bg-primary"></div>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-premium rounded-4 overflow-hidden bg-white animate-fade-in">
              <div className="card-header bg-white border-0 py-4 px-4">
                <h5 className="mb-0 fw-900 text-dark">Active Assignments</h5>
              </div>
              <DataTable 
                columns={columns} 
                data={tasks} 
                loading={loading}
                onRowClick={(row) => alert('Task Details: ' + row.description)}
              />
              {tasks.length === 0 && (
                <div className="text-center py-5">
                  <i className="bi bi-emoji-smile fs-1 text-muted opacity-25 mb-3 d-block"></i>
                  <h6 className="fw-900 text-muted">All caught up! No pending tasks.</h6>
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-premium rounded-4 p-4 bg-white animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h6 className="extra-small fw-900 uppercase text-muted tracking-wider mb-4">Submission Summary</h6>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4 border border-white shadow-sm">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary-subtle p-2 rounded-3 text-primary"><i className="bi bi-journal-text"></i></div>
                    <span className="fw-900 text-dark small">Assigned</span>
                  </div>
                  <span className="fw-900 text-dark">{tasks.length}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4 border border-white shadow-sm">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-success-subtle p-2 rounded-3 text-success"><i className="bi bi-check-all"></i></div>
                    <span className="fw-900 text-dark small">Submitted</span>
                  </div>
                  <span className="fw-900 text-dark">{tasks.filter(t => t.isSubmitted).length}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4 border border-white shadow-sm">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-danger-subtle p-2 rounded-3 text-danger"><i className="bi bi-exclamation-circle"></i></div>
                    <span className="fw-900 text-dark small">Pending</span>
                  </div>
                  <span className="fw-900 text-dark">{tasks.filter(t => !t.isSubmitted).length}</span>
                </div>
              </div>

              <div className="mt-5 p-4 rounded-4 bg-primary text-white shadow-lg overflow-hidden position-relative">
                <div className="position-relative z-1">
                  <h5 className="fw-900 mb-2">Upcoming Deadline</h5>
                  <p className="small fw-bold opacity-75 mb-0">Finish your Math project before Monday morning!</p>
                </div>
                <i className="bi bi-lightning-fill position-absolute end-0 bottom-0 opacity-25" style={{ fontSize: '6rem', transform: 'rotate(-15deg)', marginRight: '-1rem', marginBottom: '-1rem' }}></i>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .letter-spacing-tight { letter-spacing: -0.04em; }
        .bg-primary { background: var(--brand-gradient) !important; }
      `}</style>
    </DashboardShell>
  );
}
