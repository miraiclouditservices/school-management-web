'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardShell from '../../../../components/DashboardShell';
import { 
  LoadingSpinner 
} from '../../../../components/UIComponents';
import api from '../../../../lib/api';
import { CLASSES, SECTIONS } from '../../../../lib/constants';

function MarkAttendanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') as 'Student' | 'Staff') || 'Student';

  const [loading, setLoading] = useState(false);
  const [entities, setEntities] = useState<any[]>([]);
  const [attendanceType, setAttendanceType] = useState<'Student' | 'Staff'>(initialType);
  const [filters, setFilters] = useState({ 
    className: 'Class 7', 
    section: 'B', 
    date: new Date().toISOString().split('T')[0] 
  });
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Students or Staff
      const endpoint = attendanceType === 'Student' ? '/students' : '/staff';
      const params = attendanceType === 'Student' ? { 
        currentClass: filters.className, 
        section: filters.section,
        limit: 100 
      } : { limit: 100 };
      
      const res = await api.get(endpoint, params);
      const data = res.data || [];
      setEntities(data);
      
      // 2. Initialize state
      const initialAttendance: Record<string, string> = {};
      const initialRemarks: Record<string, string> = {};
      
      // 3. Fetch existing attendance for this date
      const existingParams: any = { 
        attendanceType,
        date: filters.date 
      };
      if (attendanceType === 'Student') {
        existingParams.className = filters.className;
        existingParams.section = filters.section;
      }

      const existing = await api.get('/attendance/summary', existingParams);
      
      if (existing.data && existing.data.records?.length > 0) {
        existing.data.records.forEach((r: any) => {
          const id = attendanceType === 'Student' ? r.student?._id : r.staff?._id;
          if (id) {
            initialAttendance[id] = r.status;
            initialRemarks[id] = r.remarks || '';
          }
        });
      } else {
        data.forEach((e: any) => {
          initialAttendance[e._id] = 'Present';
        });
      }
      
      setAttendance(initialAttendance);
      setRemarks(initialRemarks);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [attendanceType, filters.className, filters.section, filters.date]);

  const handleStatusChange = (id: string, status: string) => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = entities.map(e => ({
        [attendanceType === 'Student' ? 'student' : 'staff']: e._id,
        status: attendance[e._id] || 'Absent',
        remarks: remarks[e._id] || ''
      }));

      await api.post('/attendance', {
        attendanceType,
        className: attendanceType === 'Student' ? filters.className : undefined,
        section: attendanceType === 'Student' ? filters.section : undefined,
        date: filters.date,
        records
      });
      
      alert('Attendance saved successfully!');
      router.push('/admin/attendance');
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  return (
    <DashboardShell role="admin">
      <div className="container-fluid py-3">
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
             <button className="btn btn-light rounded-circle p-0 d-flex align-items-center justify-content-center" style={{width:32, height:32}} onClick={() => router.back()}><i className="bi bi-arrow-left"/></button>
             <div>
               <h5 className="fw-800 mb-0">Attendance Registry Marking</h5>
               <p className="text-muted extra-small fw-bold mb-0 text-uppercase opacity-75">Marking session for {attendanceType}s</p>
             </div>
          </div>
          <div className="d-flex gap-2">
            <div className="bg-light p-1 rounded-pill d-flex shadow-sm me-2">
               {['Student', 'Staff'].map((t: any) => (
                 <button 
                    key={t} 
                    className={`btn btn-sm rounded-pill px-3 py-1 extra-small fw-800 border-0 ${attendanceType === t ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}
                    onClick={() => setAttendanceType(t)}
                 >
                    {t}s
                 </button>
               ))}
            </div>
            <button className="btn btn-primary rounded-pill px-4 fw-800 extra-small shadow-sm" onClick={handleSave} disabled={saving || entities.length === 0}>
              {saving ? <LoadingSpinner size="sm" /> : 'Save Registry'}
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="card border-0 premium-shadow rounded-4 bg-white mb-4">
           <div className="card-body p-3">
              <div className="row g-3 align-items-end">
                 <div className="col-md-4">
                    <label className="info-label">Marking Date</label>
                    <input type="date" className="form-control form-control-sm border-0 bg-light extra-small fw-bold" value={filters.date} onChange={e => setFilters({...filters, date: e.target.value})} />
                 </div>
                 {attendanceType === 'Student' && (
                   <>
                     <div className="col-md-3">
                        <label className="info-label">Class</label>
                        <select className="form-select form-select-sm border-0 bg-light extra-small fw-bold" value={filters.className} onChange={e => setFilters({...filters, className: e.target.value})}>
                           {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                     </div>
                     <div className="col-md-3">
                        <label className="info-label">Section</label>
                        <select className="form-select form-select-sm border-0 bg-light extra-small fw-bold" value={filters.section} onChange={e => setFilters({...filters, section: e.target.value})}>
                           {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                     </div>
                   </>
                 )}
              </div>
           </div>
        </div>

        {/* TABLE */}
        <div className="card border-0 premium-shadow rounded-4 bg-white overflow-hidden">
           <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                 <thead className="bg-light-subtle">
                    <tr>
                       <th className="info-label border-0 ps-4 py-3">Identity Name</th>
                       <th className="info-label border-0 py-3 text-center">Identity ID</th>
                       <th className="info-label border-0 py-3 text-center">Status Selection</th>
                       <th className="info-label border-0 pe-4 py-3">Remarks / Notes</th>
                    </tr>
                 </thead>
                 <tbody>
                    {loading ? (
                       <tr><td colSpan={4} className="text-center py-5"><LoadingSpinner /></td></tr>
                    ) : entities.length > 0 ? entities.map(e => (
                       <tr key={e._id}>
                          <td className="ps-4">
                             <div className="fw-800 text-dark extra-small">{attendanceType === 'Student' ? `${e.firstName} ${e.lastName}` : e.name}</div>
                             {attendanceType === 'Staff' && <div className="text-muted extra-small fw-bold">{e.designation}</div>}
                          </td>
                          <td className="text-center text-muted extra-small fw-bold">{attendanceType === 'Student' ? e.admissionNo : e.staffId}</td>
                          <td className="text-center">
                             <div className="btn-group btn-group-sm rounded-pill overflow-hidden border shadow-sm">
                                {[
                                  { s: 'Present', l: 'P', c: 'success' },
                                  { s: 'Absent', l: 'A', c: 'danger' },
                                  { s: 'Late', l: 'L', c: 'warning' },
                                  { s: 'Leave', l: 'Lv', c: 'info' },
                                  { s: 'Half Day', l: 'H', c: 'secondary' }
                                ].map(status => (
                                   <button 
                                      key={status.s} 
                                      className={`btn extra-small fw-800 border-0 ${attendance[e._id] === status.s ? `btn-${status.c}` : 'btn-light text-muted'}`}
                                      onClick={() => handleStatusChange(e._id, status.s)}
                                      style={{fontSize: '0.6rem', padding: '4px 8px', minWidth: '32px'}}
                                      title={status.s}
                                   >
                                      {status.l}
                                   </button>
                                ))}
                             </div>
                          </td>
                          <td className="pe-4">
                             <input 
                                className="form-control form-control-sm border-0 bg-light extra-small" 
                                placeholder="Note..." 
                                value={remarks[e._id] || ''} 
                                onChange={e => setRemarks(prev => ({ ...prev, [e._id]: e.target.value }))}
                             />
                          </td>
                       </tr>
                    )) : (
                       <tr><td colSpan={4} className="text-center py-5 text-muted extra-small fw-bold">No records found.</td></tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
      <style jsx>{`
        .extra-small { font-size: 0.65rem; }
        .info-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 2px; }
        .premium-shadow { box-shadow: 0 5px 20px -5px rgba(0, 0, 0, 0.05) !important; }
      `}</style>
    </DashboardShell>
  );
}

export default function MarkAttendancePage() {
  return (
    <Suspense fallback={<div className="p-5 text-center"><LoadingSpinner /></div>}>
      <MarkAttendanceContent />
    </Suspense>
  );
}
