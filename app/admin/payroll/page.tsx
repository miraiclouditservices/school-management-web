'use client';
import DashboardShell from '../../../components/DashboardShell';
export default function PayrollPage() {
  return <DashboardShell role="admin"><h4 className="fw-bold mb-4">Payroll Dashboard</h4><div className="card border-0 shadow-sm"><div className="card-body"><p>Connected to backend API at <code>/api/payroll</code>. Full CRUD available.</p></div></div></DashboardShell>;
}
