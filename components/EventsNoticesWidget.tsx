'use client';
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { formatDate } from '../lib/constants';

interface EventsNoticesWidgetProps {
  role: 'student' | 'staff' | 'admin';
}

export default function EventsNoticesWidget({ role }: EventsNoticesWidgetProps) {
  const [activeTab, setActiveTab] = useState<'notices' | 'events'>('notices');
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [nRes, eRes] = await Promise.all([
          api.get('/notices', { audience: role === 'student' ? 'Students' : role === 'staff' ? 'Staff' : 'All' }),
          api.get('/events', { audience: role === 'student' ? 'Students' : role === 'staff' ? 'Staff' : 'All' })
        ]);
        setNotices(nRes.data || []);
        setEvents(eRes.data || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    loadData();
  }, [role]);

  if (loading) return <div className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary" /></div>;

  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
      <div className="card-header bg-white border-0 p-3 pb-0">
        <div className="nav nav-pills gap-1 bg-light p-1 rounded-pill">
          <button className={`nav-link rounded-pill extra-small fw-800 flex-fill py-2 ${activeTab === 'notices' ? 'active shadow-sm' : 'text-muted'}`} onClick={() => setActiveTab('notices')}>Notices</button>
          <button className={`nav-link rounded-pill extra-small fw-800 flex-fill py-2 ${activeTab === 'events' ? 'active shadow-sm' : 'text-muted'}`} onClick={() => setActiveTab('events')}>Events</button>
        </div>
      </div>
      <div className="card-body p-3">
        <div className="ds-widget-scroll" style={{ maxHeight: '350px', overflowY: 'auto' }}>
          {activeTab === 'notices' ? (
            <>
              {notices.length > 0 ? notices.map((notice: any) => (
                <div key={notice._id} className="p-3 rounded-4 bg-light-subtle border border-light-subtle mb-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className={`badge bg-${notice.priority === 'High' ? 'danger' : 'primary'} extra-small`}>{notice.category}</span>
                    <span className="extra-small text-muted fw-bold">{formatDate(notice.publishedOn)}</span>
                  </div>
                  <h6 className="fw-800 text-dark mb-1 small">{notice.title}</h6>
                  <p className="extra-small text-muted mb-0 line-clamp-2">{notice.content}</p>
                </div>
              )) : (
                <div className="text-center py-5 opacity-25">
                  <i className="bi bi-megaphone fs-1 d-block mb-2"></i>
                  <p className="extra-small fw-bold">No new notices</p>
                </div>
              )}
            </>
          ) : (
            <>
              {events.length > 0 ? events.map((event: any) => (
                <div key={event._id} className="p-3 rounded-4 bg-light-subtle border border-light-subtle mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary-subtle text-primary rounded-3 p-2 text-center" style={{ minWidth: '50px' }}>
                      <div className="fw-900 small">{new Date(event.date).getDate()}</div>
                      <div className="extra-small fw-bold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</div>
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <h6 className="fw-800 text-dark mb-1 small text-truncate">{event.name}</h6>
                      <div className="d-flex align-items-center gap-2 extra-small text-muted fw-bold">
                        <i className="bi bi-clock"></i> {event.time || 'All Day'}
                        <span className="mx-1">•</span>
                        <i className="bi bi-geo-alt"></i> {event.venue || 'School Campus'}
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-5 opacity-25">
                  <i className="bi bi-calendar-event fs-1 d-block mb-2"></i>
                  <p className="extra-small fw-bold">No upcoming events</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <style jsx>{`
        .extra-small { font-size: 0.65rem; }
        .fw-800 { font-weight: 800; }
        .nav-pills .nav-link.active { background: #fff; color: #3b82f6 !important; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}
