'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '../../../components/DashboardShell';
import {
   StatCard, LoadingSpinner, FormModal
} from '../../../components/UIComponents';
import api from '../../../lib/api';

interface Transaction {
   _id: string;
   voucherNo: string;
   date: string;
   type: 'Income' | 'Expense';
   category: string;
   description: string;
   amount: number;
   paymentMode: string;
   relatedTo: string;
}

interface StaffPayroll {
   _id: string;
   name: string;
   department: string;
   designation: string;
   basicSalary: number;
   lastPaymentMonth: string;
   status: 'Paid' | 'Pending' | 'Partial' | 'Active';
   photo?: string;
   bankName?: string;
}

export default function AccountsDashboard() {
   const router = useRouter();
   const [loading, setLoading] = useState(true);
   const [transactions, setTransactions] = useState<Transaction[]>([]);
   const [staffList, setStaffList] = useState<StaffPayroll[]>([]);
   const [summary, setSummary] = useState({
      totalIncome: 0,
      totalExpense: 0,
      netProfit: 0,
      pendingSalaries: 0
   });

   const [txFilters, setTxFilters] = useState({ type: '', category: '' });
   const [showPayModal, setShowPayModal] = useState(false);
   const [showSuccess, setShowSuccess] = useState(false);
   const [selectedStaff, setSelectedStaff] = useState<StaffPayroll | null>(null);
   const [payData, setPayData] = useState({
      month: 'May',
      year: '2026',
      amount: 0,
      paymentMode: 'Cash'
   });

   const [registryFilter, setRegistryFilter] = useState('All');

   const loadData = async () => {
      setLoading(true);
      try {
         const [sumRes, txRes, staffRes] = await Promise.all([
            api.get<any>('/accounts/summary'),
            api.get<Transaction[]>('/accounts', txFilters),
            api.get<any>('/accounts/staff-stats') // Changed from /staff to /accounts/staff-stats
         ]);

         setSummary(sumRes.data || { totalIncome: 0, totalExpense: 0, netProfit: 0, pendingSalaries: 0 });
         setTransactions(txRes.data || []);
         setStaffList(staffRes.data || []);
      } catch (e) { console.error(e); }
      setLoading(false);
   };

   useEffect(() => { loadData(); }, [txFilters]);

   const filteredStaff = staffList.filter(s => {
      if (registryFilter === 'Pending') return s.status === 'Pending';
      if (registryFilter === 'Paid') return s.status === 'Paid';
      return true;
   });

   const handlePayClick = (staff: StaffPayroll) => {
      setSelectedStaff(staff);
      setPayData({ ...payData, amount: staff.basicSalary });
      setShowPayModal(true);
   };

   const processPayment = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedStaff) return;
      try {
         await api.post('/accounts/pay-salary', {
            staffId: selectedStaff._id,
            ...payData
         });
         setShowPayModal(false);
         setShowSuccess(true);
         setTimeout(() => setShowSuccess(false), 3000);
         loadData();
      } catch (e) { console.error(e); }
   };

   const formatCurrency = (val: number) => `₹${(val || 0).toLocaleString('en-IN')}`;
   const formatDate = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
   };

   return (
      <DashboardShell role="admin">
         {/* SUCCESS NOTIFICATION */}
         {showSuccess && (
            <div className="position-fixed top-0 start-50 translate-middle-x mt-4 z-index-master">
               <div className="alert alert-success premium-shadow border-0 rounded-pill px-4 py-2 d-flex align-items-center gap-2 slide-down">
                  <i className="bi bi-check-circle-fill fs-5" />
                  <span className="fw-800 extra-small">Salary Disbursement Successful! Ledger Updated.</span>
               </div>
            </div>
         )}

         {/* PROFESSIONAL HEADER */}
         <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
               <h4 className="fw-800 mb-0">Accounts & Payroll</h4>
               <div className="d-flex align-items-center gap-2">
                  <p className="text-muted extra-small fw-bold mb-0 text-uppercase opacity-75">Institutional Financial Ledger</p>
                  <div className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 extra-small">Live Sync: Active</div>
               </div>
            </div>
            <div className="d-flex gap-2">
               <button className="btn btn-white btn-sm px-3 rounded-pill premium-shadow border-0 extra-small fw-bold text-dark"><i className="bi bi-file-earmark-spreadsheet me-1" />Financial Report</button>
               <button className="btn btn-primary btn-sm px-4 rounded-pill premium-shadow border-0 extra-small fw-800" onClick={() => router.push('/admin/accounts/bulk')}><i className="bi bi-wallet2 me-1" />Bulk Salary Process</button>
            </div>
         </div>

         {/* HORIZONTAL FINANCIAL CARDS */}
         <div className="row g-3 mb-4">
            <div className="col-md-3 col-6">
               <StatCard horizontal={true} icon="bi-graph-up-arrow" iconBg="rgba(16, 185, 129, 0.1)" label="Total Revenue" value={formatCurrency(summary.totalIncome)} />
            </div>
            <div className="col-md-3 col-6">
               <StatCard horizontal={true} icon="bi-graph-down-arrow" iconBg="rgba(239, 68, 68, 0.1)" label="Total Expenses" value={formatCurrency(summary.totalExpense)} />
            </div>
            <div className="col-md-3 col-6">
               <StatCard horizontal={true} icon="bi-safe2" iconBg="rgba(59, 130, 246, 0.1)" label="Net Surplus" value={formatCurrency(summary.netProfit)} />
            </div>
            <div className="col-md-3 col-6">
               <StatCard horizontal={true} icon="bi-cash-stack" iconBg="rgba(245, 158, 11, 0.1)" label="Pending Dues" value={formatCurrency(summary.pendingSalaries)} />
            </div>
         </div>

         <div className="row g-4">
            {/* RECENT TRANSACTIONS LEDGER WITH FILTERING */}
            <div className="col-12">
               <div className="card border-0 premium-shadow rounded-4 bg-white overflow-hidden">
                  <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                     <h6 className="fw-800 text-dark mb-0 extra-small text-uppercase d-flex align-items-center gap-2">
                        <i className="bi bi-journal-text text-primary" /> Institutional Transaction Ledger
                     </h6>
                     <div className="d-flex align-items-center gap-2">
                        <select className="form-select form-select-sm border-0 bg-light extra-small fw-bold rounded-pill px-3" value={txFilters.type} onChange={e => setTxFilters({ ...txFilters, type: e.target.value })}>
                           <option value="">All Types</option>
                           <option value="Income">Income Only</option>
                           <option value="Expense">Expense Only</option>
                        </select>
                        <select className="form-select form-select-sm border-0 bg-light extra-small fw-bold rounded-pill px-3" value={txFilters.category} onChange={e => setTxFilters({ ...txFilters, category: e.target.value })}>
                           <option value="">All Categories</option>
                           <option value="Salaries">Salaries</option>
                           <option value="Fees">Fees</option>
                           <option value="Utilities">Utilities</option>
                        </select>
                        <button className="btn btn-light btn-sm rounded-circle shadow-sm" onClick={() => loadData()}><i className="bi bi-arrow-clockwise" /></button>
                        <button className="btn btn-primary btn-sm extra-small fw-bold rounded-pill px-3" onClick={() => router.push('/admin/accounts/history')}>View Full History</button>
                     </div>
                  </div>
                  <div className="table-responsive" style={{ maxHeight: '400px' }}>
                     <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light sticky-top" style={{ zIndex: 10 }}>
                           <tr>
                              <th className="info-label border-0 ps-4 py-3">Voucher & Date</th>
                              <th className="info-label border-0 py-3">Category</th>
                              <th className="info-label border-0 py-3">Reference / Description</th>
                              <th className="info-label border-0 py-3 text-end">Amount</th>
                              <th className="info-label border-0 pe-4 py-3 text-end">Channel</th>
                           </tr>
                        </thead>
                        <tbody>
                           {loading ? (
                              <tr><td colSpan={5} className="text-center py-5"><LoadingSpinner /></td></tr>
                           ) : transactions.length > 0 ? transactions.map(tx => (
                              <tr key={tx._id}>
                                 <td className="ps-4">
                                    <div className="fw-900 text-dark extra-small mb-1">{tx.voucherNo}</div>
                                    <div className="text-muted fw-800" style={{ fontSize: '0.65rem' }}><i className="bi bi-calendar-event me-1" />{formatDate(tx.date)}</div>
                                 </td>
                                 <td>
                                    <span className={`badge rounded-pill extra-small fw-bold px-2 py-1 ${tx.type === 'Income' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                       {tx.category}
                                    </span>
                                 </td>
                                 <td>
                                    <div className="text-dark extra-small fw-900">{tx.relatedTo}</div>
                                    <div className="text-muted fw-bold text-truncate" style={{ fontSize: '0.6rem', maxWidth: '250px' }}>{tx.description || '-'}</div>
                                 </td>
                                 <td className={`text-end fw-900 extra-small ${tx.type === 'Income' ? 'text-success' : 'text-danger'}`}>
                                    {tx.type === 'Income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                 </td>
                                 <td className="pe-4 text-end">
                                    <div className="badge bg-white text-dark extra-small fw-bold border shadow-sm px-2 py-1">{tx.paymentMode}</div>
                                 </td>
                              </tr>
                           )) : (
                              <tr><td colSpan={5} className="text-center py-5">
                                 <div className="opacity-25 mb-2"><i className="bi bi-inbox fs-2" /></div>
                                 <div className="text-muted extra-small fw-bold">No financial records matching your filters.</div>
                              </td></tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>

            {/* PAYROLL MANAGEMENT TABLE */}
            <div className="col-12">
               <div className="card border-0 premium-shadow rounded-4 bg-white overflow-hidden mb-5">
                  <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                     <h6 className="fw-800 text-primary mb-0 extra-small text-uppercase d-flex align-items-center gap-2">
                        <i className="bi bi-people-fill" /> Staff Payroll Management Registry
                     </h6>
                     <div className="d-flex gap-2 align-items-center">
                        <div className="btn-group btn-group-sm rounded-pill overflow-hidden premium-shadow me-2">
                           {['All', 'Pending', 'Paid'].map(f => (
                              <button key={f} className={`btn extra-small fw-800 px-3 border-0 ${registryFilter === f ? 'btn-primary' : 'btn-light text-muted'}`} onClick={() => setRegistryFilter(f)}>{f}</button>
                           ))}
                        </div>
                        <button className="btn btn-outline-primary btn-sm extra-small fw-bold rounded-pill px-3" onClick={() => router.push('/admin/staff')}>Registry Control</button>
                        <button className="btn btn-primary btn-sm extra-small fw-bold rounded-pill px-3" onClick={() => router.push('/admin/staff/add')}><i className="bi bi-plus-lg me-1" />Register Personnel</button>
                     </div>
                  </div>
                  <div className="table-responsive">
                     <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light-subtle">
                           <tr>
                              <th className="info-label border-0 ps-4 py-3">Staff Identity</th>
                              <th className="info-label border-0 py-3">Department</th>
                              <th className="info-label border-0 py-3">Basic Salary</th>
                              <th className="info-label border-0 py-3">Last Payment</th>
                              <th className="info-label border-0 py-3 text-center">Status</th>
                              <th className="info-label border-0 pe-4 py-3 text-end">Actions</th>
                           </tr>
                        </thead>
                        <tbody>
                           {loading ? (
                              <tr><td colSpan={6} className="text-center py-5"><LoadingSpinner /></td></tr>
                           ) : filteredStaff.length > 0 ? filteredStaff.map(staff => (
                              <tr key={staff._id} className={staff.status === 'Paid' ? 'opacity-75' : ''}>
                                 <td className="ps-4">
                                    <div className="d-flex align-items-center gap-3">
                                       <div className="ds-user-avatar shadow-sm overflow-hidden" style={{ width: 35, height: 35, fontSize: '0.75rem', borderRadius: '12px' }}>
                                          {staff.photo ? <img src={staff.photo} className="w-100 h-100 object-fit-cover" /> : staff.name[0]}
                                       </div>
                                       <div>
                                          <div className="fw-900 text-dark extra-small">{staff.name}</div>
                                          <div className="text-muted fw-bold" style={{ fontSize: '0.6rem' }}>UID: {staff._id.slice(-6).toUpperCase()}</div>
                                       </div>
                                    </div>
                                 </td>
                                 <td><span className="extra-small fw-900 text-dark opacity-75">{staff.department}</span></td>
                                 <td><span className="extra-small fw-900 text-primary">{formatCurrency(staff.basicSalary)}</span></td>
                                 <td>
                                    <div className="extra-small fw-900 text-dark">{staff.lastPaymentMonth} 2026</div>
                                    <div className="text-muted fw-bold" style={{ fontSize: '0.6rem' }}><i className={`bi ${staff.status === 'Paid' ? 'bi-check2-all text-success' : 'bi-clock-history text-warning'} me-1`} />{staff.status === 'Paid' ? 'Settled' : 'Payment Due'}</div>
                                 </td>
                                 <td className="text-center">
                                    <span className={`badge px-2 py-1 rounded-pill extra-small fw-bold ${staff.status === 'Paid' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                                       {staff.status}
                                    </span>
                                 </td>
                                 <td className="pe-4 text-end">
                                    {staff.status === 'Paid' ? (
                                       <button className="btn btn-outline-success btn-sm rounded-pill px-4 extra-small fw-900 shadow-sm transition-all" onClick={() => handlePayClick(staff)}>
                                          <i className="bi bi-plus-circle me-1" /> ADD ADJUSTMENT
                                       </button>
                                    ) : (
                                       <button className="btn btn-primary btn-sm rounded-pill px-4 extra-small fw-900 shadow-sm transition-all" onClick={() => handlePayClick(staff)}>
                                          <i className="bi bi-wallet2 me-1" /> DISBURSE SALARY
                                       </button>
                                    )}
                                 </td>
                              </tr>
                           )) : (
                              <tr><td colSpan={6} className="text-center py-5">
                                 <div className="mb-2 opacity-25"><i className="bi bi-people" style={{ fontSize: '2.5rem' }} /></div>
                                 <div className="text-muted extra-small fw-bold">No personnel records found for this filter.</div>
                                 <button className="btn btn-link btn-sm extra-small fw-bold p-0 mt-2" onClick={() => setRegistryFilter('All')}>View All Personnel</button>
                              </td></tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         </div>

         {/* INSTITUTIONAL SALARY DISBURSEMENT MODAL */}
         <FormModal
            show={showPayModal}
            onClose={() => setShowPayModal(false)}
            title="Institutional Salary Disbursement"
            onSubmit={processPayment}
         >
            {selectedStaff && (
               <div className="p-1">
                  <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-4 border border-light shadow-sm">
                     <div className="ds-user-avatar shadow-sm overflow-hidden" style={{ width: 55, height: 55, fontSize: '1.2rem', borderRadius: '15px' }}>
                        {selectedStaff.photo ? <img src={selectedStaff.photo} className="w-100 h-100 object-fit-cover" /> : selectedStaff.name[0]}
                     </div>
                     <div className="flex-grow-1">
                        <h6 className="fw-900 text-dark mb-0">{selectedStaff.name}</h6>
                        <div className="text-muted extra-small fw-bold opacity-75">{selectedStaff.department} • {selectedStaff.designation}</div>
                        <div className="d-flex gap-2 mt-2">
                           <div className="badge bg-white text-primary border extra-small fw-800 shadow-sm px-2">IFSC: {selectedStaff.bankName || 'SBIN0001'}</div>
                           <div className="badge bg-white text-dark border extra-small fw-800 shadow-sm px-2">BASE: {formatCurrency(selectedStaff.basicSalary)}</div>
                        </div>
                     </div>
                  </div>

                  {selectedStaff.status === 'Paid' && (
                     <div className="alert alert-warning border-0 rounded-4 extra-small fw-bold mb-4 d-flex align-items-center gap-2 py-2 px-3">
                        <i className="bi bi-exclamation-triangle-fill fs-6" />
                        <span>Attention: A salary disbursement for {payData.month} already exists for this staff. This entry will be recorded as an additional adjustment/bonus.</span>
                     </div>
                  )}

                  <div className="row g-3">
                     <div className="col-md-6">
                        <label className="info-label">Fiscal Payment Month</label>
                        <select className="form-select border-0 bg-light extra-small fw-bold py-2 shadow-sm" value={payData.month} onChange={e => setPayData({ ...payData, month: e.target.value })}>
                           {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                     </div>
                     <div className="col-md-6">
                        <label className="info-label">Net Disbursement Amount (₹)</label>
                        <input type="number" className="form-control border-0 bg-light extra-small fw-900 py-2 text-primary shadow-sm" value={payData.amount} onChange={e => setPayData({ ...payData, amount: Number(e.target.value) })} />
                     </div>
                     <div className="col-md-12">
                        <label className="info-label">Settlement Channel (How is the fund being released?)</label>
                        <div className="d-flex gap-2 flex-wrap">
                           {['Bank Transfer', 'Cash', 'UPI App', 'Cheque'].map(mode => (
                              <button key={mode} type="button" className={`btn btn-sm flex-grow-1 extra-small fw-900 rounded-pill py-2 shadow-sm transition-all ${payData.paymentMode === mode ? 'btn-primary' : 'btn-white border text-muted'}`} onClick={() => setPayData({ ...payData, paymentMode: mode })}>
                                 {mode === 'Bank Transfer' && <i className="bi bi-bank me-1" />}
                                 {mode === 'Cash' && <i className="bi bi-cash-stack me-1" />}
                                 {mode === 'UPI App' && <i className="bi bi-phone-fill me-1" />}
                                 {mode === 'Cheque' && <i className="bi bi-envelope-paper me-1" />}
                                 {mode.toUpperCase()}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="mt-4 p-3 rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-10 shadow-sm">
                     <div className="d-flex justify-content-between align-items-center">
                        <div>
                           <div className="info-label text-primary mb-0 opacity-75">Final Disbursement Total</div>
                           <div className="fw-900 text-primary fs-4">{formatCurrency(payData.amount)}</div>
                        </div>
                        <div className="text-end">
                           <div className="info-label text-primary mb-0 opacity-75">Target Channel</div>
                           <div className="fw-900 text-primary extra-small text-uppercase badge bg-white px-3 py-1 shadow-sm border border-primary border-opacity-25">{payData.paymentMode}</div>
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </FormModal>

         <style jsx>{`
        .extra-small { font-size: 0.65rem; }
        .info-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 2px; }
        .premium-shadow { box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05) !important; }
        .btn-white { background: #fff; }
        .bg-light-subtle { background: #fcfcfd; }
        .transition-all { transition: all 0.2s ease; }
        .z-index-master { z-index: 9999; }
        @keyframes slideDown {
           from { transform: translate(-50%, -100%); opacity: 0; }
           to { transform: translate(-50%, 0); opacity: 1; }
        }
        .slide-down { animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
      </DashboardShell>
   );
}
