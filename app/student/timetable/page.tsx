'use client';
import { useState, useEffect } from 'react';
import DashboardShell from '../../../components/DashboardShell';
import { LoadingSpinner } from '../../../components/UIComponents';
import api from '../../../lib/api';

export default function TimetablePage() {
  const [timetable, setTimetable] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    api.get('/timetable/my-timetable')
      .then(r => {
        if (r.success) setTimetable(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getPeriodsForDay = (day: string) => {
    return timetable?.periods?.filter((p: any) => p.day === day).sort((a: any, b: any) => a.periodNo - b.periodNo) || [];
  };

  return (
    <DashboardShell role="student">
      <div className="mb-4">
        <h2 className="fw-900 text-dark mb-1" style={{ letterSpacing: '-0.04em' }}>Academic Timetable</h2>
        <p className="text-muted fw-semibold opacity-75">Weekly schedule for Class {timetable?.className} - {timetable?.section}</p>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5"><LoadingSpinner /></div>
      ) : timetable ? (
        <div className="card border-0 premium-shadow rounded-4 bg-white overflow-hidden shadow-lg border-top border-5 border-primary">
          <div className="table-responsive">
            <table className="table table-bordered align-middle mb-0 text-center">
              <thead className="bg-light">
                <tr>
                  <th className="info-label py-3 text-center border-0 bg-white" style={{ width: 100 }}>TIME / DAY</th>
                  {days.map(day => (
                    <th key={day} className="info-label py-3 text-center border-0 text-primary">
                      {day.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(pNo => (
                  <tr key={pNo}>
                    <td className="bg-light-subtle border-0 py-3">
                       <div className="fw-900 text-dark extra-small uppercase">PERIOD {pNo}</div>
                       <div className="text-muted fw-bold" style={{fontSize:'0.6rem'}}>{pNo === 4 ? 'Break' : 'Active'}</div>
                    </td>
                    {days.map(day => {
                      const period = getPeriodsForDay(day).find((p: any) => p.periodNo === pNo);
                      return (
                        <td key={`${day}-${pNo}`} className="p-1 border-0">
                          {period ? (
                            <div className={`timetable-slot rounded-3 p-2 transition-all ${period.isBreak ? 'bg-warning-subtle' : 'bg-primary-subtle border-start border-3 border-primary'} h-100`}>
                              <div className="fw-900 text-dark extra-small text-uppercase mb-1">{period.subject}</div>
                              <div className="text-muted fw-800" style={{fontSize:'0.6rem'}}><i className="bi bi-person me-1"/>{period.teacherName || 'TBA'}</div>
                              <div className="text-primary-emphasis fw-bold" style={{fontSize:'0.55rem'}}><i className="bi bi-clock me-1"/>{period.startTime} - {period.endTime}</div>
                              {period.room && <div className="text-primary fw-bold" style={{fontSize:'0.55rem'}}><i className="bi bi-geo-alt me-1"/>Room: {period.room}</div>}
                            </div>
                          ) : (
                            <div className="timetable-slot rounded-3 p-2 bg-light opacity-50 d-flex align-items-center justify-content-center" style={{ minHeight: 60 }}>
                              <span className="text-muted extra-small fw-bold">No Class</span>
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
          <i className="bi bi-calendar2-range text-muted fs-1 mb-3 d-block"></i>
          <h5 className="fw-800">No Timetable Published</h5>
          <p className="text-muted">The school hasn't published a timetable for your class yet.</p>
        </div>
      )}

      <style jsx>{`
        .extra-small { font-size: 0.65rem; }
        .uppercase { text-transform: uppercase; }
        .info-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 2px; }
        .premium-shadow { box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1) !important; }
        .bg-light-subtle { background: #fcfcfd; }
        .bg-primary-subtle { background: #eff6ff; }
        .bg-warning-subtle { background: #fffbeb; }
        .timetable-slot { transition: all 0.2s ease; min-height: 60px; }
      `}</style>
    </DashboardShell>
  );
}
