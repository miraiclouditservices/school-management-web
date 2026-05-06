'use client';
import React, { useState, useEffect } from 'react';
import DashboardShell from '../../../components/DashboardShell';
import { 
  StatCard, LoadingSpinner, SidebarWidget, FilterBar, MiniItem 
} from '../../../components/UIComponents';
import api from '../../../lib/api';

interface TeacherPeriod {
  day: string;
  periodNo: number;
  subject: string;
  className: string;
  section: string;
  room: string;
  isBreak?: boolean;
}

interface StaffMember {
  _id: string;
  name: string;
  designation: string;
  department: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function TeacherTimetablePage() {
  const [teachers, setTeachers] = useState<StaffMember[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [teacherData, setTeacherData] = useState<StaffMember | null>(null);
  const [periods, setPeriods] = useState<TeacherPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalPeriods: 0, classes: 0, freePeriods: 0, subjects: 0 });

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const res = await api.get<StaffMember[]>('/staff', { department: 'Teaching' });
        setTeachers(res.data);
        if (res.data.length > 0) {
          setSelectedTeacher(res.data[0]._id);
        }
      } catch (e) { console.error(e); }
    };
    loadTeachers();
  }, []);

  const loadTimetable = async () => {
    if (!selectedTeacher) return;
    setLoading(true);
    try {
      const res = await api.get<TeacherPeriod[]>(`/timetable/teacher/${selectedTeacher}`);
      setPeriods(res.data);
      setTeacherData(teachers.find(t => t._id === selectedTeacher) || null);

      // Calculate stats
      const uniqueClasses = new Set(res.data.map(p => `${p.className}-${p.section}`));
      const uniqueSubjects = new Set(res.data.map(p => p.subject));
      setStats({
        totalPeriods: res.data.length,
        classes: uniqueClasses.size,
        freePeriods: (DAYS.length * PERIODS.length) - res.data.length,
        subjects: uniqueSubjects.size
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadTimetable(); }, [selectedTeacher]);

  const getCell = (day: string, periodNo: number) => {
    return periods.find(p => p.day === day && p.periodNo === periodNo);
  };

  return (
    <DashboardShell role="admin">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-800 mb-0">Teacher Timetable</h4>
          <p className="text-muted small mb-0">View individual teaching schedules and workload distribution</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-brand-outline btn-sm px-3 fw-bold"><i className="bi bi-printer me-1"/>Print Schedule</button>
          <button className="btn btn-brand btn-sm px-3 fw-bold"><i className="bi bi-share me-1"/>Share with Teacher</button>
        </div>
      </div>

      <FilterBar onApply={loadTimetable} onReset={() => {}}>
        <div className="ds-filter-group" style={{ minWidth: 300 }}>
          <label className="ds-filter-label">Select Teacher</label>
          <select className="form-select form-select-sm" value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)}>
            {teachers.map(t => <option key={t._id} value={t._id}>{t.name} ({t.designation})</option>)}
          </select>
        </div>
      </FilterBar>

      <div className="row g-3 mb-4">
        <div className="col"><StatCard icon="bi-clock-history" iconBg="#e0f2fe" label="Total Periods" value={stats.totalPeriods} sub="Per Week" /></div>
        <div className="col"><StatCard icon="bi-mortarboard" iconBg="#dcfce7" label="Total Classes" value={stats.classes} sub="Handled" /></div>
        <div className="col"><StatCard icon="bi-book" iconBg="#fef3c7" label="Subjects" value={stats.subjects} sub="Specialization" /></div>
        <div className="col"><StatCard icon="bi-hourglass-split" iconBg="#f3f4f6" label="Free Periods" value={stats.freePeriods} sub="Available" /></div>
      </div>

      <div className="ds-dashboard-row">
        <div className="ds-dashboard-main">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div className="card-body p-0 overflow-auto">
              {loading ? <LoadingSpinner /> : (
                <table className="table table-bordered mb-0 ds-timetable-table" style={{ minWidth: 600 }}>
                  <thead className="bg-light">
                    <tr>
                      <th className="text-center py-2 bg-white small fw-bold" style={{ width: 80 }}>Period</th>
                      {DAYS.map(day => <th key={day} className="text-center py-2 bg-white small fw-bold">{day}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {PERIODS.map(pNo => (
                      <tr key={pNo}>
                        <td className="text-center fw-bold py-3 bg-light align-middle">
                          <div className="extra-small uppercase text-muted">P {pNo}</div>
                        </td>
                        {DAYS.map(day => {
                          const cell = getCell(day, pNo);
                          return (
                            <td key={day} className="p-1 align-middle" style={{ height: 70 }}>
                              {cell ? (
                                <div className="rounded-3 p-2 h-100 d-flex flex-column justify-content-center text-center shadow-sm" style={{ 
                                  background: '#3b82f610', 
                                  borderLeft: '3px solid #3b82f6'
                                }}>
                                  <div className="fw-800 extra-small text-dark mb-0.5">{cell.subject}</div>
                                  <div className="text-muted fw-bold" style={{ fontSize: '0.6rem' }}>{cell.className} - {cell.section}</div>
                                  <div className="text-primary fw-bold" style={{ fontSize: '0.6rem' }}>Room {cell.room}</div>
                                </div>
                              ) : (
                                <div className="h-100 d-flex align-items-center justify-content-center opacity-25">
                                  <span className="text-muted extra-small fw-bold">FREE</span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="ds-dashboard-sidebar">
          {teacherData && (
            <>
              <SidebarWidget title="Teacher Profile">
                <div className="text-center mb-4">
                  <div className="ds-user-avatar mx-auto mb-3" style={{width:80, height:80, fontSize:'2rem'}}>{teacherData.name[0]}</div>
                  <h6 className="fw-800 mb-1">{teacherData.name}</h6>
                  <p className="text-muted small mb-0">{teacherData.designation}</p>
                  <p className="text-primary small fw-bold">{teacherData.department} Dept.</p>
                </div>
                <div className="d-flex flex-column gap-2 small">
                  <div className="d-flex justify-content-between"><span className="text-muted">Staff ID</span><span className="fw-bold">STF-{teacherData._id.slice(-6).toUpperCase()}</span></div>
                  <div className="d-flex justify-content-between"><span className="text-muted">Experience</span><span className="fw-bold">8.5 Years</span></div>
                </div>
              </SidebarWidget>

              <SidebarWidget title="Subjects Handled">
                <div className="ds-mini-list">
                  {Array.from(new Set(periods.map(p => p.subject))).map((s, i) => (
                    <MiniItem key={i} name={s} sub="Primary Specialization" icon="bi-book-half" iconBg="#e0f2fe" color="#0369a1" />
                  ))}
                </div>
              </SidebarWidget>

              <SidebarWidget title="Workload Summary">
                <div className="p-3 bg-light rounded-3 mb-3">
                  <div className="d-flex justify-content-between mb-1"><span className="small text-muted">Weekly Goal</span><span className="small fw-bold">32 / 40 Periods</span></div>
                  <div className="progress" style={{ height: 6 }}>
                    <div className="progress-bar bg-success" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <p className="text-muted" style={{ fontSize: '0.7rem' }}>Teacher is currently at 80% capacity based on institutional norms.</p>
              </SidebarWidget>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .extra-small { font-size: 0.65rem; }
        .uppercase { text-transform: uppercase; }
        .ds-timetable-table th, .ds-timetable-table td {
          border: 1px solid #f1f5f9 !important;
        }
      `}</style>
    </DashboardShell>
  );
}
