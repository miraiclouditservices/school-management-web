'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '../../../components/DashboardShell';
import { 
  StatCard, LoadingSpinner, FormModal 
} from '../../../components/UIComponents';
import api from '../../../lib/api';
import { DEPARTMENTS, EXAM_TYPES } from '../../../lib/constants';

interface ExamStats {
  subject: string;
  maxMarks: number;
  classAverage: number;
  highest: number;
  lowest: number;
  passPercentage: number;
  studentsAppeared: number;
}

interface ExamRecord {
  _id: string;
  className: string;
  section: string;
  subject: string;
  examName: string;
  maxMarks: number;
  examDate: string;
  approvalStatus: 'Pending' | 'Approved';
  enteredBy: { name: string };
}

export default function MarksDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ExamStats[]>([]);
  const [records, setRecords] = useState<ExamRecord[]>([]);
  const [filters, setFilters] = useState({ className: 'Class 10', section: 'A', examName: 'Mid-Term' });
  const [summary, setSummary] = useState({
     totalExams: 0,
     avgPassRate: 0,
     pendingApprovals: 0,
     toppersCount: 0
  });

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newExam, setNewExam] = useState({
     examName: '',
     examType: 'Mid-Term',
     className: 'Class 10',
     section: 'A',
     subject: 'Mathematics',
     maxMarks: 100,
     examDate: new Date().toISOString().split('T')[0]
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, recordsRes] = await Promise.all([
         api.get<ExamStats[]>('/marks/stats', filters),
         api.get<ExamRecord[]>('/marks', { approvalStatus: 'Pending' })
      ]);
      
      setStats(statsRes.data || []);
      setRecords(recordsRes.data || []);
      
      // Real Summary Logic
      const activeExams = statsRes.data?.length || 0;
      const passRate = statsRes.data?.length 
         ? (statsRes.data.reduce((a, b) => a + b.passPercentage, 0) / statsRes.data.length).toFixed(1) 
         : 0;

      setSummary({
         totalExams: activeExams,
         avgPassRate: Number(passRate),
         pendingApprovals: recordsRes.data?.length || 0,
         toppersCount: statsRes.data?.filter(s => s.passPercentage > 90).length || 0
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [filters]);

  const approveMarks = async (id: string) => {
     try {
        await api.put(`/marks/${id}/approve`);
        loadData();
     } catch (e) { console.error(e); }
  };

  const scheduleExam = async (e: React.FormEvent) => {
     e.preventDefault();
     try {
        // Just creating the metadata record
        await api.post('/marks', { ...newExam, marks: [] });
        setShowScheduleModal(false);
        loadData();
     } catch (e) { console.error(e); }
  };

  return (
    <DashboardShell role="admin">
      {/* HEADER SECTION */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-800 mb-0">Marks & Report Cards</h4>
          <p className="text-muted extra-small fw-bold mb-0 text-uppercase opacity-75">Institutional Academic Grading & Results</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-white btn-sm px-3 rounded-pill premium-shadow border-0 extra-small fw-bold text-dark"><i className="bi bi-file-earmark-pdf me-1"/>Bulk Reports</button>
          <button className="btn btn-primary btn-sm px-4 rounded-pill premium-shadow border-0 extra-small fw-800" onClick={() => setShowScheduleModal(true)}><i className="bi bi-calendar-plus me-1"/>Schedule New Exam</button>
        </div>
      </div>

      {/* HORIZONTAL ANALYTICS CARDS (REAL DATA) */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <StatCard horizontal={true} icon="bi-journal-check" iconBg="rgba(59, 130, 246, 0.1)" label="Subjects Tracked" value={summary.totalExams.toString()} />
        </div>
        <div className="col-md-3 col-6">
          <StatCard horizontal={true} icon="bi-graph-up" iconBg="rgba(16, 185, 129, 0.1)" label="Avg Pass Rate" value={`${summary.avgPassRate}%`} />
        </div>
        <div className="col-md-3 col-6">
          <StatCard horizontal={true} icon="bi-clock-history" iconBg="rgba(245, 158, 11, 0.1)" label="Pending Approval" value={summary.pendingApprovals.toString()} />
        </div>
        <div className="col-md-3 col-6">
          <StatCard horizontal={true} icon="bi-award" iconBg="rgba(139, 92, 246, 0.1)" label="Class Toppers" value={summary.toppersCount.toString()} />
        </div>
      </div>

      <div className="row g-4">
        {/* ACADEMIC PERFORMANCE TABLE */}
        <div className="col-lg-8">
           <div className="card border-0 premium-shadow rounded-4 bg-white overflow-hidden h-100 shadow-sm">
              <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                 <h6 className="fw-800 text-dark mb-0 extra-small text-uppercase">Result Summary: {filters.className} - {filters.examName}</h6>
                 <div className="d-flex gap-2">
                    <select className="form-select form-select-sm border-0 bg-light extra-small fw-bold rounded-pill px-3 shadow-sm" value={filters.className} onChange={e => setFilters({...filters, className: e.target.value})}>
                       {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select className="form-select form-select-sm border-0 bg-light extra-small fw-bold rounded-pill px-3 shadow-sm" value={filters.examName} onChange={e => setFilters({...filters, examName: e.target.value})}>
                       {['Unit Test 1', 'Mid-Term', 'Unit Test 2', 'Final Exam'].map(ex => <option key={ex} value={ex}>{ex}</option>)}
                    </select>
                 </div>
              </div>
              <div className="table-responsive">
                 <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light-subtle">
                       <tr>
                          <th className="info-label border-0 ps-4 py-3">Subject</th>
                          <th className="info-label border-0 py-3 text-center">Appeared</th>
                          <th className="info-label border-0 py-3 text-center">Class Avg</th>
                          <th className="info-label border-0 py-3 text-center">Highest</th>
                          <th className="info-label border-0 pe-4 py-3 text-end">Pass %</th>
                       </tr>
                    </thead>
                    <tbody>
                       {loading ? (
                          <tr><td colSpan={5} className="text-center py-5"><LoadingSpinner /></td></tr>
                       ) : stats.length > 0 ? stats.map((s, idx) => (
                          <tr key={idx}>
                             <td className="ps-4">
                                <div className="fw-900 text-dark extra-small mb-1">{s.subject}</div>
                                <div className="text-muted fw-bold" style={{fontSize:'0.6rem'}}>WEIGHTAGE: {s.maxMarks}</div>
                             </td>
                             <td className="text-center fw-900 text-dark extra-small">{s.studentsAppeared}</td>
                             <td className="text-center">
                                <div className="fw-900 text-primary extra-small">{s.classAverage}</div>
                                <div className="progress mx-auto shadow-none bg-light" style={{height:3, width:45}}><div className="progress-bar bg-primary rounded-pill shadow-none" style={{width: `${(s.classAverage/s.maxMarks)*100}%`}}/></div>
                             </td>
                             <td className="text-center fw-900 text-success extra-small">{s.highest}</td>
                             <td className="pe-4 text-end">
                                <span className={`badge rounded-pill extra-small fw-900 px-3 py-1 shadow-sm ${s.passPercentage >= 75 ? 'bg-success-subtle text-success' : s.passPercentage >= 33 ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger'}`}>
                                   {s.passPercentage}%
                                </span>
                             </td>
                          </tr>
                       )) : (
                          <tr><td colSpan={5} className="text-center py-5">
                             <div className="opacity-25 mb-2"><i className="bi bi-clipboard-data fs-2"/></div>
                             <div className="text-muted extra-small fw-bold">No examination records found for the selected criteria.</div>
                          </td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* SIDEBAR TOOLS */}
        <div className="col-lg-4">
           <div className="d-flex flex-column gap-4 h-100">
              {/* INDIVIDUAL PERFORMANCE SEARCH */}
              <div className="card border-0 premium-shadow rounded-4 bg-white p-4 shadow-sm">
                 <h6 className="fw-800 text-dark mb-3 extra-small text-uppercase d-flex align-items-center gap-2">
                    <i className="bi bi-person-badge text-primary"/> Student Performance
                 </h6>
                 <div className="input-group mb-0 shadow-sm rounded-pill overflow-hidden border border-light">
                    <span className="input-group-text bg-white border-0 ps-3"><i className="bi bi-search text-muted"/></span>
                    <input type="text" className="form-control border-0 extra-small fw-bold py-2" placeholder="Student UID or Name..." onKeyPress={(e) => e.key === 'Enter' && router.push(`/admin/marks/report-card/${(e.target as any).value}`)} />
                 </div>
                 <p className="text-muted extra-small fw-bold mt-2 mb-0 opacity-50 px-1">Press Enter to view official report card.</p>
              </div>

              {/* ADMINISTRATIVE APPROVALS */}
              <div className="card border-0 premium-shadow rounded-4 bg-white overflow-hidden flex-grow-1 shadow-sm">
                 <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                    <h6 className="fw-800 text-warning mb-0 extra-small text-uppercase">Result Approvals</h6>
                    <div className="badge bg-warning bg-opacity-10 text-warning extra-small">{records.length} ACTION REQUIRED</div>
                 </div>
                 <div className="p-3">
                    <div className="d-flex flex-column gap-2">
                       {records.length > 0 ? records.slice(0, 5).map(record => (
                          <div key={record._id} className="p-3 rounded-4 border bg-light-subtle d-flex justify-content-between align-items-center shadow-sm">
                             <div>
                                <div className="fw-900 text-dark extra-small mb-1">{record.subject} • {record.examName}</div>
                                <div className="text-muted fw-bold" style={{fontSize:'0.6rem'}}><i className="bi bi-person me-1"/>BY: {record.enteredBy?.name} • {record.className}</div>
                             </div>
                             <button className="btn btn-warning btn-xs py-1 px-3 rounded-pill extra-small fw-900 text-white shadow-sm" onClick={() => approveMarks(record._id)}>APPROVE</button>
                          </div>
                       )) : (
                          <div className="text-center py-5">
                             <i className="bi bi-check2-circle fs-3 text-success opacity-50 mb-2 d-block"/>
                             <div className="text-muted extra-small fw-bold">Institutional results are up-to-date.</div>
                          </div>
                       )}
                    </div>
                    {records.length > 0 && <button className="btn btn-outline-warning btn-sm w-100 rounded-pill mt-4 extra-small fw-900 py-2">MANAGE APPROVAL QUEUE</button>}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* SCHEDULE NEW EXAM MODAL */}
      <FormModal 
        show={showScheduleModal} 
        onClose={() => setShowScheduleModal(false)} 
        title="Schedule Academic Examination" 
        onSubmit={scheduleExam}
      >
        <div className="p-1">
           <div className="row g-3">
              <div className="col-md-6">
                 <label className="info-label">Examination Name</label>
                 <input type="text" className="form-control border-0 bg-light extra-small fw-bold py-2" placeholder="e.g. Unit Test 1" value={newExam.examName} onChange={e => setNewExam({...newExam, examName: e.target.value})} required />
              </div>
              <div className="col-md-6">
                 <label className="info-label">Examination Type</label>
                 <select className="form-select border-0 bg-light extra-small fw-bold py-2" value={newExam.examType} onChange={e => setNewExam({...newExam, examType: e.target.value})}>
                    {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                 </select>
              </div>
              <div className="col-md-4">
                 <label className="info-label">Class</label>
                 <select className="form-select border-0 bg-light extra-small fw-bold py-2" value={newExam.className} onChange={e => setNewExam({...newExam, className: e.target.value})}>
                    {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
              </div>
              <div className="col-md-4">
                 <label className="info-label">Section</label>
                 <select className="form-select border-0 bg-light extra-small fw-bold py-2" value={newExam.section} onChange={e => setNewExam({...newExam, section: e.target.value})}>
                    {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
              </div>
              <div className="col-md-4">
                 <label className="info-label">Subject</label>
                 <select className="form-select border-0 bg-light extra-small fw-bold py-2" value={newExam.subject} onChange={e => setNewExam({...newExam, subject: e.target.value})}>
                    {DEPARTMENTS.slice(0, 7).map(d => <option key={d} value={d}>{d}</option>)}
                 </select>
              </div>
              <div className="col-md-6">
                 <label className="info-label">Max Marks</label>
                 <input type="number" className="form-control border-0 bg-light extra-small fw-bold py-2" value={newExam.maxMarks} onChange={e => setNewExam({...newExam, maxMarks: Number(e.target.value)})} />
              </div>
              <div className="col-md-6">
                 <label className="info-label">Exam Date</label>
                 <input type="date" className="form-control border-0 bg-light extra-small fw-bold py-2" value={newExam.examDate} onChange={e => setNewExam({...newExam, examDate: e.target.value})} />
              </div>
           </div>
           <div className="alert alert-primary mt-4 rounded-4 border-0 extra-small fw-bold d-flex align-items-center gap-2">
              <i className="bi bi-info-circle-fill fs-6"/>
              Scheduling an exam notifies assigned teachers to prepare the question papers.
           </div>
        </div>
      </FormModal>

      <style jsx>{`
        .extra-small { font-size: 0.65rem; }
        .info-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 2px; }
        .premium-shadow { box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05) !important; }
        .bg-light-subtle { background: #fcfcfd; }
        .btn-xs { padding: 2px 8px; font-size: 0.6rem; }
        .transition-all { transition: all 0.2s ease; }
      `}</style>
    </DashboardShell>
  );
}
