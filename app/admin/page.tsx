'use client';
import { useState, useEffect } from 'react';
import DashboardShell from '../../components/DashboardShell';
import { StatCard, LoadingSpinner, StatusBadge, DataTable } from '../../components/UIComponents';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/constants';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/admin')
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const inquiryColumns = [
    { key: 'studentName', label: 'Student Name' },
    { key: 'classSeeking', label: 'Class' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'dateOfInquiry', label: 'Date', render: (row) => new Date(row.dateOfInquiry).toLocaleDateString() }
  ];

  return (
    <DashboardShell role="admin">
      <div className="mb-5">
        <h2 className="fw-900 text-dark mb-1" style={{ letterSpacing: '-0.04em' }}>Dashboard Overview</h2>
        <p className="text-muted fw-semibold opacity-75">Real-time metrics and institutional insights.</p>
      </div>

      {loading ? <LoadingSpinner /> : data ? <>
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <StatCard horizontal={true} icon="bi-people-fill" iconBg="#eff6ff" label="Total Students" value={data.totalStudents} trend={12} />
          </div>
          <div className="col-md-3">
            <StatCard horizontal={true} icon="bi-person-badge-fill" iconBg="#f0fdf4" label="Total Staff" value={data.totalStaff} trend={5} />
          </div>
          <div className="col-md-3">
            <StatCard horizontal={true} icon="bi-currency-rupee" iconBg="#fffbeb" label="Fee Collected" value={formatCurrency(data.fee?.collected)} sub={`Target: ${formatCurrency(data.fee?.total)}`} />
          </div>
          <div className="col-md-3">
            <StatCard horizontal={true} icon="bi-person-plus-fill" iconBg="#fef2f2" label="New Inquiries" value={data.totalInquiries} trend={8} />
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ border: '1px solid #f1f5f9 !important' }}>
              <div className="card-header bg-white border-0 py-4 px-4 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-800" style={{ letterSpacing: '-0.01em' }}>Recent Admissions Inquiry</h5>
                <button className="btn btn-light btn-sm text-primary fw-bold px-3 rounded-3">View All</button>
              </div>
              <div className="card-body p-0">
                <DataTable columns={inquiryColumns} data={data.recentInquiries || []} />
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100" style={{ border: '1px solid #f1f5f9 !important' }}>
              <div className="card-header bg-white border-0 py-4 px-4">
                <h5 className="mb-0 fw-800" style={{ letterSpacing: '-0.01em' }}>Class Strength</h5>
              </div>
              <div className="card-body px-4 pb-4">
                {(data.classWise || []).length > 0 ? (
                  data.classWise.slice(0, 7).map((c, i) => (
                    <div key={i} className="mb-4">
                      <div className="d-flex justify-content-between small mb-2">
                        <span className="fw-bold text-dark">Class {c._id.class} - {c._id.section}</span>
                        <span className="text-muted fw-semibold">{c.count} Students</span>
                      </div>
                      <div className="progress" style={{ height: '8px', borderRadius: '10px', background: '#f1f5f9' }}>
                        <div className="progress-bar" style={{
                          width: `${Math.min((c.count / 40) * 100, 100)}%`,
                          borderRadius: '10px',
                          background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)'
                        }}></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-bar-chart text-muted fs-1 mb-2"></i>
                    <p className="text-muted small">No class data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </> : (
        <div className="text-center py-5 card border-0 shadow-sm rounded-4">
          <i className="bi bi-exclamation-circle text-danger fs-1 mb-3"></i>
          <h5 className="fw-bold">Failed to load dashboard</h5>
          <p className="text-muted">Please check your connection and try again.</p>
          <button className="btn btn-primary px-4" onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}
    </DashboardShell>
  );
}
