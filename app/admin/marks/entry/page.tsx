'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardShell from '../../../../components/DashboardShell';
import { LoadingSpinner } from '../../../../components/UIComponents';
import api from '../../../../lib/api';

interface StudentMarkEntry {
  student: string;
  name: string;
  admissionNo: string;
  marksObtained: number;
  isAbsent: boolean;
  remarks: string;
}

export default function MarksEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState<StudentMarkEntry[]>([]);
  
  const [examData, setExamData] = useState({
     className: searchParams.get('class') || 'Class 10',
     section: searchParams.get('section') || 'A',
     subject: searchParams.get('subject') || 'Mathematics',
     examName: searchParams.get('exam') || 'Mid-Term',
     maxMarks: 100,
     examDate: new Date().toISOString().split('T')[0]
  });

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get<any[]>('/students', { 
         className: examData.className, 
         section: examData.section,
         limit: 100 
      });
      const entries = res.data.map(s => ({
         student: s._id,
         name: `${s.firstName} ${s.lastName}`,
         admissionNo: s.admissionNo,
         marksObtained: 0,
         isAbsent: false,
         remarks: ''
      }));
      setStudents(entries);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadStudents(); }, []);

  const handleMarkChange = (idx: number, field: string, value: any) => {
     const newStudents = [...students];
     newStudents[idx] = { ...newStudents[idx], [field]: value };
     setStudents(newStudents);
  };

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setError(null);

     // Validation
     const invalidMarks = students.find(s => !s.isAbsent && (s.marksObtained < 0 || s.marksObtained > examData.maxMarks));
     if (invalidMarks) {
        setError(`Invalid marks detected for ${invalidMarks.name}. Must be between 0 and ${examData.maxMarks}.`);
        return;
     }

     setSaving(true);
     try {
        await api.post('/marks', {
           ...examData,
           marks: students
        });
        router.push('/admin/marks');
     } catch (e: any) { 
        setError(e.response?.data?.message || 'Failed to publish results. Please verify your data.');
     }
     setSaving(false);
  };

  return (
    <DashboardShell role="admin" hideSidebar={true} hideTopBar={true}>
      {/* IMMERSIVE HEADER */}
      <header className="sticky-top bg-white border-bottom shadow-sm py-2 px-4" style={{ zIndex: 1100 }}>
        <div className="d-flex justify-content-between align-items-center max-w-1400 mx-auto w-100">
           <div className="d-flex align-items-center gap-3">
              <button className="btn btn-light rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm" onClick={() => router.back()} style={{ width: 32, height: 32 }}>
                 <i className="bi bi-arrow-left fs-6"/>
              </button>
              <div>
                 <h6 className="fw-800 mb-0">Institutional Result Entry</h6>
                 <div className="text-muted extra-small fw-bold opacity-75">{examData.className} {examData.section} • {examData.subject} • {examData.examName}</div>
              </div>
           </div>
           <div className="d-flex gap-2">
              <div className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 fw-800 extra-small">MAX MARKS: {examData.maxMarks}</div>
              <button className="btn btn-primary rounded-pill px-4 extra-small fw-800 shadow-sm" onClick={handleSubmit} disabled={saving}>
                 {saving ? <LoadingSpinner size="sm"/> : <><i className="bi bi-cloud-upload me-2"/>PUBLISH RESULTS</>}
              </button>
           </div>
        </div>
      </header>

      <div className="container-fluid py-4 px-4 max-w-1400 mx-auto">
         {error && (
            <div className="alert alert-danger border-0 premium-shadow rounded-4 extra-small fw-800 d-flex align-items-center gap-2 mb-4">
               <i className="bi bi-exclamation-triangle-fill fs-6"/>
               {error}
            </div>
         )}
         <div className="row g-4">
            {/* EXAM PARAMETERS CARD */}
            <div className="col-12">
               <div className="card border-0 premium-shadow rounded-4 bg-white p-3">
                  <div className="row g-3">
                     <div className="col-md-3">
                        <label className="info-label">Exam Date</label>
                        <input type="date" className="form-control border-0 bg-light extra-small fw-bold py-2" value={examData.examDate} onChange={e => setExamData({...examData, examDate: e.target.value})} />
                     </div>
                     <div className="col-md-3">
                        <label className="info-label">Total Weightage</label>
                        <input type="number" className="form-control border-0 bg-light extra-small fw-bold py-2" value={examData.maxMarks} onChange={e => setExamData({...examData, maxMarks: Number(e.target.value)})} />
                     </div>
                     <div className="col-md-6 text-end d-flex align-items-end justify-content-end gap-2">
                        <div className="badge bg-light text-dark extra-small fw-bold px-3 py-2 border rounded-pill shadow-sm">STUDENTS: {students.length}</div>
                        <div className="badge bg-success bg-opacity-10 text-success extra-small fw-800 px-3 py-2 border border-success border-opacity-25 rounded-pill shadow-sm">AUTO-SAVE: ACTIVE</div>
                     </div>
                  </div>
               </div>
            </div>

            {/* MARKS ENTRY TABLE */}
            <div className="col-12">
               <div className="card border-0 premium-shadow rounded-4 bg-white overflow-hidden shadow-lg mb-5">
                  <div className="table-responsive">
                     <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light-subtle sticky-top">
                           <tr>
                              <th className="info-label border-0 ps-4 py-3" style={{ width: '300px' }}>Student Identity</th>
                              <th className="info-label border-0 py-3 text-center" style={{ width: '100px' }}>Absent?</th>
                              <th className="info-label border-0 py-3" style={{ width: '150px' }}>Marks Obtained</th>
                              <th className="info-label border-0 py-3" style={{ width: '150px' }}>Grade</th>
                              <th className="info-label border-0 pe-4 py-3">Remarks / Feedback</th>
                           </tr>
                        </thead>
                        <tbody>
                           {loading ? (
                              <tr><td colSpan={5} className="text-center py-5"><LoadingSpinner /></td></tr>
                           ) : students.length > 0 ? students.map((s, idx) => {
                              const pct = (s.marksObtained / examData.maxMarks) * 100;
                              let grade = 'F';
                              if (s.isAbsent) grade = 'AB';
                              else if (pct >= 90) grade = 'A+';
                              else if (pct >= 80) grade = 'A';
                              else if (pct >= 70) grade = 'B+';
                              else if (pct >= 60) grade = 'B';
                              else if (pct >= 50) grade = 'C';
                              else if (pct >= 33) grade = 'D';

                              return (
                                 <tr key={idx} className={s.isAbsent ? 'bg-light-subtle opacity-75' : ''}>
                                    <td className="ps-4">
                                       <div className="d-flex align-items-center gap-3">
                                          <div className="ds-user-avatar shadow-sm border border-white" style={{ width: 32, height: 32, fontSize: '0.75rem', borderRadius: '10px' }}>{s.name[0]}</div>
                                          <div>
                                             <div className="fw-900 text-dark extra-small">{s.name}</div>
                                             <div className="text-muted fw-bold" style={{ fontSize: '0.6rem' }}>ADM: {s.admissionNo}</div>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="text-center">
                                       <div className="form-check form-switch d-inline-block">
                                          <input className="form-check-input" type="checkbox" checked={s.isAbsent} onChange={e => handleMarkChange(idx, 'isAbsent', e.target.checked)} />
                                       </div>
                                    </td>
                                    <td>
                                       <input 
                                          type="number" 
                                          className={`form-control form-control-sm border-0 bg-light extra-small fw-900 py-1 shadow-sm ${s.isAbsent ? 'disabled' : ''}`} 
                                          value={s.marksObtained} 
                                          disabled={s.isAbsent}
                                          onChange={e => handleMarkChange(idx, 'marksObtained', Number(e.target.value))}
                                          max={examData.maxMarks}
                                          style={{ width: '80px' }}
                                       />
                                    </td>
                                    <td>
                                       <span className={`badge rounded-pill extra-small fw-900 px-3 py-1 shadow-sm ${grade === 'A+' || grade === 'A' ? 'bg-success text-white' : grade === 'F' || grade === 'AB' ? 'bg-danger text-white' : 'bg-warning text-dark'}`}>
                                          {grade}
                                       </span>
                                    </td>
                                    <td className="pe-4">
                                       <input 
                                          type="text" 
                                          className="form-control form-control-sm border-0 bg-light extra-small fw-bold py-1 shadow-sm" 
                                          placeholder="Enter internal comments..." 
                                          value={s.remarks}
                                          onChange={e => handleMarkChange(idx, 'remarks', e.target.value)}
                                       />
                                    </td>
                                 </tr>
                              );
                           }) : (
                              <tr><td colSpan={5} className="text-center py-5 text-muted extra-small fw-bold">No students identified for this section.</td></tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <style jsx>{`
        .extra-small { font-size: 0.65rem; }
        .info-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 2px; }
        .premium-shadow { box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05) !important; }
        .max-w-1400 { max-width: 1400px; }
        .bg-light-subtle { background: #fcfcfd; }
        .bg-brand { background: #4f46e5; }
        .text-brand { color: #4f46e5; }
      `}</style>
    </DashboardShell>
  );
}
