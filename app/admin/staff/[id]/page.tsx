'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardShell from '../../../../components/DashboardShell';
import { LoadingSpinner, StatusBadge } from '../../../../components/UIComponents';
import api from '../../../../lib/api';
import { formatDate, formatCurrency, CLASSES, SECTIONS } from '../../../../lib/constants';

export default function ViewStaffPage() {
  const router = useRouter();
  const { id } = useParams();
  const [staff, setStaff] = useState<any>(null);
  const [payrollHistory, setPayrollHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [staffRes, payrollRes] = await Promise.all([
           api.get(`/staff/${id}`),
           api.get(`/accounts?staffId=${id}&category=Salaries`)
        ]);
        setStaff(staffRes.data);
        
        // Robust Parsing: Handle both direct array and object with data field
        const history = Array.isArray(payrollRes.data) ? payrollRes.data : (payrollRes.data?.data || []);
        setPayrollHistory(history);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <DashboardShell role="admin" hideSidebar={true} hideTopBar={true}><div className="p-5 text-center"><LoadingSpinner /></div></DashboardShell>;
  if (!staff) return <DashboardShell role="admin" hideSidebar={true} hideTopBar={true}><div className="p-5 text-center text-muted">Staff record not found</div></DashboardShell>;

  return (
    <DashboardShell role="admin" hideSidebar={true} hideTopBar={true}>
      {/* IMMERSIVE FIXED HEADER */}
      <header className="sticky-top bg-white border-bottom shadow-sm" style={{ zIndex: 1100 }}>
        <div className="container py-2" style={{ maxWidth: '1100px' }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <button type="button" className="btn btn-light rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm" onClick={() => router.back()} style={{ width:'32px', height:'32px' }}>
                <i className="bi bi-arrow-left fs-6"/>
              </button>
              <div>
                 <h6 className="fw-800 mb-0 text-dark">Staff Case File</h6>
                 <p className="text-muted extra-small fw-bold mb-0 text-uppercase opacity-75">Viewing Profile: {staff.name}</p>
              </div>
            </div>
            <div className="d-flex gap-2">
               <button className="btn btn-light rounded-pill px-3 py-1 fw-bold extra-small" onClick={() => window.print()}><i className="bi bi-printer me-2"/>Print Profile</button>
               <button className="btn btn-primary shadow-sm rounded-pill px-4 py-1 fw-800 extra-small" onClick={() => router.push(`/admin/staff/edit/${staff._id}`)}><i className="bi bi-pencil-square me-2"/>Edit Staff</button>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-4" style={{ maxWidth: '1100px' }}>
         <div className="row g-4">
            {/* Sidebar Profile Card */}
            <div className="col-lg-3">
               <div className="card border-0 premium-shadow rounded-4 bg-white sticky-top" style={{ top: '80px', zIndex: 1000 }}>
                  <div className="card-body p-4 text-center">
                     <div className="ds-user-avatar mx-auto mb-3 shadow-sm border overflow-hidden" style={{ width: '80px', height: '80px', fontSize: '1.5rem', borderRadius: '24px' }}>
                        {staff.photo ? <img src={staff.photo} className="w-100 h-100 object-fit-cover"/> : (staff.name || 'S')[0]}
                     </div>
                     <h6 className="fw-800 text-dark mb-1 small">{staff.name}</h6>
                     <div className="text-muted extra-small fw-bold mb-3">{staff.staffId}</div>
                     <StatusBadge status={staff.status} />
                     
                     <div className="border-top mt-4 pt-4 text-start">
                        <div className="mb-3">
                           <div className="info-label">Current Placement</div>
                           <div className="fw-bold text-dark extra-small">{staff.department} - {staff.designation}</div>
                        </div>
                        <div className="mb-3">
                           <div className="info-label">Experience</div>
                           <div className="fw-bold text-dark extra-small">{staff.experience || 0} Years</div>
                        </div>
                        <div className="mb-3">
                           <div className="info-label">Joining Date</div>
                           <div className="fw-bold text-dark extra-small">{formatDate(staff.joiningDate)}</div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Main Content Area */}
            <div className="col-lg-9">
               <div className="row g-4">
                  {/* Personal Detail Card */}
                  <div className="col-12">
                     <div className="card border-0 premium-shadow rounded-4 bg-white p-4">
                        <h6 className="info-label text-primary mb-4 d-flex align-items-center"><i className="bi bi-person-badge me-2 fs-6"/> Personal Identity</h6>
                        <div className="row g-4">
                           {[
                             ['Gender', staff.gender], ['Date of Birth', formatDate(staff.dateOfBirth)],
                             ['Blood Group', staff.bloodGroup], ['Aadhar Number', staff.aadharNumber],
                             ['PAN Number', staff.panNumber], ['Marital Status', staff.maritalStatus],
                             ['Nationality', staff.nationality], ['Religion', staff.religion]
                           ].map(([l, v]) => (
                             <div key={l as string} className="col-md-3 col-6">
                                <div className="info-label opacity-50">{l as string}</div>
                                <div className="fw-bold text-dark extra-small">{v as string || '-'}</div>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Professional & Contact */}
                  <div className="col-md-6">
                     <div className="card border-0 premium-shadow rounded-4 bg-white p-4 h-100">
                        <h6 className="info-label text-brand mb-4 d-flex align-items-center" style={{ color: '#4f46e5' }}><i className="bi bi-briefcase me-2 fs-6"/> Professional Profile</h6>
                        <div className="mb-3">
                           <div className="info-label opacity-50">Qualification</div>
                           <div className="fw-bold text-dark extra-small">{staff.qualification}</div>
                        </div>
                        <div className="mb-3">
                           <div className="info-label opacity-50">Employment Type</div>
                           <div className="fw-bold text-dark extra-small">{staff.employmentType}</div>
                        </div>
                        <div className="p-3 rounded-4 bg-light-subtle border">
                           <div className="info-label mb-2 opacity-50">Specialization</div>
                           <div className="fw-bold text-primary extra-small">{staff.specialization || 'General'}</div>
                        </div>
                     </div>
                  </div>

                  <div className="col-md-6">
                     <div className="card border-0 premium-shadow rounded-4 bg-white p-4 h-100">
                        <h6 className="info-label text-success mb-4 d-flex align-items-center"><i className="bi bi-telephone me-2 fs-6"/> Contact Details</h6>
                        <div className="mb-3">
                           <div className="info-label opacity-50">Phone Number</div>
                           <div className="fw-800 text-primary small">{staff.phone}</div>
                        </div>
                        <div className="mb-3">
                           <div className="info-label opacity-50">Email Address</div>
                           <div className="fw-800 text-primary extra-small">{staff.email}</div>
                        </div>
                        <div className="p-3 rounded-3 border bg-light-subtle">
                           <div className="info-label mb-1 text-dark opacity-50">Emergency Contact</div>
                           <div className="fw-bold text-dark extra-small">{staff.emergencyContact?.name} • {staff.emergencyContact?.phone}</div>
                        </div>
                     </div>
                  </div>

                  {/* Academic Schedule / Timetable */}
                  <div className="col-12">
                     <div className="card border-0 premium-shadow rounded-4 bg-white p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                           <h6 className="info-label text-info mb-0 d-flex align-items-center"><i className="bi bi-calendar3 me-2 fs-6"/> Assigned Academic Schedule</h6>
                           <div className="d-flex gap-2">
                              <select className="form-select form-select-sm border-0 bg-light extra-small fw-bold rounded-pill px-3 shadow-none" style={{ width: '130px' }} value={classFilter} onChange={e => setClassFilter(e.target.value)}>
                                 <option value="">All Classes</option>
                                 {CLASSES.map(cl => <option key={cl} value={cl}>{cl}</option>)}
                              </select>
                              <select className="form-select form-select-sm border-0 bg-light extra-small fw-bold rounded-pill px-3 shadow-none" style={{ width: '100px' }} value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}>
                                 <option value="">All Sec</option>
                                 {SECTIONS.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                              </select>
                           </div>
                        </div>
                        <div className="table-responsive">
                           <table className="table table-bordered align-middle mb-0 text-center">
                              <thead className="bg-light">
                                 <tr>
                                    <th className="info-label py-2 extra-small">PERIOD</th>
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => <th key={day} className="info-label py-2 extra-small">{day.toUpperCase()}</th>)}
                                 </tr>
                              </thead>
                              <tbody>
                                 {[1,2,3,4,5,6,7,8].map(pNo => (
                                    <tr key={pNo}>
                                       <td className="bg-light-subtle fw-900 extra-small text-dark" style={{ width: '80px' }}>P-{pNo}</td>
                                       {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => {
                                          const slot = staff.timetable?.find((s: any) => 
                                             s.day === day && 
                                             s.periodNo === pNo && 
                                             (!classFilter || s.className === classFilter) &&
                                             (!sectionFilter || s.section === sectionFilter)
                                          );
                                          return (
                                             <td key={day} className="p-1" style={{ width: '120px', minHeight: '60px' }}>
                                                {slot ? (
                                                   <div className="p-2 rounded-3 bg-info bg-opacity-10 border-start border-3 border-info text-start">
                                                      <div className="fw-900 text-dark extra-small text-uppercase">{slot.subject}</div>
                                                      <div className="text-muted fw-bold" style={{ fontSize: '0.6rem' }}>{slot.className}-{slot.section}</div>
                                                      <div className="text-info fw-bold" style={{ fontSize: '0.55rem' }}>{slot.startTime} - {slot.endTime}</div>
                                                   </div>
                                                ) : <div className="py-3 text-muted opacity-25 fw-bold" style={{ fontSize: '0.6rem' }}>-</div>}
                                             </td>
                                          );
                                       })}
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </div>
                  </div>

                  {/* Financial & Payroll History */}
                  <div className="col-12">
                     <div className="card border-0 premium-shadow rounded-4 bg-white p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                           <h6 className="info-label text-warning mb-0 d-flex align-items-center"><i className="bi bi-wallet2 me-2 fs-6"/> Financial & Payroll History</h6>
                           <div className="badge bg-warning bg-opacity-10 text-warning px-3 py-2 fw-800 extra-small">MONTHLY SALARY: {formatCurrency(staff.basicSalary || 0)}</div>
                        </div>
                        
                        <div className="table-responsive">
                           <table className="table table-hover align-middle mb-0">
                              <thead className="bg-light-subtle">
                                 <tr>
                                    <th className="info-label border-0 py-3">Payment Month</th>
                                    <th className="info-label border-0 py-3">Voucher No</th>
                                    <th className="info-label border-0 py-3">Mode</th>
                                    <th className="info-label border-0 py-3 text-end">Net Paid</th>
                                    <th className="info-label border-0 py-3 text-center">Status</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {payrollHistory.length > 0 ? payrollHistory.map(ph => (
                                    <tr key={ph._id}>
                                       <td className="extra-small fw-800 text-dark">{formatDate(ph.date)}</td>
                                       <td className="extra-small text-muted fw-bold">{ph.voucherNo}</td>
                                       <td className="extra-small text-muted fw-bold">{ph.paymentMode}</td>
                                       <td className="extra-small fw-900 text-dark text-end">{formatCurrency(ph.amount)}</td>
                                       <td className="text-center"><span className="badge bg-success-subtle text-success px-2 py-1 extra-small fw-bold">Released</span></td>
                                    </tr>
                                 )) : (
                                    <tr><td colSpan={5} className="text-center py-4 text-muted extra-small fw-bold">No payroll records found for this staff member.</td></tr>
                                 )}
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
        .bg-light-subtle { background: #fcfcfd; }
      `}</style>
    </DashboardShell>
  );
}
