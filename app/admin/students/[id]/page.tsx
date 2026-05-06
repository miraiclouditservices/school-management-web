'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardShell from '../../../../components/DashboardShell';
import { LoadingSpinner, StatusBadge } from '../../../../components/UIComponents';
import api from '../../../../lib/api';
import { formatDate, formatCurrency, calcAge } from '../../../../lib/constants';

export default function ViewStudentPage() {
  const router = useRouter();
  const { id } = useParams();
  const [student, setStudent] = useState<any>(null);
  const [fee, setFee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Identity');

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, fRes] = await Promise.all([
          api.get(`/students/${id}`),
          api.get('/fees', { student: id })
        ]);
        setStudent(sRes.data);
        if (fRes.data && fRes.data.length > 0) setFee(fRes.data[0]);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <DashboardShell role="admin" hideSidebar={true} hideTopBar={true}><div className="p-5 text-center"><LoadingSpinner /></div></DashboardShell>;
  if (!student) return <DashboardShell role="admin" hideSidebar={true} hideTopBar={true}><div className="p-5 text-center text-muted">Student not found</div></DashboardShell>;

  const getInitials = () => `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`;

  return (
    <DashboardShell role="admin" hideSidebar={true} hideTopBar={true}>
      {/* FIXED HEADER WITH HIGH Z-INDEX */}
      <header className="sticky-top bg-white border-bottom shadow-sm" style={{ zIndex: 1100 }}>
        <div className="container-fluid py-2 px-4" style={{ maxWidth: '1300px' }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <button type="button" className="btn btn-light rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm" onClick={() => router.back()} style={{ width:'32px', height:'32px' }}>
                <i className="bi bi-arrow-left fs-6"/>
              </button>
              <div>
                <h6 className="fw-800 mb-0 text-dark">Student Case File</h6>
                <p className="text-muted extra-small fw-bold mb-0 text-uppercase opacity-75">Viewing Profile: {student.firstName} {student.lastName}</p>
              </div>
            </div>
            <div className="d-flex gap-2">
               <button className="btn btn-light rounded-pill px-3 py-1 fw-bold extra-small" onClick={() => window.print()}><i className="bi bi-printer me-2"/>Print</button>
               <button className="btn btn-primary shadow-sm rounded-pill px-3 py-1 fw-bold extra-small" onClick={() => router.push(`/admin/students/edit/${id}`)}><i className="bi bi-pencil-square me-2"/>Edit Profile</button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-fluid py-4" style={{ maxWidth: '1300px' }}>
        <div className="row g-4">
          <div className="col-lg-3">
             <div className="card border-0 premium-shadow rounded-4 bg-white sticky-top" style={{ top: '80px', zIndex: 1000 }}>
                <div className="card-body p-4 text-center">
                   <div className="ds-user-avatar mx-auto mb-3" style={{ width: '80px', height: '80px', fontSize: '1.5rem', borderRadius: '24px' }}>{getInitials()}</div>
                   <h6 className="fw-800 text-dark mb-1 small">{student.firstName} {student.lastName}</h6>
                   <div className="text-muted extra-small fw-bold mb-3">{student.admissionNo}</div>
                   <StatusBadge status={student.admissionStatus} />
                   
                   <div className="border-top mt-4 pt-4 text-start">
                      <div className="mb-3">
                         <div className="info-label">Placement</div>
                         <div className="fw-bold text-dark extra-small">Class {student.currentClass} - {student.section}</div>
                      </div>
                      <div className="mb-3">
                         <div className="info-label">Academic Session</div>
                         <div className="fw-bold text-dark extra-small">{student.academicYear?.name}</div>
                      </div>
                      <div className="mb-3">
                         <div className="info-label">Age</div>
                         <div className="fw-bold text-dark extra-small">{calcAge(student.dateOfBirth)}</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="col-lg-9">
             <div className="card border-0 premium-shadow rounded-4 bg-white mb-4">
                <div className="card-header bg-white border-0 p-4 pb-0">
                   <div className="nav nav-tabs nav-tabs-premium">
                      {['Identity', 'Guardians', 'Financials', 'Timetable'].map(t => (
                        <button key={t} className={`nav-link ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
                      ))}
                   </div>
                </div>
                <div className="card-body p-4 p-md-5">
                   {activeTab === 'Identity' && (
                      <div className="animate__animated animate__fadeIn">
                         <h6 className="fw-800 mb-4 text-primary text-uppercase extra-small">Identification Details</h6>
                         <div className="row g-4">
                            {[
                              ['First Name', student.firstName], ['Last Name', student.lastName],
                              ['Date of Birth', formatDate(student.dateOfBirth)], ['Gender', student.gender],
                              ['Blood Group', student.bloodGroup], ['Aadhar No.', student.aadharNumber],
                              ['Admission Date', formatDate(student.admissionDate)], ['Roll Number', student.rollNo || 'Pending'],
                              ['Category', student.category || 'General']
                            ].map(([l, v]) => (
                              <div key={l} className="col-md-4 col-6">
                                <div className="info-label">{l}</div>
                                <div className="info-value text-dark extra-small fw-bold">{v || '-'}</div>
                              </div>
                            ))}
                         </div>
                      </div>
                   )}

                    {activeTab === 'Guardians' && (
                      <div className="animate__animated animate__fadeIn">
                         <div className="row g-4">
                            <div className="col-md-6">
                               <div className="p-4 rounded-4 border h-100 bg-light-subtle">
                                  <h6 className="fw-800 text-primary mb-3 extra-small text-uppercase"><i className="bi bi-person-fill me-2"/>Father</h6>
                                  <div className="mb-2"><span className="info-label d-block">Full Name</span><span className="fw-bold extra-small">{student.father?.name}</span></div>
                                  <div className="mb-2"><span className="info-label d-block">Phone Number</span><span className="fw-bold text-primary extra-small">{student.father?.mobile}</span></div>
                                  <div className="mb-2"><span className="info-label d-block">Email</span><span className="fw-bold extra-small">{student.father?.email || '-'}</span></div>
                                  <div className="mb-2"><span className="info-label d-block">Occupation</span><span className="fw-bold extra-small">{student.father?.occupation || '-'}</span></div>
                               </div>
                            </div>
                            <div className="col-md-6">
                               <div className="p-4 rounded-4 border h-100 bg-light-subtle">
                                  <h6 className="fw-800 text-brand mb-3 extra-small text-uppercase" style={{ color: '#ec4899' }}><i className="bi bi-person-fill me-2"/>Mother</h6>
                                  <div className="mb-2"><span className="info-label d-block">Full Name</span><span className="fw-bold extra-small">{student.mother?.name || '-'}</span></div>
                                  <div className="mb-2"><span className="info-label d-block">Phone Number</span><span className="fw-bold text-primary extra-small">{student.mother?.mobile || '-'}</span></div>
                                  <div className="mb-2"><span className="info-label d-block">Email</span><span className="fw-bold extra-small">{student.mother?.email || '-'}</span></div>
                                  <div className="mb-2"><span className="info-label d-block">Occupation</span><span className="fw-bold extra-small">{student.mother?.occupation || '-'}</span></div>
                               </div>
                            </div>
                            <div className="col-12">
                               <div className="p-3 rounded-4 border bg-white premium-shadow">
                                  <h6 className="fw-800 mb-3 extra-small text-uppercase opacity-50"><i className="bi bi-shield-exclamation me-2"/>Emergency Contact</h6>
                                  <div className="row g-3">
                                     <div className="col-md-4"><div><span className="info-label d-block">Contact Name</span><span className="fw-bold extra-small">{student.emergencyContact?.name || '-'}</span></div></div>
                                     <div className="col-md-4"><div><span className="info-label d-block">Phone Number</span><span className="fw-bold text-primary extra-small">{student.emergencyContact?.phone || '-'}</span></div></div>
                                     <div className="col-md-4"><div><span className="info-label d-block">Relation</span><span className="fw-bold extra-small">{student.emergencyContact?.relationship || '-'}</span></div></div>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   )}

                   {activeTab === 'Financials' && (
                      <div className="animate__animated animate__fadeIn">
                         <div className="row g-3 mb-4">
                            <div className="col-md-4">
                               <div className="p-3 rounded-4 border border-primary border-opacity-25 bg-primary bg-opacity-10 h-100 text-center shadow-sm">
                                  <div className="info-label text-primary mb-1 fw-bold">Annual Fee</div>
                                  <div className="fs-5 fw-800 text-primary">{formatCurrency(student.feeDetails?.grandTotal?.final || fee?.netFee || 0)}</div>
                               </div>
                            </div>
                            <div className="col-md-4">
                               <div className="p-3 rounded-4 border border-success border-opacity-25 bg-success bg-opacity-10 h-100 text-center shadow-sm">
                                  <div className="info-label text-success mb-1 fw-bold">Amount Paid</div>
                                  <div className="fs-5 fw-800 text-success">{formatCurrency(fee?.paidAmount || 0)}</div>
                               </div>
                            </div>
                            <div className="col-md-4">
                               <div className="p-3 rounded-4 border border-danger border-opacity-25 bg-danger bg-opacity-10 h-100 text-center shadow-sm">
                                  <div className="info-label text-danger mb-1 fw-bold">Net Balance</div>
                                  <div className="fs-5 fw-800 text-danger">{formatCurrency(fee?.balanceDue || 0)}</div>
                               </div>
                            </div>
                         </div>

                         {student.feeDetails && (
                           <div className="mb-4">
                              <h6 className="fw-800 mb-3 text-uppercase extra-small text-muted opacity-75">Fee Breakdown & Concessions</h6>
                              <div className="table-responsive rounded-4 border overflow-hidden">
                                 <table className="table table-sm table-borderless align-middle mb-0">
                                    <thead className="bg-light">
                                       <tr>
                                          <th className="extra-small py-2 px-3">CATEGORY</th>
                                          <th className="extra-small py-2 text-end">ORIGINAL</th>
                                          <th className="extra-small py-2 text-end text-danger">CONCESSION</th>
                                          <th className="extra-small py-2 text-end px-3">FINAL PAYABLE</th>
                                       </tr>
                                    </thead>
                                    <tbody>
                                       {[
                                          { label: 'Application', key: 'applicationFee' },
                                          { label: 'Admission', key: 'admissionFee' },
                                          { label: 'School Fee', key: 'schoolFee' },
                                          { label: 'Transport', key: 'transportFee' }
                                       ].map(f => (
                                          <tr key={f.key} className="border-bottom border-light">
                                             <td className="extra-small fw-bold py-2 px-3 text-muted">{f.label}</td>
                                             <td className="extra-small fw-bold py-2 text-end">{formatCurrency(student.feeDetails[f.key]?.original || 0)}</td>
                                             <td className="extra-small fw-bold py-2 text-end text-danger">-{formatCurrency(student.feeDetails[f.key]?.concession || 0)}</td>
                                             <td className="extra-small fw-800 py-2 text-end px-3">{formatCurrency(student.feeDetails[f.key]?.final || 0)}</td>
                                          </tr>
                                       ))}
                                    </tbody>
                                    <tfoot className="bg-light-subtle">
                                       <tr className="fw-900">
                                          <td className="extra-small py-2 px-3">TOTAL PAYABLE</td>
                                          <td className="extra-small py-2 text-end">{formatCurrency(student.feeDetails.grandTotal?.original || 0)}</td>
                                          <td className="extra-small py-2 text-end text-danger">-{formatCurrency(student.feeDetails.grandTotal?.concession || 0)}</td>
                                          <td className="extra-small py-2 text-end px-3 text-primary">{formatCurrency(student.feeDetails.grandTotal?.final || 0)}</td>
                                       </tr>
                                    </tfoot>
                                 </table>
                              </div>
                              {student.transportRoute && (
                                <div className="mt-2 d-flex align-items-center gap-2">
                                  <span className="badge bg-primary-subtle text-primary extra-small">Transport Route: {student.transportRoute.routeName}</span>
                                  <span className="text-muted extra-small fw-bold">Village: {student.transportRoute.villageName}</span>
                                </div>
                              )}
                           </div>
                         )}

                         <div className="row g-4">
                            <div className="col-lg-7">
                               <h6 className="fw-800 mb-4 text-primary extra-small text-uppercase">Financial Roadmap</h6>
                               <div className="timeline-premium small">
                                  {fee?.installments?.map((inst: any, i: number) => (
                                    <div key={i} className={`timeline-item-premium ${inst.status === 'Paid' ? 'success' : 'active'}`}>
                                       <div className="timeline-dot" style={{ width:'20px', height:'20px', fontSize:'0.6rem' }}>{i+1}</div>
                                       <div className="card border-0 bg-light-subtle rounded-4 mb-2 shadow-none">
                                          <div className="card-body p-2 px-3 d-flex justify-content-between align-items-center">
                                             <div>
                                                <div className="fw-800 text-dark extra-small">{inst.name}</div>
                                                <div className="extra-small text-muted opacity-75">Due: {formatDate(inst.dueDate)}</div>
                                             </div>
                                             <div className="text-end">
                                                <div className="fw-800 text-primary extra-small">{formatCurrency(inst.amount)}</div>
                                                <span className={`extra-small fw-bold ${inst.status === 'Paid' ? 'text-success' : 'text-primary'}`}>{inst.status}</span>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                  ))}
                               </div>
                            </div>
                            <div className="col-lg-5">
                               <h6 className="fw-800 mb-4 text-success extra-small text-uppercase">Payment History</h6>
                               <div className="d-flex flex-column gap-2">
                                  {fee?.payments?.slice().reverse().map((p: any, i: number) => (
                                    <div key={i} className="p-2 px-3 rounded-4 bg-white border premium-shadow d-flex justify-content-between align-items-center">
                                       <div>
                                          <div className="fw-800 text-dark extra-small">{formatCurrency(p.amount)}</div>
                                          <div className="extra-small text-muted fw-bold opacity-50">{p.mode || 'Cash'}</div>
                                       </div>
                                       <div className="text-end">
                                          <div className="fw-bold text-success extra-small">{formatDate(p.date)}</div>
                                       </div>
                                    </div>
                                  ))}
                                  {!fee?.payments?.length && <div className="text-center py-4 text-muted extra-small bg-light rounded-4">No transactions found.</div>}
                               </div>
                            </div>
                         </div>
                      </div>
                   )}

                   {activeTab === 'Timetable' && (
                      <div className="animate__animated animate__fadeIn">
                         <h6 className="fw-800 mb-4 text-info text-uppercase extra-small">Class Academic Schedule</h6>
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
                                           const slot = student.timetable?.periods?.find((s: any) => s.day === day && s.periodNo === pNo);
                                           return (
                                              <td key={day} className="p-1" style={{ width: '150px', minHeight: '70px' }}>
                                                 {slot ? (
                                                    <div className={`p-2 rounded-3 text-start border-start border-3 shadow-sm ${slot.isBreak ? 'bg-warning bg-opacity-10 border-warning' : 'bg-primary bg-opacity-10 border-primary'}`}>
                                                       <div className="fw-900 text-dark extra-small text-uppercase">{slot.subject}</div>
                                                       <div className="text-muted fw-bold" style={{ fontSize: '0.6rem' }}>{slot.teacherName || '-'}</div>
                                                       <div className="text-primary-emphasis fw-bold mt-1" style={{ fontSize: '0.55rem' }}>{slot.startTime} - {slot.endTime}</div>
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
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .extra-small { font-size: 0.65rem; }
        .info-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 2px; }
        .btn-white { background: #fff; border: 1px solid #f1f5f9; }
        .premium-shadow { box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08) !important; }
      `}</style>
    </DashboardShell>
  );
}
