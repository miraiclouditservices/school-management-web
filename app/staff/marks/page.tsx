'use client';
import { useState, useEffect } from 'react';
import DashboardShell from '../../../components/DashboardShell';
import { LoadingSpinner } from '../../../components/UIComponents';
import api from '../../../lib/api';
import { CLASSES, SECTIONS, EXAM_TYPES } from '../../../lib/constants';

export default function StaffMarks() {
  const [filters, setFilters] = useState({ className: '1', section: 'A', examName: 'Mid-Term', subject: 'Mathematics' });
  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<Record<string, any>>({}); // studentId -> { marksObtained, remarks, isAbsent }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [maxMarks, setMaxMarks] = useState(100);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students', { currentClass: filters.className, section: filters.section, limit: 1000 });
      setStudents(res.data || []);
      
      const marksRes = await api.get('/marks', { ...filters });
      if (marksRes.success && marksRes.data.length > 0) {
        const record = marksRes.data[0];
        setMaxMarks(record.maxMarks);
        const existing: Record<string, any> = {};
        record.marks.forEach((m: any) => {
          existing[m.student._id] = { marksObtained: m.marksObtained, remarks: m.remarks, isAbsent: m.isAbsent };
        });
        setMarks(existing);
      } else {
        setMarks({});
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadStudents(); }, [filters.className, filters.section, filters.examName, filters.subject]);

  const handleMarkChange = (studentId: string, field: string, value: any) => {
    setMarks({ ...marks, [studentId]: { ...(marks[studentId] || {}), [field]: value } });
  };

  const saveMarks = async () => {
    setSaving(true);
    try {
      const payload = {
        ...filters,
        maxMarks,
        marks: students.map(s => ({
          student: s._id,
          marksObtained: marks[s._id]?.marksObtained || 0,
          remarks: marks[s._id]?.remarks || '',
          isAbsent: marks[s._id]?.isAbsent || false
        }))
      };
      await api.post('/marks', payload);
      alert('Marks saved successfully!');
      loadStudents();
    } catch (e) { alert('Failed to save marks'); }
    setSaving(false);
  };

  return (
    <DashboardShell role="staff">
      <div className="mb-4">
        <h2 className="fw-900 text-dark mb-1" style={{ letterSpacing: '-0.04em' }}>Marks & Report Cards</h2>
        <p className="text-muted fw-semibold opacity-75">Upload and manage exam results for Class {filters.className} - {filters.section}</p>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="row g-3">
          <div className="col-md-2">
            <label className="extra-small fw-800 text-muted uppercase mb-2">Class</label>
            <select className="form-select border-0 bg-light rounded-pill px-4 fw-bold" value={filters.className} onChange={e => setFilters({...filters, className: e.target.value})}>
              {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="extra-small fw-800 text-muted uppercase mb-2">Section</label>
            <select className="form-select border-0 bg-light rounded-pill px-4 fw-bold" value={filters.section} onChange={e => setFilters({...filters, section: e.target.value})}>
              {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <label className="extra-small fw-800 text-muted uppercase mb-2">Exam</label>
            <select className="form-select border-0 bg-light rounded-pill px-4 fw-bold" value={filters.examName} onChange={e => setFilters({...filters, examName: e.target.value})}>
              {EXAM_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <label className="extra-small fw-800 text-muted uppercase mb-2">Subject</label>
            <input type="text" className="form-control border-0 bg-light rounded-pill px-4 fw-bold" value={filters.subject} onChange={e => setFilters({...filters, subject: e.target.value})} />
          </div>
          <div className="col-md-2">
            <label className="extra-small fw-800 text-muted uppercase mb-2">Max Marks</label>
            <input type="number" className="form-control border-0 bg-light rounded-pill px-4 fw-bold" value={maxMarks} onChange={e => setMaxMarks(Number(e.target.value))} />
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
                  <th className="ps-4 py-3 small fw-bold text-muted border-0">ROLL NO</th>
                  <th className="py-3 small fw-bold text-muted border-0">STUDENT</th>
                  <th className="py-3 small fw-bold text-muted border-0 text-center" style={{ width: '150px' }}>MARKS</th>
                  <th className="py-3 small fw-bold text-muted border-0">REMARKS</th>
                  <th className="pe-4 py-3 small fw-bold text-muted border-0 text-center">ABSENT</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    <td className="ps-4 fw-bold text-primary">{s.rollNo || '-'}</td>
                    <td className="fw-800 text-dark">{s.firstName} {s.lastName}</td>
                    <td>
                      <input 
                        type="number" 
                        className="form-control form-control-sm border-0 bg-light text-center fw-bold rounded-pill" 
                        value={marks[s._id]?.marksObtained || 0} 
                        disabled={marks[s._id]?.isAbsent}
                        onChange={e => handleMarkChange(s._id, 'marksObtained', Number(e.target.value))} 
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        className="form-control form-control-sm border-0 bg-light fw-bold rounded-pill" 
                        placeholder="Feedback..." 
                        value={marks[s._id]?.remarks || ''} 
                        onChange={e => handleMarkChange(s._id, 'remarks', e.target.value)} 
                      />
                    </td>
                    <td className="pe-4 text-center">
                      <input 
                        type="checkbox" 
                        className="form-check-input shadow-none" 
                        checked={marks[s._id]?.isAbsent || false} 
                        onChange={e => handleMarkChange(s._id, 'isAbsent', e.target.checked)} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-top text-end bg-light-subtle">
            <button className="btn btn-primary rounded-pill px-5 fw-900 shadow" onClick={saveMarks} disabled={saving}>
              {saving ? 'Publishing...' : 'Publish Marks'}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm">
          <i className="bi bi-journal-x text-muted fs-1 mb-3 d-block opacity-25"></i>
          <h5 className="fw-800">No Students Found</h5>
          <p className="text-muted">No students enrolled in Class {filters.className} - {filters.section}.</p>
        </div>
      )}
    </DashboardShell>
  );
}
