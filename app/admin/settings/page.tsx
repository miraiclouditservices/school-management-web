'use client';
import { useState, useEffect } from 'react';
import DashboardShell from '../../../components/DashboardShell';
import { LoadingSpinner } from '../../../components/UIComponents';
import api from '../../../lib/api';

export default function SettingsPage() {
  const [school, setSchool] = useState({ 
    name: '', email: '', phone: '', address: '', website: '', tagline: '', logo: '' 
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    api.get('/auth/school')
      .then(res => { 
        if (res.data) {
          setSchool(prev => ({ ...prev, ...res.data })); 
        }
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg({ type: '', text: '' });
    try {
      await api.put('/auth/school', school);
      setMsg({ type: 'success', text: 'School profile updated successfully!' });
      
      // Update local storage safely if name changed
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.schoolName = school.name;
        localStorage.setItem('user', JSON.stringify(user));
        // Force a small delay or reload might be needed if other components depend on this, 
        // but for now, we just update it.
      }
    } catch (err: any) {
      setMsg({ type: 'danger', text: err.message });
    } finally { setSaving(false); }
  };

  return (
    <DashboardShell role="admin">
      <div className="mb-4">
        <h3 className="fw-bold text-dark">System Settings</h3>
        <p className="text-muted small">Manage your school profile and global configurations.</p>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-header bg-white border-0 py-3 px-4">
                <h6 className="mb-0 fw-bold">School Profile</h6>
              </div>
              <div className="card-body p-4">
                {msg.text && <div className={`alert alert-${msg.type} py-2 small mb-4`}>{msg.text}</div>}
                
                <form onSubmit={handleUpdate}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label text-muted small fw-bold">School Name (Registration Identity)</label>
                      <input className="form-control bg-light" value={school.name} readOnly />
                      <p className="extra-small text-primary fw-bold mt-1 mb-0"><i className="bi bi-info-circle me-1"/> To modify your registered school identity, please contact system support.</p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold">Email Address</label>
                      <input type="email" className="form-control" value={school.email} onChange={e => setSchool({...school, email: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold">Contact Number</label>
                      <input className="form-control" value={school.phone} onChange={e => setSchool({...school, phone: e.target.value})} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-muted small fw-bold">Campus Address</label>
                      <textarea className="form-control" rows={3} value={school.address} onChange={e => setSchool({...school, address: e.target.value})} required></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold">Website</label>
                      <input className="form-control" value={school.website} onChange={e => setSchool({...school, website: e.target.value})} placeholder="https://www.yourschool.com" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold">Institutional Tagline</label>
                      <input className="form-control" value={school.tagline} onChange={e => setSchool({...school, tagline: e.target.value})} placeholder="e.g. Empowering Future Leaders" />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-top">
                    <button type="submit" className="btn btn-primary px-4 fw-bold" disabled={saving}>
                      {saving ? 'Saving...' : 'Save School Profile'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
              <div className="card-header bg-white border-0 py-3 px-4">
                <h6 className="mb-0 fw-bold">Institutional Branding</h6>
              </div>
              <div className="card-body text-center p-4">
                <div className="school-logo-preview mx-auto mb-3 overflow-hidden">
                  {school.logo ? (
                    <img src={school.logo} alt="School Logo" className="w-100 h-100 object-fit-cover" />
                  ) : (
                    school.name?.[0] || 'S'
                  )}
                </div>
                <input type="file" id="logo-upload" className="d-none" accept="image/*" onChange={async (e) => {
                  if (e.target.files?.[0]) {
                    try {
                      setSaving(true);
                      const res = await api.uploadFile('/upload/image', e.target.files[0]);
                      if (res.success) {
                        setSchool({...school, logo: res.data.url});
                        setMsg({ type: 'success', text: 'Logo uploaded! Click save to finalize.' });
                      }
                    } catch (err: any) {
                      setMsg({ type: 'danger', text: 'Logo upload failed: ' + err.message });
                    } finally { setSaving(false); }
                  }
                }} />
                <button className="btn btn-light btn-sm fw-bold" onClick={() => document.getElementById('logo-upload')?.click()}>
                  {saving ? <LoadingSpinner size="sm" /> : 'Upload New Logo'}
                </button>
                <p className="text-muted mt-2" style={{ fontSize: '11px' }}>Recommended size: 250x250px (PNG or SVG)</p>
              </div>
            </div>
            
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-header bg-white border-0 py-3 px-4">
                <h6 className="mb-0 fw-bold">System Information</h6>
              </div>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-muted">Software Version</span>
                  <span className="fw-bold">v4.0.2 Pro</span>
                </div>
                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-muted">License Type</span>
                  <span className="badge bg-success-subtle text-success">Enterprise</span>
                </div>
                <div className="d-flex justify-content-between small">
                  <span className="text-muted">Database Status</span>
                  <span className="text-success fw-bold">Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .school-logo-preview { width: 100px; height: 100px; background: #3b82f6; color: #fff; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 3rem; font-weight: 800; box-shadow: 0 8px 16px rgba(59, 130, 246, 0.2); }
        .form-control { border-radius: 10px; border: 1px solid #e2e8f0; padding: 10px 14px; font-size: 0.9rem; transition: border-color 0.2s; }
        .form-control:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
      `}</style>
    </DashboardShell>
  );
}
