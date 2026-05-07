'use client';
import { useState, useEffect } from 'react';
import DashboardShell from '../../../components/DashboardShell';
import { LoadingSpinner, DataTable, StatusBadge } from '../../../components/UIComponents';
import api from '../../../lib/api';
import { formatDate } from '../../../lib/constants';

export default function StudentAttendance() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, halfDay: 0, total: 0, percentage: 0 });
  const [filter, setFilter] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  useEffect(() => {
    setLoading(true);
    api.get('/attendance/my-attendance')
      .then(r => {
        if (r.success) {
          const allData = r.data || [];
          setRecords(allData);
          
          const p = allData.filter((x: any) => x.status === 'Present').length;
          const l = allData.filter((x: any) => x.status === 'Late').length;
          const a = allData.filter((x: any) => x.status === 'Absent').length;
          const h = allData.filter((x: any) => x.status === 'Half Day').length;
          const total = allData.length;
          
          setStats({
            present: p,
            absent: a,
            late: l,
            halfDay: h,
            total,
            percentage: total > 0 ? Math.round(((p + l + (h * 0.5)) / total) * 100) : 0
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const daysInMonth = (month: number, year: number) => new Date(year, month, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month - 1, 1).getDay();

  const filteredRecords = records.filter(r => {
    const d = new Date(r.date);
    return (d.getMonth() + 1) === filter.month && d.getFullYear() === filter.year;
  });

  const getDayStatus = (day: number) => {
    const record = records.find(r => {
      const d = new Date(r.date);
      return d.getDate() === day && (d.getMonth() + 1) === filter.month && d.getFullYear() === filter.year;
    });
    return record?.status;
  };

  const columns = [
    { key: 'date', label: 'DATE', render: (row: any) => <span className="fw-900 text-dark small">{formatDate(row.date)}</span> },
    { key: 'status', label: 'STATUS', render: (row: any) => <StatusBadge status={row.status} /> },
    { key: 'markedByName', label: 'MARKED BY', render: (row: any) => <span className="text-muted extra-small fw-bold">{row.markedByName || 'System'}</span> },
    { key: 'remarks', label: 'REMARKS', render: (row: any) => <span className="text-muted extra-small fw-semibold">{row.remarks || '-'}</span> },
  ];

  const renderCalendar = () => {
    const totalDays = daysInMonth(filter.month, filter.year);
    const startDay = firstDayOfMonth(filter.month, filter.year);
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`pad-${i}`} className="calendar-day padding"></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
      const status = getDayStatus(d);
      let statusClass = '';
      if (status === 'Present') statusClass = 'bg-success text-white shadow-sm';
      else if (status === 'Absent') statusClass = 'bg-danger text-white shadow-sm';
      else if (status === 'Late') statusClass = 'bg-warning text-dark shadow-sm';
      else if (status === 'Leave') statusClass = 'bg-info text-white shadow-sm';
      else if (status === 'Half Day') statusClass = 'bg-secondary text-white shadow-sm';

      days.push(
        <div key={d} className={`calendar-day ${statusClass} position-relative`}>
          <span className="fw-900 small">{d}</span>
          {status && <div className="status-dot-mini"></div>}
        </div>
      );
    }
    return days;
  };

  return (
    <DashboardShell role="student">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-900 text-dark mb-1" style={{ letterSpacing: '-0.04em' }}>Academic Presence</h2>
          <p className="text-muted fw-semibold opacity-75">Your detailed attendance log and consistency metrics.</p>
        </div>
        <div className={`premium-stats-pill px-4 py-2 rounded-pill shadow-sm border bg-white d-none d-md-flex align-items-center gap-3`}>
          <div className="text-end">
            <p className="extra-small text-muted fw-800 uppercase mb-0 opacity-50">Overall Attendance</p>
            <h5 className={`fw-900 mb-0 ${stats.percentage >= 75 ? 'text-success' : 'text-danger'}`}>{stats.percentage}%</h5>
          </div>
          <div className={`status-dot ${stats.percentage >= 75 ? 'bg-success' : 'bg-danger'}`}></div>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5"><LoadingSpinner /></div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            <div className="col-md-3 col-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white overflow-hidden position-relative h-100">
                <div className="position-relative z-1">
                   <h6 className="text-muted extra-small fw-900 uppercase tracking-wider mb-2">Total Sessions</h6>
                   <h2 className="fw-900 text-dark mb-0">{stats.total}</h2>
                </div>
                <i className="bi bi-calendar-check position-absolute end-0 bottom-0 text-primary opacity-10" style={{fontSize: '5rem', marginBottom: '-1rem', marginRight: '-1rem'}}></i>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border-start border-5 border-success h-100">
                <h6 className="text-success extra-small fw-900 uppercase tracking-wider mb-2">Present Days</h6>
                <h2 className="fw-900 text-dark mb-0">{stats.present}</h2>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border-start border-5 border-secondary h-100">
                <h6 className="text-secondary extra-small fw-900 uppercase tracking-wider mb-2">Half Days</h6>
                <h2 className="fw-900 text-dark mb-0">{stats.halfDay}</h2>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border-start border-5 border-danger h-100">
                <h6 className="text-danger extra-small fw-900 uppercase tracking-wider mb-2">Absenteeism</h6>
                <h2 className="fw-900 text-dark mb-0">{stats.absent}</h2>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-lg-7">
               <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden h-100">
                  <div className="card-header bg-white border-0 py-4 px-4 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-900 text-dark">Monthly Calendar</h5>
                    <div className="d-flex gap-2">
                      <select className="form-select form-select-sm border-0 bg-light rounded-pill px-3 fw-bold" value={filter.month} onChange={e => setFilter({...filter, month: parseInt(e.target.value)})}>
                        {months.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
                      </select>
                      <select className="form-select form-select-sm border-0 bg-light rounded-pill px-3 fw-bold" value={filter.year} onChange={e => setFilter({...filter, year: parseInt(e.target.value)})}>
                        <option value={2026}>2026</option>
                        <option value={2025}>2025</option>
                      </select>
                    </div>
                  </div>
                  <div className="card-body p-4">
                    <div className="calendar-grid mb-3">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="calendar-day-header">{d}</div>
                      ))}
                      {renderCalendar()}
                    </div>
                    <div className="d-flex flex-wrap gap-3 justify-content-center mt-4">
                      <div className="d-flex align-items-center gap-2 extra-small fw-bold text-muted"><div className="status-dot bg-success"></div> Present</div>
                      <div className="d-flex align-items-center gap-2 extra-small fw-bold text-muted"><div className="status-dot bg-danger"></div> Absent</div>
                      <div className="d-flex align-items-center gap-2 extra-small fw-bold text-muted"><div className="status-dot bg-warning"></div> Late</div>
                      <div className="d-flex align-items-center gap-2 extra-small fw-bold text-muted"><div className="status-dot bg-secondary"></div> Half Day</div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="col-lg-5">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100">
                <div className="card-header bg-white border-0 py-4 px-4">
                  <h5 className="mb-0 fw-900 text-dark">Recent Activity</h5>
                  <p className="extra-small text-muted fw-bold mb-0 uppercase opacity-50">Detailed logs for {months[filter.month-1]}</p>
                </div>
                <div className="card-body p-0 scroll-y" style={{maxHeight: '400px'}}>
                  <DataTable columns={columns} data={filteredRecords} loading={loading} />
                  {filteredRecords.length === 0 && (
                    <div className="text-center py-5 bg-light-subtle">
                      <i className="bi bi-calendar-x text-muted fs-1 mb-3 d-block opacity-25"></i>
                      <h6 className="fw-800 text-muted">No logs for this month.</h6>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .extra-small { font-size: 0.65rem; }
        .uppercase { text-transform: uppercase; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; }
        .calendar-day-header { text-align: center; font-size: 0.7rem; font-weight: 900; color: #94a3b8; text-transform: uppercase; padding-bottom: 5px; }
        .calendar-day { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: 12px; border: 1px solid #f1f5f9; background: #fff; transition: all 0.2s; }
        .calendar-day.padding { border: none; background: transparent; }
        .status-dot-mini { position: absolute; bottom: 6px; width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.3); }
        .scroll-y { overflow-y: auto; }
      `}</style>
    </DashboardShell>
  );
}
