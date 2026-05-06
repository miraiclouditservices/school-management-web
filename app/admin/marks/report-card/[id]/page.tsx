'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardShell from '../../../../../components/DashboardShell';
import { LoadingSpinner } from '../../../../../components/UIComponents';
import api from '../../../../../lib/api';
import { formatCurrency } from '../../../../../lib/constants';

export default function StudentReportCardPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [studentRes, reportRes] = await Promise.all([
           api.get(`/students/${id}`),
           api.get(`/marks/report-card/${id}`)
        ]);
        setStudent(studentRes.data);
        setReport(reportRes.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <DashboardShell role="admin" hideSidebar={true} hideTopBar={true}><div className="p-5 text-center"><LoadingSpinner /></div></DashboardShell>;
  if (!student) return <DashboardShell role="admin" hideSidebar={true} hideTopBar={true}><div className="p-5 text-center text-muted">Student record not identified</div></DashboardShell>;

  return (
    <DashboardShell role="admin" hideSidebar={true} hideTopBar={true}>
      {/* IMMERSIVE HEADER */}
      <header className="sticky-top bg-white border-bottom shadow-sm py-2 px-4 no-print" style={{ zIndex: 1100 }}>
        <div className="d-flex justify-content-between align-items-center max-w-1000 mx-auto w-100">
           <div className="d-flex align-items-center gap-3">
              <button className="btn btn-light rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm" onClick={() => router.back()} style={{ width: 32, height: 32 }}>
                 <i className="bi bi-arrow-left fs-6"/>
              </button>
              <div>
                 <h6 className="fw-800 mb-0 text-dark">Institutional Report Card</h6>
                 <div className="text-muted extra-small fw-bold opacity-75">Generating Official Record for: {student.firstName} {student.lastName}</div>
              </div>
           </div>
           <div className="d-flex gap-2">
              <button className="btn btn-primary rounded-pill px-4 extra-small fw-800 shadow-sm" onClick={() => window.print()}>
                 <i className="bi bi-printer me-2"/>PRINT OFFICIAL RECORD
              </button>
           </div>
        </div>
      </header>

      <div className="container py-5 px-4 max-w-1000 mx-auto">
         {/* THE ACTUAL REPORT CARD (PRINTABLE) */}
         <div className="card border-0 premium-shadow rounded-4 bg-white overflow-hidden print-container shadow-lg">
            {/* SCHOOL HEADER */}
            <div className="p-5 text-center bg-light-subtle border-bottom border-4 border-primary">
               <div className="ds-user-avatar mx-auto mb-3 bg-white shadow-sm border" style={{ width: 80, height: 80, borderRadius: 24, fontSize: '2rem' }}>N</div>
               <h3 className="fw-900 text-dark mb-1">NAVEEN SCHOOLS</h3>
               <p className="text-muted small fw-bold mb-4 opacity-75 text-uppercase letter-spacing-1">Progressive Academic Excellence • Academic Session 2026-27</p>
               
               <div className="row g-3 text-start mt-4 pt-4 border-top">
                  <div className="col-md-3 col-6">
                     <div className="info-label opacity-50">Student Name</div>
                     <div className="fw-900 text-dark small">{student.firstName} {student.lastName}</div>
                  </div>
                  <div className="col-md-3 col-6">
                     <div className="info-label opacity-50">Admission Number</div>
                     <div className="fw-900 text-dark small">{student.admissionNo}</div>
                  </div>
                  <div className="col-md-3 col-6">
                     <div className="info-label opacity-50">Class & Section</div>
                     <div className="fw-900 text-dark small">{student.className} - {student.section}</div>
                  </div>
                  <div className="col-md-3 col-6">
                     <div className="info-label opacity-50">Roll Number</div>
                     <div className="fw-900 text-dark small">{student.rollNo || '-'}</div>
                  </div>
               </div>
            </div>

            {/* PERFORMANCE TABLE */}
            <div className="p-5">
               <h6 className="fw-900 text-dark mb-4 text-uppercase letter-spacing-1 d-flex align-items-center gap-2">
                  <i className="bi bi-bar-chart-fill text-primary"/> Scholastic Performance
               </h6>
               <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                     <thead className="bg-light">
                        <tr>
                           <th className="info-label py-3 ps-3">Subject Name</th>
                           <th className="info-label py-3 text-center">Max Marks</th>
                           <th className="info-label py-3 text-center">Marks Obtained</th>
                           <th className="info-label py-3 text-center">Grade</th>
                           <th className="info-label py-3 text-center pe-3">Status</th>
                        </tr>
                     </thead>
                     <tbody>
                        {report?.subjects?.map((s: any, idx: number) => (
                           <tr key={idx}>
                              <td className="ps-3 fw-900 text-dark extra-small text-uppercase">{s.subject}</td>
                              <td className="text-center fw-bold text-muted extra-small">{s.maxMarks}</td>
                              <td className="text-center fw-900 text-dark extra-small">{s.marksObtained}</td>
                              <td className="text-center">
                                 <span className="fw-900 text-primary small">{s.grade}</span>
                              </td>
                              <td className="text-center pe-3">
                                 <span className={`badge rounded-pill extra-small fw-800 px-3 ${s.marksObtained >= (s.maxMarks * 0.33) ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                    {s.marksObtained >= (s.maxMarks * 0.33) ? 'QUALIFIED' : 'REAPPEAR'}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               {/* SUMMARY CALCULATION */}
               <div className="row mt-5 g-4">
                  <div className="col-md-7">
                     <div className="p-4 rounded-4 border bg-light-subtle h-100">
                        <h6 className="info-label mb-3 opacity-50">Institutional Remarks</h6>
                        <p className="fw-bold text-dark mb-4" style={{ fontSize: '0.75rem', lineHeight: '1.6' }}>
                           {report?.percentage >= 75 
                             ? "Exceptional academic performance. The student demonstrates profound understanding of core concepts and shows consistent enthusiasm for learning."
                             : report?.percentage >= 40 
                             ? "Satisfactory progress identified. Encouragement in core subjects like Mathematics and Science is recommended for future academic cycles."
                             : "Needs critical improvement. Intensive personalized guidance is required to bridge scholastic gaps in the upcoming semester."
                           }
                        </p>
                        <div className="d-flex gap-5 mt-5">
                           <div className="text-center">
                              <div className="border-bottom mb-2 px-5" style={{ minWidth: '150px' }}></div>
                              <div className="info-label text-dark opacity-50">Class Teacher</div>
                           </div>
                           <div className="text-center">
                              <div className="border-bottom mb-2 px-5" style={{ minWidth: '150px' }}></div>
                              <div className="info-label text-dark opacity-50">Principal</div>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="col-md-5">
                     <div className="card border-0 bg-primary text-white rounded-4 p-4 shadow-lg">
                        <h6 className="info-label text-white opacity-75 mb-4">Academic Summary</h6>
                        <div className="d-flex justify-content-between mb-3 border-bottom border-white border-opacity-10 pb-2">
                           <span className="extra-small fw-bold opacity-75">Aggregate Score</span>
                           <span className="fw-900 fs-5">{report?.totalMarks} / {report?.totalMax}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-3 border-bottom border-white border-opacity-10 pb-2">
                           <span className="extra-small fw-bold opacity-75">Institutional Percentage</span>
                           <span className="fw-900 fs-5">{report?.percentage}%</span>
                        </div>
                        <div className="d-flex justify-content-between mt-3">
                           <span className="extra-small fw-bold opacity-75">Final Grade</span>
                           <span className="fw-900 fs-2">{report?.percentage >= 90 ? 'A+' : report?.percentage >= 75 ? 'A' : 'B'}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* FOOTER STRIP */}
            <div className="bg-dark text-white p-2 text-center">
               <div className="extra-small opacity-50 fw-bold letter-spacing-1">OFFICIAL DOCUMENT • VALIDATED BY INSTITUTIONAL MANAGEMENT SYSTEM • {new Date().getFullYear()}</div>
            </div>
         </div>
      </div>

      <style jsx>{`
        .extra-small { font-size: 0.65rem; }
        .info-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 2px; }
        .premium-shadow { box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1) !important; }
        .max-w-1000 { max-width: 1000px; }
        .bg-light-subtle { background: #fcfcfd; }
        .letter-spacing-1 { letter-spacing: 1px; }
        @media print {
           .no-print { display: none !important; }
           .print-container { box-shadow: none !important; border: 1px solid #eee !important; }
           body { background: white !important; }
        }
      `}</style>
    </DashboardShell>
  );
}
