'use client';
import { useState, useEffect } from 'react';
import DashboardShell from '../../components/DashboardShell';
import { StatCard, LoadingSpinner } from '../../components/UIComponents';
import EventsNoticesWidget from '../../components/EventsNoticesWidget';
import api from '../../lib/api';
import Link from 'next/link';

export default function StaffDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/staff/dashboard')
      .then(r => {
        if (r.success) setData(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <DashboardShell role="staff"><div className="d-flex justify-content-center py-5"><LoadingSpinner /></div></DashboardShell>;

  return (
    <DashboardShell role="staff">
      <div className="mb-4">
        <h2 className="fw-900 text-dark mb-1" style={{ letterSpacing: '-0.04em' }}>Staff Dashboard</h2>
        <p className="text-muted fw-semibold opacity-75">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <StatCard icon="bi-people-fill" iconBg="#eef2ff" label="Total Students" value={data?.stats?.totalStudents || 0} />
        </div>
        <div className="col-md-3">
          <StatCard icon="bi-calendar-event" iconBg="#f0fdf4" label="Classes Today" value={data?.todayClasses?.length || 0} />
        </div>
        <div className="col-md-3">
          <StatCard icon="bi-journal-check" iconBg="#fffbeb" label="Pending Tasks" value={data?.stats?.pendingTasks || 0} />
        </div>
        <div className="col-md-3">
          <StatCard icon="bi-chat-left-text" iconBg="#fdf2f8" label="New Notices" value={data?.notices?.length || 0} />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div className="card-header bg-white border-0 py-4 px-4 border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-800">Today's Teaching Schedule</h5>
                <Link href="/staff/timetable" className="extra-small fw-bold text-primary text-decoration-none">VIEW FULL TIMETABLE</Link>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4 small fw-bold text-muted border-0">PERIOD</th>
                      <th className="small fw-bold text-muted border-0">SUBJECT</th>
                      <th className="small fw-bold text-muted border-0">CLASS & SECTION</th>
                      <th className="pe-4 small fw-bold text-muted border-0 text-end">TIME</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.todayClasses?.length > 0 ? data.todayClasses.map((cls: any, i: number) => (
                      <tr key={i} className="border-bottom-light">
                        <td className="ps-4 py-3">
                          <span className="badge bg-primary-subtle text-primary fw-bold">Period {cls.periodNo}</span>
                        </td>
                        <td className="fw-800 text-dark">{cls.subject}</td>
                        <td className="text-muted fw-bold small">
                          <span className="badge bg-light text-dark border px-2 py-1 rounded-pill me-1">{cls.className}</span>
                          <span className="badge bg-light text-dark border px-2 py-1 rounded-pill">{cls.section}</span>
                        </td>
                        <td className="pe-4 text-end text-primary fw-800 small">{cls.startTime} - {cls.endTime}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="text-center py-5">
                          <i className="bi bi-calendar-x fs-1 text-muted opacity-25 d-block mb-2"></i>
                          <p className="text-muted mb-0">No classes scheduled for today.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                <h6 className="fw-800 mb-3 text-primary uppercase extra-small">Quick Actions</h6>
                <div className="d-grid gap-2">
                  <Link href="/staff/attendance" className="btn btn-light border-0 text-start p-3 rounded-4 transition-all hover-lift fw-bold small">
                    <i className="bi bi-check2-square me-2 text-primary"></i> Mark Attendance
                  </Link>
                  <Link href="/staff/tasks" className="btn btn-light border-0 text-start p-3 rounded-4 transition-all hover-lift fw-bold small">
                    <i className="bi bi-plus-circle me-2 text-warning"></i> Create Assignment
                  </Link>
                  <Link href="/staff/marks" className="btn btn-light border-0 text-start p-3 rounded-4 transition-all hover-lift fw-bold small">
                    <i className="bi bi-journal-plus me-2 text-success"></i> Upload Marks
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                <h6 className="fw-800 mb-3 text-primary uppercase extra-small">Academic Progress</h6>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="bg-light p-3 rounded-4">
                    <i className="bi bi-graph-up text-primary fs-4"></i>
                  </div>
                  <div>
                    <p className="extra-small text-muted fw-bold mb-0">SYLLABUS COVERAGE</p>
                    <p className="fw-800 mb-0">78% Completed</p>
                  </div>
                </div>
                <div className="progress rounded-pill bg-light" style={{ height: 8 }}>
                  <div className="progress-bar bg-primary" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <EventsNoticesWidget role="staff" />
          
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-primary text-white premium-shadow">
            <h6 className="fw-800 mb-3">IT Support</h6>
            <p className="extra-small opacity-75 mb-4">Facing technical issues? Our support team is here to help you 24/7.</p>
            <button className="btn btn-white w-100 rounded-pill extra-small fw-800 py-2">GET HELP NOW</button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .extra-small { font-size: 0.65rem; }
        .fw-800 { font-weight: 800; }
        .premium-shadow { box-shadow: 0 20px 40px -12px rgba(37, 99, 235, 0.25) !important; }
        .btn-white { background: #fff; border: none; color: #3b82f6; }
      `}</style>
    </DashboardShell>
  );
}
