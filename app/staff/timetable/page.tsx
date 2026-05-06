'use client';
import { useState, useEffect } from 'react';
import DashboardShell from '../../../components/DashboardShell';
import { LoadingSpinner } from '../../../components/UIComponents';
import api from '../../../lib/api';
import { CLASSES, SECTIONS } from '../../../lib/constants';

export default function StaffTimetable() {
  const [viewType, setViewType] = useState<'personal' | 'class'>('personal');
  const [classFilters, setClassFilters] = useState({ className: '1', section: 'A' });
  const [timetable, setTimetable] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

  const loadTimetable = async () => {
    setLoading(true);
    try {
      if (viewType === 'personal') {
        const res = await api.get('/staff/me');
        if (res.success) setTimetable({ periods: res.data.timetable });
      } else {
        const res = await api.get('/timetable', classFilters);
        if (res.success && res.data.length > 0) setTimetable(res.data[0]);
        else setTimetable(null);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadTimetable(); }, [viewType, classFilters.className, classFilters.section]);

  const getPeriodsForDay = (day: string) => {
    return timetable?.periods?.filter((p: any) => p.day === day).sort((a: any, b: any) => a.periodNo - b.periodNo) || [];
  };

  return (
    <DashboardShell role="staff">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-900 text-dark mb-1" style={{ letterSpacing: '-0.04em' }}>Academic Timetable</h2>
          <p className="text-muted fw-semibold opacity-75">
            {viewType === 'personal' ? 'Your personal teaching schedule' : `Weekly schedule for Class ${classFilters.className} - ${classFilters.section}`}
          </p>
        </div>
        <div className="btn-group rounded-pill overflow-hidden shadow-sm">
          <button className={`btn ${viewType === 'personal' ? 'btn-primary' : 'btn-white'} border-0 px-4 fw-bold`} onClick={() => setViewType('personal')}>Personal</button>
          <button className={`btn ${viewType === 'class' ? 'btn-primary' : 'btn-white'} border-0 px-4 fw-bold`} onClick={() => setViewType('class')}>Class-wise</button>
        </div>
      </div>

      {viewType === 'class' && (
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="extra-small fw-800 text-muted uppercase mb-2">Select Class</label>
              <select className="form-select border-0 bg-light rounded-pill px-4 fw-bold" value={classFilters.className} onChange={e => setClassFilters({...classFilters, className: e.target.value})}>
                {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="extra-small fw-800 text-muted uppercase mb-2">Section</label>
              <select className="form-select border-0 bg-light rounded-pill px-4 fw-bold" value={classFilters.section} onChange={e => setClassFilters({...classFilters, section: e.target.value})}>
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="d-flex justify-content-center py-5"><LoadingSpinner /></div>
      ) : timetable ? (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white border-top border-5 border-primary">
          <div className="table-responsive">
            <table className="table table-bordered mb-0 align-middle text-center">
              <thead className="bg-light">
                <tr>
                  <th className="p-3 bg-white border-0 info-label" style={{ width: '100px' }}>TIME / DAY</th>
                  {DAYS.map(day => (
                    <th key={day} className="p-3 border-0 border-start text-primary fw-800 extra-small">{day.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map(pNo => (
                  <tr key={pNo}>
                    <td className="p-3 bg-light-subtle">
                      <div className="extra-small fw-900 text-dark">PERIOD {pNo}</div>
                      <div className="text-muted fw-bold" style={{fontSize:'0.6rem'}}>{pNo === 4 ? 'Break' : 'Active'}</div>
                    </td>
                    {DAYS.map(day => {
                      const period = getPeriodsForDay(day).find((p: any) => p.periodNo === pNo);
                      return (
                        <td key={`${day}-${pNo}`} className="p-1 border-0" style={{ minWidth: '150px' }}>
                          {period ? (
                            <div className={`p-2 rounded-3 ${period.isBreak ? 'bg-warning-subtle' : 'bg-primary-subtle border-start border-3 border-primary'} h-100`}>
                              <h6 className="fw-800 text-dark mb-1 extra-small uppercase">{period.subject}</h6>
                              {viewType === 'personal' ? (
                                <div className="badge bg-white text-primary border border-primary border-opacity-10 px-2 py-1 rounded-pill fw-800 mb-1" style={{fontSize:'0.6rem'}}>
                                  {period.className} - {period.section}
                                </div>
                              ) : (
                                <p className="extra-small text-muted fw-bold mb-1">{period.teacherName || 'TBA'}</p>
                              )}
                              <p className="extra-small text-primary-emphasis fw-800 mb-0">{period.startTime} - {period.endTime}</p>
                            </div>
                          ) : (
                            <div className="text-center py-3 opacity-25 bg-light rounded-3 h-100 d-flex align-items-center justify-content-center">
                                <span className="extra-small fw-bold">FREE</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm">
          <i className="bi bi-calendar2-x text-muted fs-1 mb-3 d-block opacity-25"></i>
          <h5 className="fw-800">No Timetable Found</h5>
          <p className="text-muted">The requested timetable is not yet published.</p>
        </div>
      )}

      <style jsx>{`
        .extra-small { font-size: 0.65rem; }
        .uppercase { text-transform: uppercase; }
        .info-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #64748b; }
        .bg-light-subtle { background: #fcfcfd; }
        .bg-primary-subtle { background: #eff6ff; }
        .bg-warning-subtle { background: #fffbeb; }
      `}</style>
    </DashboardShell>
  );
}
