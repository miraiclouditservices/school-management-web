'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardShell from '../../components/DashboardShell';
import { StatCard, LoadingSpinner, DataTable, StatusBadge } from '../../components/UIComponents';
import EventsNoticesWidget from '../../components/EventsNoticesWidget';
import api from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/constants';

export default function StudentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/students/me')
      .then(r => { 
        if (r.success) {
          setData(r.data); 
        } else {
          setError(r.message || 'Failed to load profile');
        }
        setLoading(false); 
      })
      .catch(err => {
        setError(err.message || 'An error occurred while fetching your profile');
        setLoading(false);
      });
  }, []);

  if (loading) return <DashboardShell role="student"><div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}><LoadingSpinner /></div></DashboardShell>;
  
  if (error || !data) return (
    <DashboardShell role="student">
      <div className="alert alert-danger rounded-4 border-0 shadow-sm p-4 d-flex align-items-center gap-3">
        <i className="bi bi-exclamation-triangle-fill fs-4"></i>
        <div>
          <h6 className="mb-0 fw-bold">Dashboard Error</h6>
          <p className="mb-0 opacity-75">{error || 'Unable to retrieve student profile. Please contact administration.'}</p>
        </div>
      </div>
    </DashboardShell>
  );

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaysPeriods = data.timetable?.periods?.filter((p: any) => p.day === today) || [];

  return (
    <DashboardShell role="student">
      <div className="mb-4 animate__animated animate__fadeIn">
        <div className="d-flex align-items-center gap-3 mb-2">
          <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary fw-bold small px-3">
             {data.academicYear?.name || 'Academic Session 2024-25'}
          </div>
        </div>
        <h2 className="fw-900 text-dark mb-1" style={{ letterSpacing: '-0.04em', fontSize: '2.25rem' }}>
          Welcome Back, {data.firstName}! 👋
        </h2>
        <p className="text-muted fw-semibold opacity-75 fs-5">
          Class {data.currentClass} • Section {data.section} • Roll No: {data.rollNo || 'N/A'}
        </p>
      </div>

      <div className="row g-4 mb-5 animate__animated animate__fadeInUp">
        <div className="col-md-3">
          <StatCard
            horizontal={true}
            icon="bi-calendar-check"
            label="Attendance"
            value={`${data.attendance?.percentage || 0}%`}
          />
        </div>
        <div className="col-md-3">
          <StatCard
            horizontal={true}
            icon="bi-journal-check"
            label="Class Works"
            value={data.pendingTasks || 0}
            onClick={() => window.location.href = '/student/tasks'}
          />
        </div>
        <div className="col-md-3">
          <StatCard
            horizontal={true}
            icon="bi-wallet2"
            label="Fee Balance"
            value={formatCurrency(data.fee?.balanceDue || 0)}
          />
        </div>
        <div className="col-md-3">
          <StatCard
            horizontal={true}
            icon="bi-clock-history"
            label="Today's Periods"
            value={todaysPeriods.length}
          />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden animate__animated animate__fadeInLeft">
            <div className="card-header bg-white border-0 py-4 px-4 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0 fw-800">Today's Academic Schedule</h5>
                <p className="text-muted small mb-0 fw-medium">Your classes for {today}</p>
              </div>
              <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-bold">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="card-body p-0">
              {todaysPeriods.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="ps-4 small fw-bold text-muted border-0">TIME SLOT</th>
                        <th className="small fw-bold text-muted border-0">SUBJECT</th>
                        <th className="small fw-bold text-muted border-0">FACULTY</th>
                        <th className="pe-4 small fw-bold text-muted border-0 text-end">VENUE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todaysPeriods.map((p: any, i: number) => (
                        <tr key={i} className="border-bottom border-light">
                          <td className="ps-4 py-3">
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-clock text-primary small"></i>
                              <span className="fw-bold text-dark small">{p.startTime} - {p.endTime}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="fw-800 text-dark d-block">{p.subject}</span>
                            {p.isBreak && <span className="badge bg-warning-subtle text-warning small">{p.breakType}</span>}
                          </td>
                          <td className="py-3 text-muted fw-bold small">{p.teacherName || 'TBA'}</td>
                          <td className="pe-4 py-3 text-end">
                            <span className="badge bg-light text-primary border-0 rounded-3 px-3 py-2">
                              {p.room || 'Room -'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="bg-light d-inline-block p-4 rounded-circle mb-3">
                    <i className="bi bi-calendar-x text-muted fs-1"></i>
                  </div>
                  <h6 className="fw-800">No classes today</h6>
                  <p className="text-muted small px-5">Enjoy your free day or catch up on your assignments!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <EventsNoticesWidget role="student" />

          {/* RECENT PERFORMANCE */}
          <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <div className="card-header bg-white border-0 py-3 px-4 border-bottom d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-800 text-dark small uppercase">Performance Summary</h6>
              <Link href="/student/marks" className="extra-small fw-bold text-primary text-decoration-none">Report Card</Link>
            </div>
            <div className="card-body p-4">
              {data.marksSummary && data.marksSummary.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {data.marksSummary.map((mark: any, i: number) => (
                    <div key={i} className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="extra-small text-muted fw-bold mb-0 uppercase">{mark.subject}</p>
                        <p className="small fw-800 text-dark mb-0">{mark.examName}</p>
                      </div>
                      <div className="text-end">
                        <span className={`badge ${mark.grade === 'A+' || mark.grade === 'A' ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'} extra-small mb-1`}>{mark.grade}</span>
                        <p className="extra-small fw-bold text-dark mb-0">{mark.marks}/{mark.maxMarks}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 opacity-50">
                  <i className="bi bi-journal-check fs-2 mb-2 d-block text-muted"></i>
                  <p className="extra-small fw-bold mb-0 text-muted">No marks published yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 bg-dark text-white p-4" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="bg-white bg-opacity-10 rounded-3 p-2">
                <i className="bi bi-lightning-fill text-warning fs-4"></i>
              </div>
              <h6 className="mb-0 fw-bold">Quick Access</h6>
            </div>
            <div className="d-grid gap-2">
              <button className="btn btn-primary rounded-pill py-2 fw-800 border-0 shadow-sm extra-small" style={{ background: '#3b82f6' }}>
                <i className="bi bi-credit-card me-2"></i>Pay Fees Online
              </button>
              <button className="btn btn-outline-light rounded-pill py-2 fw-800 opacity-75 border-secondary extra-small">
                <i className="bi bi-file-earmark-text me-2"></i>Apply for Leave
              </button>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .fw-900 { font-weight: 900; }
        .fw-800 { font-weight: 800; }
        .extra-small { font-size: 0.65rem; }
        .uppercase { text-transform: uppercase; }
      `}</style>
    </DashboardShell>
  );
}
