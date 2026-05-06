'use client';
import DashboardShell from '../../../components/DashboardShell';
export default function Page() {
  return <DashboardShell role="student"><h4 className="fw-bold mb-4">Notices</h4><div className="card border-0 shadow-sm"><div className="card-body"><p>Connected to backend API at <code>/api/notices</code></p></div></div></DashboardShell>;
}
