'use client';
import { useState, useEffect } from 'react';
import DashboardShell from '../../../components/DashboardShell';
import { LoadingSpinner, StatusBadge, FormModal } from '../../../components/UIComponents';
import api from '../../../lib/api';
import { CLASSES, SECTIONS } from '../../../lib/constants';

export default function StaffAttendance() {
  const [filters, setFilters] = useState({ className: '1', section: 'A', date: new Date().toISOString().split('T')[0] });
  const [students, setStudents] = useState<any[]>([]);
  const [records, setRecords] = useState<Record<string, string>>({}); // studentId -> status
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students', { currentClass: filters.className, section: filters.section, limit: 1000 });
      setStudents(res.data || []);
      
      const attRes = await api.get('/attendance/summary', filters);
      if (attRes.success && attRes.data.records.length > 0) {
        const existing: Record<string, string> = {};
        attRes.data.records.forEach((r: any) => {
          existing[r.student._id] = r.status;
        });
        setRecords(existing);
        setIsLocked(true);
      } else {
        setRecords({});
        setIsLocked(false);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadStudents(); }, [filters.className, filters.section, filters.date]);

  const handleStatusChange = (studentId: string, status: string) => {
    if (isLocked) return;
    setRecords({ ...records, [studentId]: status });
  };

  const markAll = (status: string) => {
    if (isLocked) return;
    const newRecords: Record<string, string> = {};
    students.forEach(s => newRecords[s._id] = status);
    setRecords(newRecords);
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const payload = {
        className: filters.className,
        section: filters.section,
        date: filters.date,
        records: students.map(s => ({
          student: s._id,
          status: records[s._id] || 'Absent'
        }))
      };
      const res = await api.post('/attendance', payload);
      if (res.success) {
        setIsLocked(true);
        setShowPreview(false);
        alert('Attendance submitted and locked successfully!');
      } else {
        alert(res.message || 'Failed to save attendance');
      }
    } catch (e: any) { 
      alert(e.message || 'An error occurred while saving attendance'); 
    }
    setSaving(false);
  };

  const counts = {
    present: Object.values(records).filter(s => s === 'Present').length,
    absent: students.length - Object.values(records).filter(s => s === 'Present' || s === 'Late' || s === 'Leave').length,
    late: Object.values(records).filter(s => s === 'Late').length,
    leave: Object.values(records).filter(s => s === 'Leave').length
  };

  return (
    <DashboardShell role="staff">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-900 text-dark mb-1" style={{ letterSpacing: '-0.04em' }}>Student Attendance</h2>
          <p className="text-muted fw-semibold opacity-75">Mark daily attendance for Class {filters.className} - {filters.section}</p>
        </div>
        <div className="d-flex align-items-center gap-3">
           {isLocked && <span className="badge bg-success-subtle text-success border border-success border-opacity-10 px-3 py-2 rounded-pill fw-bold"><i className="bi bi-lock-fill me-1"/> SUBMITTED & LOCKED</span>}
           <input type="date" className="form-control border-0 shadow-sm rounded-pill px-4 fw-bold text-dark" value={filters.date} onChange={e => setFilters({...filters, date: e.target.value})} />
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="extra-small fw-800 text-muted uppercase mb-2">Class</label>
            <select className="form-select border-0 bg-light rounded-pill px-4 fw-bold shadow-none" value={filters.className} onChange={e => setFilters({...filters, className: e.target.value})}>
              {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="extra-small fw-800 text-muted uppercase mb-2">Section</label>
            <select className="form-select border-0 bg-light rounded-pill px-4 fw-bold shadow-none" value={filters.section} onChange={e => setFilters({...filters, section: e.target.value})}>
              {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-md-7 text-end">
            {!isLocked ? (
              <div className="d-flex gap-2 justify-content-end">
                <button className="btn btn-outline-success border-0 rounded-pill px-4 fw-bold" onClick={() => markAll('Present')}>Mark All Present</button>
                <button className="btn btn-primary rounded-pill px-5 fw-900 shadow" onClick={() => setShowPreview(true)} disabled={students.length === 0}>
                   SUBMIT ATTENDANCE
                </button>
              </div>
            ) : (
              <button className="btn btn-outline-primary border-2 rounded-pill px-4 fw-bold" onClick={() => setIsLocked(false)}>
                <i className="bi bi-pencil-square me-2"/>RE-EDIT ATTENDANCE
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5"><LoadingSpinner /></div>
      ) : students.length > 0 ? (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 py-3 small fw-bold text-muted border-0" style={{width: 120}}>ROLL NO</th>
                  <th className="py-3 small fw-bold text-muted border-0">STUDENT NAME</th>
                  <th className="py-3 small fw-bold text-muted border-0 text-center">STATUS</th>
                  <th className="pe-4 py-3 small fw-bold text-muted border-0 text-end">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className={isLocked ? 'opacity-75' : ''}>
                    <td className="ps-4">
                      <span className="badge bg-light text-primary border px-3 py-2 rounded-pill fw-900 small shadow-sm">
                        {student.rollNo || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-900 shadow-sm" style={{width: 40, height: 40, fontSize: '0.85rem'}}>
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div>
                          <p className="fw-900 text-dark mb-0 fs-6">{student.firstName} {student.lastName}</p>
                          <p className="extra-small text-muted fw-bold mb-0 uppercase opacity-75">ID: {student.admissionNo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <StatusBadge status={records[student._id] || 'Pending'} />
                    </td>
                    <td className="pe-4 text-end">
                      <div className={`btn-group btn-group-sm rounded-pill overflow-hidden border shadow-sm ${isLocked ? 'pointer-events-none opacity-50' : ''}`}>
                        <button className={`btn ${records[student._id] === 'Present' ? 'btn-success' : 'btn-white'} border-0 px-3 fw-bold`} onClick={() => handleStatusChange(student._id, 'Present')}>P</button>
                        <button className={`btn ${records[student._id] === 'Absent' ? 'btn-danger' : 'btn-white'} border-0 px-3 fw-bold`} onClick={() => handleStatusChange(student._id, 'Absent')}>A</button>
                        <button className={`btn ${records[student._id] === 'Late' ? 'btn-warning' : 'btn-white'} border-0 px-3 fw-bold`} onClick={() => handleStatusChange(student._id, 'Late')}>L</button>
                        <button className={`btn ${records[student._id] === 'Leave' ? 'btn-info' : 'btn-white'} border-0 px-3 fw-bold text-white`} onClick={() => handleStatusChange(student._id, 'Leave')}>LV</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm">
          <i className="bi bi-people-fill text-muted fs-1 mb-3 d-block opacity-25"></i>
          <h5 className="fw-800">No Students Found</h5>
          <p className="text-muted">No students are enrolled in Class {filters.className} - {filters.section}.</p>
        </div>
      )}

      {/* PREVIEW MODAL */}
      <FormModal show={showPreview} onClose={() => setShowPreview(false)} title="Review Attendance Submission" onSubmit={(e) => { e.preventDefault(); saveAttendance(); }}>
        <div className="text-center mb-4">
          <div className="bg-light p-4 rounded-4 mb-3">
             <h2 className="fw-900 text-dark mb-1">{students.length}</h2>
             <p className="text-muted fw-bold uppercase extra-small tracking-wider mb-0">Total Students</p>
          </div>
          <div className="row g-3">
            <div className="col-3">
              <div className="p-3 rounded-4 bg-success bg-opacity-10 text-success border border-success border-opacity-10">
                <h4 className="fw-900 mb-0">{counts.present}</h4>
                <p className="extra-small fw-bold mb-0 uppercase">Present</p>
              </div>
            </div>
            <div className="col-3">
              <div className="p-3 rounded-4 bg-danger bg-opacity-10 text-danger border border-danger border-opacity-10">
                <h4 className="fw-900 mb-0">{counts.absent}</h4>
                <p className="extra-small fw-bold mb-0 uppercase">Absent</p>
              </div>
            </div>
            <div className="col-3">
              <div className="p-3 rounded-4 bg-warning bg-opacity-10 text-warning border border-warning border-opacity-10">
                <h4 className="fw-900 mb-0">{counts.late}</h4>
                <p className="extra-small fw-bold mb-0 uppercase">Late</p>
              </div>
            </div>
            <div className="col-3">
              <div className="p-3 rounded-4 bg-info bg-opacity-10 text-info border border-info border-opacity-10">
                <h4 className="fw-900 mb-0">{counts.leave}</h4>
                <p className="extra-small fw-bold mb-0 uppercase">Leave</p>
              </div>
            </div>
          </div>
        </div>
        <div className="alert alert-warning border-0 rounded-4 p-3 d-flex align-items-center gap-3 mb-4">
           <i className="bi bi-exclamation-triangle-fill fs-4"></i>
           <p className="small fw-bold mb-0">Once submitted, the attendance for this class and date will be locked for verification.</p>
        </div>
        <div className="d-grid">
           <button type="submit" className="btn btn-primary rounded-pill py-3 fw-900 shadow" disabled={saving}>
             {saving ? 'Submitting...' : 'CONFIRM & SUBMIT'}
           </button>
        </div>
      </FormModal>

      <style jsx>{`
        .extra-small { font-size: 0.65rem; }
        .uppercase { text-transform: uppercase; }
        .tracking-wider { letter-spacing: 0.05em; }
        .pointer-events-none { pointer-events: none; }
      `}</style>
    </DashboardShell>
  );
}
