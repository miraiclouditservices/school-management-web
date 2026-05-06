'use client';
import { useState, useEffect } from 'react';
import DashboardShell from '../../../components/DashboardShell';
import { LoadingSpinner, DataTable, StatusBadge } from '../../../components/UIComponents';
import api from '../../../lib/api';
import { formatCurrency, formatDate } from '../../../lib/constants';

export default function FeesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/students/me')
      .then(r => {
        if (r.success) setData(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <DashboardShell role="student"><div className="d-flex justify-content-center py-5"><LoadingSpinner /></div></DashboardShell>;
  if (!data || !data.fee) return (
    <DashboardShell role="student">
      <div className="text-center py-5 bg-white rounded-4 shadow-sm mt-4">
        <i className="bi bi-wallet2 text-muted fs-1 mb-3 d-block opacity-25"></i>
        <h5 className="fw-800">No Fee Information Available</h5>
        <p className="text-muted">Please contact the accounts office for your fee details.</p>
      </div>
    </DashboardShell>
  );

  const fee = data.fee;
  const installments = fee.installments || [];

  const columns = [
    { key: 'name', label: 'INSTALLMENT' },
    { key: 'amount', label: 'AMOUNT', render: (row: any) => <span className="fw-800">{formatCurrency(row.amount)}</span> },
    { key: 'dueDate', label: 'DUE DATE', render: (row: any) => formatDate(row.dueDate) },
    { key: 'status', label: 'STATUS', render: (row: any) => <StatusBadge status={row.status} /> },
    { key: 'paidDate', label: 'PAID ON', render: (row: any) => formatDate(row.paidDate) },
  ];

  return (
    <DashboardShell role="student">
      <div className="mb-4">
        <h2 className="fw-900 text-dark mb-1" style={{ letterSpacing: '-0.04em' }}>Fee Statement</h2>
        <p className="text-muted fw-semibold opacity-75">Academic Year {fee.academicYear?.name || '2024-25'}</p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border-start border-primary border-4">
            <h6 className="text-muted small fw-bold mb-2">TOTAL FEE</h6>
            <h3 className="fw-900 mb-0">{formatCurrency(fee.totalFee)}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border-start border-success border-4">
            <h6 className="text-muted small fw-bold mb-2">PAID AMOUNT</h6>
            <h3 className="fw-900 mb-0 text-success">{formatCurrency(fee.paidAmount || 0)}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 text-white" style={{ background: fee.balanceDue > 0 ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <h6 className="small fw-bold mb-2 opacity-75">BALANCE DUE</h6>
            <h3 className="fw-900 mb-0">{formatCurrency(fee.balanceDue)}</h3>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 animate__animated animate__fadeIn">
        <div className="card-header bg-white border-0 py-4 px-4 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-800">Payment Breakdown</h5>
          <button className="btn btn-primary btn-sm px-4 rounded-pill fw-bold" disabled={fee.balanceDue === 0}>
            <i className="bi bi-credit-card me-2"></i>Pay Remaining Balance
          </button>
        </div>
        <div className="card-body p-0">
          <DataTable columns={columns} data={installments} loading={false} />
          {installments.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted mb-0">No installment details found.</p>
            </div>
          )}
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 bg-light border-0">
        <div className="d-flex gap-3">
          <div className="bg-white p-3 rounded-4 shadow-sm">
            <i className="bi bi-info-circle-fill text-primary fs-4"></i>
          </div>
          <div>
            <h6 className="fw-800 mb-1">Fee Policy Note</h6>
            <p className="small text-muted mb-0">
              Please note that a late fee of ₹100 per day will be applicable after the due date. 
              If you have already paid and it's not reflecting here, please contact the accounts department with your receipt.
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
