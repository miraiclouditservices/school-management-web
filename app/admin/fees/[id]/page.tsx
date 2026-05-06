'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardShell from '../../../../components/DashboardShell';
import { LoadingSpinner, StatusBadge } from '../../../../components/UIComponents';
import api from '../../../../lib/api';
import { formatDate, formatCurrency } from '../../../../lib/constants';

export default function ViewFeePage() {
  const router = useRouter();
  const { id } = useParams();
  const [fee, setFee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/fees/${id}`);
        setFee(res.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <DashboardShell role="admin" hideSidebar={true} hideTopBar={true}><div className="p-5 text-center"><LoadingSpinner /></div></DashboardShell>;
  if (!fee) return <DashboardShell role="admin" hideSidebar={true} hideTopBar={true}><div className="p-5 text-center text-muted">Fee record not found</div></DashboardShell>;

  return (
    <DashboardShell role="admin" hideSidebar={true} hideTopBar={true}>
      {/* FIXED HEADER */}
      <header className="sticky-top bg-white border-bottom shadow-sm" style={{ zIndex: 1100 }}>
        <div className="container-fluid py-2 px-4" style={{ maxWidth: '1200px' }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <button type="button" className="btn btn-light rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm" onClick={() => router.back()} style={{ width:'32px', height:'32px' }}>
                <i className="bi bi-arrow-left fs-6"/>
              </button>
              <div>
                <h6 className="fw-800 mb-0 text-dark">Financial Ledger</h6>
                <p className="text-muted extra-small fw-bold mb-0 text-uppercase opacity-75">Viewing: {fee.student?.firstName} {fee.student?.lastName}</p>
              </div>
            </div>
            <div className="d-flex gap-2">
               <button className="btn btn-light rounded-pill px-3 py-1 fw-bold extra-small" onClick={() => window.print()}><i className="bi bi-printer me-2"/>Print Receipt</button>
               <button className="btn btn-primary shadow-sm rounded-pill px-4 py-1 fw-800 extra-small"><i className="bi bi-download me-2"/>Download PDF</button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-fluid py-4" style={{ maxWidth: '1200px' }}>
        <div className="row g-4">
           {/* Student Sidebar Info */}
           <div className="col-lg-3">
              <div className="card border-0 premium-shadow rounded-4 bg-white sticky-top" style={{ top: '80px', zIndex: 1000 }}>
                 <div className="card-body p-4 text-center">
                    <div className="ds-user-avatar mx-auto mb-3 shadow-sm border" style={{ width: '70px', height: '70px', fontSize: '1.5rem', borderRadius: '20px' }}>{(fee.student?.firstName || 'S')[0]}</div>
                    <h6 className="fw-800 text-dark mb-1 small">{fee.student?.firstName} {fee.student?.lastName}</h6>
                    <div className="text-muted extra-small fw-bold mb-3">ID: {fee.student?.admissionNo}</div>
                    <StatusBadge status={fee.feeStatus} />
                    
                    <div className="border-top mt-4 pt-4 text-start">
                       <div className="mb-3 text-center">
                          <div className="info-label opacity-50">Current Outstanding</div>
                          <div className="fs-5 fw-800 text-danger">{formatCurrency(fee.balanceDue)}</div>
                       </div>
                       <div className="mb-2">
                          <div className="info-label">Academic Placement</div>
                          <div className="fw-bold text-dark extra-small">Class {fee.student?.currentClass} - {fee.student?.section}</div>
                       </div>
                       <div className="mb-2">
                          <div className="info-label">Last Payment</div>
                          <div className="fw-bold text-dark extra-small">{fee.lastPaymentDate ? formatDate(fee.lastPaymentDate) : 'No payments yet'}</div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Main Ledger Area */}
           <div className="col-lg-9">
              <div className="row g-4">
                 {/* Breakdown */}
                 <div className="col-md-7">
                    <div className="card border-0 premium-shadow rounded-4 bg-white h-100 p-4">
                       <h6 className="info-label text-primary mb-4 d-flex align-items-center"><i className="bi bi-pie-chart-fill me-2"/>Annual Fee Breakdown</h6>
                       <div className="d-flex flex-column gap-3">
                          {[
                            { label: 'Tuition & Academic Fee', value: fee.tuitionFee },
                            { label: 'Transport & Commute', value: fee.transportFee },
                            { label: 'Lab & Infrastructure', value: fee.labFee },
                            { label: 'Books & Learning Material', value: fee.booksFee },
                            { label: 'Extra-Curricular Activities', value: fee.activityFee }
                          ].map((f, i) => (
                            <div key={i} className="d-flex justify-content-between align-items-center pb-2 border-bottom border-light">
                               <span className="extra-small fw-bold text-muted">{f.label}</span>
                               <span className="small fw-800 text-dark">{formatCurrency(f.value || 0)}</span>
                            </div>
                          ))}
                          <div className="d-flex justify-content-between align-items-center pt-3 bg-light-subtle p-3 rounded-3 mt-2">
                             <span className="small fw-800 text-primary uppercase">TOTAL NET ANNUAL FEE</span>
                             <span className="fs-6 fw-900 text-primary">{formatCurrency(fee.netFee || fee.totalFee)}</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Stats */}
                 <div className="col-md-5">
                    <div className="d-flex flex-column gap-3 h-100">
                       <div className="card border-0 premium-shadow rounded-4 bg-success bg-opacity-10 border border-success border-opacity-10 p-4 text-center">
                          <div className="info-label text-success mb-1">Total Amount Received</div>
                          <div className="fs-3 fw-900 text-success">{formatCurrency(fee.paidAmount)}</div>
                          <div className="extra-small text-success opacity-75 fw-bold mt-1">SUCCESSFULLY COLLECTED</div>
                       </div>
                       <div className="card border-0 premium-shadow rounded-4 bg-white p-4 h-100">
                          <h6 className="info-label text-dark mb-4 d-flex align-items-center"><i className="bi bi-calendar-check me-2"/>Financial Roadmap</h6>
                          <div className="timeline-high-density">
                             {fee.installments && fee.installments.length > 0 ? fee.installments.map((inst: any, i: number) => (
                               <div key={i} className={`timeline-step ${inst.status === 'Paid' ? 'completed' : 'pending'}`}>
                                  <div className="timeline-marker">
                                     {inst.status === 'Paid' ? <i className="bi bi-check-lg"/> : <span>{i+1}</span>}
                                  </div>
                                  <div className="timeline-content p-2 rounded-3 border mb-3">
                                     <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                           <div className="extra-small fw-800 text-dark">{inst.name}</div>
                                           <div className="text-muted fw-bold" style={{fontSize:'0.55rem'}}>DUE: {formatDate(inst.dueDate)}</div>
                                        </div>
                                        <div className="text-end">
                                           <div className="extra-small fw-900 text-primary">{formatCurrency(inst.amount)}</div>
                                           <span className={`badge rounded-pill extra-small px-2 ${inst.status === 'Paid' ? 'bg-success bg-opacity-10 text-success' : 'bg-primary bg-opacity-10 text-primary'}`} style={{fontSize:'0.5rem'}}>{inst.status.toUpperCase()}</span>
                                        </div>
                                     </div>
                                  </div>
                               </div>
                             )) : (
                               <div className="text-center py-5 opacity-50">
                                  <div className="ds-user-avatar mx-auto mb-3 bg-light text-muted" style={{width:50, height:50, borderRadius:15}}><i className="bi bi-calendar-x"/></div>
                                  <div className="extra-small fw-800 text-uppercase">No Active Roadmap</div>
                                  <div className="text-muted" style={{fontSize:'0.55rem'}}>Standard payment plan has not been generated for this student.</div>
                               </div>
                             )}
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Transaction Table */}
                 <div className="col-12">
                    <div className="card border-0 premium-shadow rounded-4 bg-white p-4">
                       <div className="d-flex justify-content-between align-items-center mb-4">
                          <h6 className="info-label text-dark mb-0 d-flex align-items-center"><i className="bi bi-clock-history me-2"/>Recent Transaction History</h6>
                          <span className="badge bg-light text-dark extra-small border fw-bold">{fee.payments?.length || 0} Transactions</span>
                       </div>
                       <div className="table-responsive">
                          <table className="table table-hover align-middle mb-0">
                             <thead className="bg-light-subtle">
                                <tr>
                                   <th className="info-label border-0 py-3 ps-3">Receipt No</th>
                                   <th className="info-label border-0 py-3">Payment Date</th>
                                   <th className="info-label border-0 py-3">Collection Method</th>
                                   <th className="info-label border-0 py-3 text-end pe-3">Received Amount</th>
                                </tr>
                             </thead>
                             <tbody>
                                {fee.payments?.slice().reverse().map((p: any, i: number) => (
                                  <tr key={i}>
                                     <td className="ps-3 py-3 fw-900 extra-small text-dark">{p.receiptNo}</td>
                                     <td className="extra-small fw-bold text-muted">{formatDate(p.date)}</td>
                                     <td><span className="badge bg-white text-primary border border-primary border-opacity-25 fw-bold" style={{fontSize:'0.6rem'}}>{p.mode}</span></td>
                                     <td className="text-end pe-3 fw-900 text-success extra-small">{formatCurrency(p.amount)}</td>
                                  </tr>
                                ))}
                                {!fee.payments?.length && <tr><td colSpan={4} className="text-center py-5 text-muted extra-small">No transactions found for this student.</td></tr>}
                             </tbody>
                          </table>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <style jsx>{`
        .extra-small { font-size: 0.65rem; }
        .info-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 2px; }
        .premium-shadow { box-shadow: 0 5px 20px -5px rgba(0, 0, 0, 0.05) !important; }
        
        .timeline-high-density { position: relative; padding-left: 30px; }
        .timeline-high-density::before { content: ''; position: absolute; left: 14px; top: 0; bottom: 0; width: 1px; background: #f1f5f9; }
        .timeline-step { position: relative; }
        .timeline-marker { 
          position: absolute; left: -30px; width: 28px; height: 28px; 
          border-radius: 10px; background: #fff; border: 1px solid #f1f5f9; 
          display: flex; align-items: center; justify-content: center; 
          font-size: 0.65rem; font-weight: 800; color: #64748b; z-index: 1;
        }
        .timeline-step.completed .timeline-marker { background: #dcfce7; border-color: #bbf7d0; color: #16a34a; }
        .timeline-step.pending .timeline-marker { background: #eff6ff; border-color: #dbeafe; color: #2563eb; }
      `}</style>
    </DashboardShell>
  );
}
