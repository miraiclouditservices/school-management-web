'use client';
import React, { useState, useEffect } from 'react';
import DashboardShell from '../../../components/DashboardShell';
import { LoadingSpinner, FormModal } from '../../../components/UIComponents';
import api from '../../../lib/api';
import { CLASSES, SECTIONS } from '../../../lib/constants';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

interface Period {
  day: string;
  periodNo: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacher?: string;
  teacherName?: string;
  isBreak?: boolean;
}

export default function TimetablePage() {
  const [loading, setLoading] = useState(true);
  const [timetable, setTimetable] = useState<any>(null);
  const [filters, setFilters] = useState({ className: 'Class 10', section: 'A' });
  const [staff, setStaff] = useState<any[]>([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [slotData, setSlotData] = useState({
     subject: '',
     teacher: '',
     teacherName: '',
     startTime: '09:00',
     endTime: '09:45',
     isBreak: false
  });

  const [activeAY, setActiveAY] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load Timetable
      const ttRes = await api.get<any>('/timetable', filters);
      setTimetable(ttRes.data?.[0] || null);
      
      // 2. Load Staff (Crucial)
      const staffRes = await api.get<any>('/staff', { limit: 1000 });
      let staffList: any[] = [];
      if (staffRes) {
         if (Array.isArray(staffRes.data)) staffList = staffRes.data;
         else if (staffRes.data && Array.isArray(staffRes.data.data)) staffList = staffRes.data.data;
         else if (Array.isArray(staffRes)) staffList = staffRes as any;
      }
      setStaff(staffList);
      
      // 3. Load Academic Year (Optional fallback)
      try {
         const ayRes = await api.get<any>('/academic-years/active');
         setActiveAY(ayRes.data);
      } catch (ayErr) { console.warn('AY Load Failed', ayErr); }

    } catch (e) { console.error('Timetable Critical Load Error:', e); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [filters]);

  const [showClassTeacherModal, setShowClassTeacherModal] = useState(false);
  const [selectedClassTeacher, setSelectedClassTeacher] = useState('');

  const saveClassTeacher = async (e: React.FormEvent) => {
     e.preventDefault();
     try {
        const payload = { 
           classTeacher: selectedClassTeacher,
           academicYear: activeAY?._id 
        };
        if (timetable?._id) {
           await api.put(`/timetable/${timetable._id}`, payload);
        } else {
           await api.post('/timetable', { ...filters, ...payload, periods: [], effectiveFrom: new Date() });
        }
        setShowClassTeacherModal(false);
        loadData();
     } catch (e) { console.error(e); }
  };

  const handleSlotClick = (day: string, periodNo: number) => {
     const existing = timetable?.periods?.find((p: any) => p.day === day && p.periodNo === periodNo);
     setSelectedSlot({ day, periodNo });
     setSlotData({
        subject: existing?.subject || '',
        teacher: existing?.teacher || '',
        teacherName: existing?.teacherName || '',
        startTime: existing?.startTime || '09:00',
        endTime: existing?.endTime || '09:45',
        isBreak: existing?.isBreak || false
     });
     setShowEditModal(true);
  };

  const saveSlot = async (e: React.FormEvent) => {
     e.preventDefault();
     const updatedPeriods = [...(timetable?.periods || [])];
     const idx = updatedPeriods.findIndex(p => p.day === selectedSlot.day && p.periodNo === selectedSlot.periodNo);
     
     const newPeriod = { ...selectedSlot, ...slotData, className: filters.className, section: filters.section };
     if (idx > -1) updatedPeriods[idx] = newPeriod;
     else updatedPeriods.push(newPeriod);

     try {
        const payload = { 
           periods: updatedPeriods,
           academicYear: activeAY?._id 
        };
        if (timetable?._id) {
           await api.put(`/timetable/${timetable._id}`, payload);
        } else {
           await api.post('/timetable', { ...filters, ...payload, effectiveFrom: new Date() });
        }
        setShowEditModal(false);
        loadData();
     } catch (e) { console.error(e); }
  };

  const getSlot = (day: string, periodNo: number) => {
     return timetable?.periods?.find((p: any) => p.day === day && p.periodNo === periodNo);
  };

  return (
    <DashboardShell role="admin">
      {/* PROFESSIONAL HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-4">
        <div>
          <h4 className="fw-900 mb-0 text-dark">Timetable Management</h4>
          <p className="text-muted extra-small fw-bold mb-0 text-uppercase opacity-75 d-flex align-items-center gap-2">
            <i className="bi bi-gear-fill text-primary"/> Academic Scheduling & Faculty Assignment
          </p>
        </div>
        <div className="d-flex gap-2">
           <button className="btn btn-white btn-sm px-3 rounded-pill premium-shadow border-0 extra-small fw-800 text-dark">
              <i className="bi bi-files me-1"/> Copy Template
           </button>
           <button className="btn btn-primary btn-sm px-4 rounded-pill premium-shadow border-0 extra-small fw-900 shadow-sm transition-all" onClick={() => setShowClassTeacherModal(true)}>
              <i className="bi bi-person-plus-fill me-1"/> Assign Class Teacher
           </button>
        </div>
      </div>

      {/* REFINED FILTERS BAR */}
      <div className="card border-0 premium-shadow rounded-4 bg-white p-3 mb-4 shadow-sm">
         <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-4">
               <div style={{ minWidth: 150 }}>
                  <label className="info-label opacity-50">Select Class</label>
                  <select className="form-select form-select-sm border-0 bg-light extra-small fw-900 rounded-pill px-3 py-2 shadow-none" value={filters.className} onChange={e => setFilters({...filters, className: e.target.value})}>
                     {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                  </select>
               </div>
               <div style={{ minWidth: 100 }}>
                  <label className="info-label opacity-50">Section</label>
                  <select className="form-select form-select-sm border-0 bg-light extra-small fw-900 rounded-pill px-3 py-2 shadow-none" value={filters.section} onChange={e => setFilters({...filters, section: e.target.value})}>
                     {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>
            </div>
            <div className="text-end">
               <div className="info-label opacity-50 mb-1">Class Teacher</div>
               <div className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill extra-small fw-800">
                  <i className="bi bi-person-check-fill me-2"/>
                  {timetable?.classTeacher?.name || 'NOT ASSIGNED'}
               </div>
            </div>
         </div>
      </div>

      {loading ? (
        <div className="p-5 text-center"><LoadingSpinner /></div>
      ) : (
        <div className="card border-0 premium-shadow rounded-4 bg-white overflow-hidden shadow-lg border-top border-5 border-primary">
          <div className="table-responsive">
            <table className="table table-bordered align-middle mb-0 text-center">
              <thead className="bg-light">
                <tr>
                  <th className="info-label py-3 text-center border-0 bg-white" style={{ width: 80 }}>TIME / DAY</th>
                  {DAYS.map(day => <th key={day} className="info-label py-3 text-center border-0 text-primary">{day.toUpperCase()}</th>)}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map(pNo => (
                  <tr key={pNo}>
                    <td className="bg-light-subtle border-0 py-3">
                       <div className="fw-900 text-dark extra-small">PERIOD {pNo}</div>
                       <div className="text-muted fw-bold" style={{fontSize:'0.6rem'}}>{pNo === 4 ? 'Break' : 'Active'}</div>
                    </td>
                    {DAYS.map(day => {
                       const slot = getSlot(day, pNo);
                       return (
                          <td key={`${day}-${pNo}`} className="p-1 border-0" onClick={() => handleSlotClick(day, pNo)}>
                             <div className={`timetable-slot rounded-3 p-2 transition-all cursor-pointer ${slot?.isBreak ? 'bg-warning-subtle' : slot?.subject ? 'bg-primary-subtle border-start border-3 border-primary' : 'bg-light opacity-50'}`} style={{ minHeight: 60 }}>
                                {slot ? (
                                   <>
                                      <div className="fw-900 text-dark extra-small text-uppercase mb-1">{slot.subject}</div>
                                      <div className="text-muted fw-800" style={{fontSize:'0.6rem'}}><i className="bi bi-person me-1"/>{slot.teacherName || 'Not Assigned'}</div>
                                      <div className="text-primary-emphasis fw-bold" style={{fontSize:'0.55rem'}}><i className="bi bi-clock me-1"/>{slot.startTime} - {slot.endTime}</div>
                                   </>
                                ) : (
                                   <div className="text-muted extra-small fw-bold opacity-50 py-3">Assign</div>
                                )}
                             </div>
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

      {/* SLOT EDIT MODAL */}
      <FormModal 
        show={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        title={`Scheduling Period ${selectedSlot?.periodNo} - ${selectedSlot?.day}`}
        onSubmit={saveSlot}
      >
        <div className="p-1">
           <div className="row g-3">
              <div className="col-12">
                 <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" checked={slotData.isBreak} onChange={e => setSlotData({...slotData, isBreak: e.target.checked})} />
                    <label className="info-label ms-2">Mark as Break / Lunch Period</label>
                 </div>
              </div>
              {!slotData.isBreak && (
                 <>
                    <div className="col-md-6">
                       <label className="info-label">Select Subject</label>
                       <input type="text" className="form-control border-0 bg-light extra-small fw-bold py-2" placeholder="e.g. Mathematics" value={slotData.subject} onChange={e => setSlotData({...slotData, subject: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                       <label className="info-label">Assign Teacher</label>
                       <select className="form-select border-0 bg-light extra-small fw-bold py-2" value={slotData.teacher} onChange={e => {
                          const t = staff.find(s => s._id === e.target.value);
                          setSlotData({...slotData, teacher: e.target.value, teacherName: t?.name || ''});
                       }}>
                          <option value="">Choose Teacher</option>
                          {staff.map(s => (
                             <option key={s._id} value={s._id}>
                                {s.name} - {s.designation} {s.specialization ? `(${s.specialization})` : ''}
                             </option>
                          ))}
                       </select>
                    </div>
                 </>
              )}
              <div className="col-md-6">
                 <label className="info-label">Start Time</label>
                 <input type="time" className="form-control border-0 bg-light extra-small fw-bold py-2" value={slotData.startTime} onChange={e => setSlotData({...slotData, startTime: e.target.value})} />
              </div>
              <div className="col-md-6">
                 <label className="info-label">End Time</label>
                 <input type="time" className="form-control border-0 bg-light extra-small fw-bold py-2" value={slotData.endTime} onChange={e => setSlotData({...slotData, endTime: e.target.value})} />
              </div>
           </div>
        </div>
      </FormModal>

      {/* ASSIGN CLASS TEACHER MODAL */}
      <FormModal 
        show={showClassTeacherModal} 
        onClose={() => setShowClassTeacherModal(false)} 
        title={`Assign Class Teacher: ${filters.className} - ${filters.section}`}
        onSubmit={saveClassTeacher}
      >
        <div className="p-1">
           <label className="info-label">Select Primary Instructor</label>
           <select className="form-select border-0 bg-light extra-small fw-bold py-2 mb-3" value={selectedClassTeacher} onChange={e => setSelectedClassTeacher(e.target.value)} required>
              <option value="">Choose Staff Member...</option>
              {staff.map(s => <option key={s._id} value={s._id}>{s.name} ({s.department})</option>)}
           </select>
           <div className="alert alert-info border-0 rounded-4 extra-small fw-bold mb-0">
              <i className="bi bi-info-circle me-2"/>
              Assigning a Class Teacher establishes them as the primary point of contact for this specific class and section.
           </div>
        </div>
      </FormModal>

      <style jsx>{`
        .extra-small { font-size: 0.65rem; }
        .info-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 2px; }
        .premium-shadow { box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1) !important; }
        .bg-light-subtle { background: #fcfcfd; }
        .bg-primary-subtle { background: #eff6ff; }
        .bg-warning-subtle { background: #fffbeb; }
        .timetable-slot:hover { transform: scale(1.02); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .transition-all { transition: all 0.2s ease; }
        .cursor-pointer { cursor: pointer; }
      `}</style>
    </DashboardShell>
  );
}
