'use client';
import { useState, useEffect } from 'react';
import DashboardShell from '../../../components/DashboardShell';
import { LoadingSpinner, StatusBadge, FormModal } from '../../../components/UIComponents';
import api from '../../../lib/api';
import { CLASSES, SECTIONS } from '../../../lib/constants';

export default function StaffAttendance() {
  const [filters, setFilters] = useState({ className: 'Class 7', section: 'B', date: new Date().toISOString().split('T')[0] });
  const [students, setStudents] = useState<any[]>([]);
  const [records, setRecords] = useState<Record<string, string>>({}); // studentId -> status
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students', { currentClass: filters.className, section: filters.section, limit: 100 });
      setStudents(res.data || []);
      
      const attRes = await api.get('/attendance/summary', { ...filters, attendanceType: 'Student' });
      if (attRes.data && attRes.data.records?.length > 0) {
        const existing: Record<string, string> = {};
        attRes.data.records.forEach((r: any) => {
          existing[r.student._id] = r.status;
        });
        setRecords(existing);
        setSummary(attRes.data);
        setIsLocked(true);
      } else {
        setRecords({});
        setSummary(null);
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
        attendanceType: 'Student',
        className: filters.className,
        section: filters.section,
        date: filters.date,
        records: students.map(s => ({
          student: s._id,
          status: records[s._id] || 'Absent'
        }))
      };
      await api.post('/attendance', payload);
      setIsLocked(true);
      setShowPreview(false);
      alert('Attendance submitted successfully!');
      loadStudents();
    } catch (e: any) { 
      alert(e.message || 'An error occurred while saving attendance'); 
    }
    setSaving(false);
  };

  const counts = {
    present: Object.values(records).filter(s => s === 'Present').length,
    absent: students.length - Object.values(records).filter(s => ['Present', 'Late', 'Leave', 'Half Day'].includes(s)).length,
    late: Object.values(records).filter(s => s === 'Late').length,
    leave: Object.values(records).filter(s => s === 'Leave').length,
    halfDay: Object.values(records).filter(s => s === 'Half Day').length
  };

  return (
    <DashboardShell role="staff">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-900 text-dark mb-1" style={{ letterSpacing: '-0.04em' }}>Student Attendance</h2>
          <p className="text-muted fw-semibold opacity-75">Daily Presence Registry for {filters.className} - {filters.section}</p>
        </div>
        <div className="d-flex align-items-center gap-3">
           {isLocked && <span className="badge bg-success-subtle text-success border border-success border-opacity-10 px-3 py-2 rounded-pill fw-bold"><i className="bi bi-lock-fill me-1"/> SUBMITTED</span>}
           <input type="date" className="form-control border-0 shadow-sm rounded-pill px-4 fw-bold text-dark" value={filters.date} onChange={e => setFilters({...filters, date: e.target.value})} />
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="extra-small fw-800 text-muted uppercase mb-2">Class</label>
            <select className="form-select border-0 bg-light rounded-pill px-4 fw-bold shadow-none" value={filters.className} onChange={e => setFilters({...filters, className: e.target.value})}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
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
              <div className="d-flex align-items-center gap-3 justify-content-end">
                {summary?.markedBy && <span className="extra-small fw-bold text-muted">Marked By: {summary.markedBy.name}</span>}
                <button className="btn btn-outline-primary border-2 rounded-pill px-4 fw-bold" onClick={() => setIsLocked(false)}>
                  <i className="bi bi-pencil-square me-2"/>RE-EDIT
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5"><LoadingSpinner /></div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 py-3 small fw-bold text-muted border-0">STUDENT IDENTITY</th>
                  <th className="py-3 small fw-bold text-muted border-0 text-center">STATUS</th>
                  <th className="pe-4 py-3 small fw-bold text-muted border-0 text-end">MARKING</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-900 shadow-sm" style={{width: 36, height: 36, fontSize: '0.75rem'}}>
                          {student.firstName[0]}
                        </div>
                        <div>
                          <p className="fw-900 text-dark mb-0 extra-small">{student.firstName} {student.lastName}</p>
                          <p className="extra-small text-muted fw-bold mb-0 opacity-75">ID: {student.admissionNo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <StatusBadge status={records[student._id] || 'Absent'} />
                    </td>
                    <td className="pe-4 text-end">
                      <div className={`btn-group btn-group-sm rounded-pill overflow-hidden border shadow-sm ${isLocked ? 'pointer-events-none opacity-50' : ''}`}>
                        {[
                          { s: 'Present', l: 'P', c: 'success' },
                          { s: 'Absent', l: 'A', c: 'danger' },
                          { s: 'Late', l: 'L', c: 'warning' },
                          { s: 'Leave', l: 'LV', c: 'info' },
                          { s: 'Half Day', l: 'H', c: 'secondary' }
                        ].map(st => (
                          <button 
                            key={st.s} 
                            className={`btn ${records[student._id] === st.s ? `btn-${st.c}` : 'btn-white'} border-0 px-3 fw-bold`} 
                            onClick={() => handleStatusChange(student._id, st.s)}
                            style={{fontSize: '0.65rem'}}
                          >
                            {st.l}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan={3} className="text-center py-5 text-muted fw-bold">No students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      <FormModal show={showPreview} onClose={() => setShowPreview(false)} title="Attendance Summary" onSubmit={(e) => { e.preventDefault(); saveAttendance(); }}>
        <div className="row g-2 mb-4">
          {[
            { l: 'Present', v: counts.present, c: 'success' },
            { l: 'Absent', v: counts.absent, c: 'danger' },
            { l: 'Late', v: counts.late, c: 'warning' },
            { l: 'Leave', v: counts.leave, c: 'info' },
            { l: 'Half Day', v: counts.halfDay, c: 'secondary' }
          ].map(c => (
            <div key={c.l} className="col">
              <div className={`p-2 rounded-3 text-center border bg-${c.c} bg-opacity-10 text-${c.c}`}>
                <h5 className="fw-900 mb-0">{c.v}</h5>
                <p className="extra-small fw-bold mb-0 uppercase">{c.l}</p>
              </div>
            </div>
          ))}
        </div>
        <button type="submit" className="btn btn-primary rounded-pill w-100 py-3 fw-900 shadow" disabled={saving}>
          {saving ? 'Submitting...' : 'CONFIRM SUBMISSION'}
        </button>
      </FormModal>

      <style jsx>{`
        .extra-small { font-size: 0.65rem; }
        .uppercase { text-transform: uppercase; }
        .pointer-events-none { pointer-events: none; }
      `}</style>
    </DashboardShell>
  );
}
