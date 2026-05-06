'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import Link from 'next/link';

export default function RegisterSchoolPage() {
  const [form, setForm] = useState({ schoolName: '', adminName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    
    setLoading(true); setError('');
    try {
      const { confirmPassword, ...data } = form;
      await api.post('/auth/register-school', data);
      router.push('/login?registered=true');
    } catch (err) { setError(err.message || 'Failed'); setLoading(false); }
  };

  return (
    <div className="login-page-v2">
      <div className="login-side-img" style={{ 
        backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.4)), url('/reg-bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="login-side-content">
          <div className="mb-3">
            <span className="badge bg-primary px-3 py-2 rounded-pill small fw-bold">Enterprise Edition</span>
          </div>
          <h1>Join the Future of Education</h1>
          <p>The most comprehensive ERP solution for modern schools. Empower your staff and students with cutting-edge technology.</p>
        </div>
      </div>

      <div className="login-side-form">
        <div className="login-form-container">
          <div className="mb-2">
            <Link href="/login" className="text-decoration-none d-inline-flex align-items-center">
              <i className="bi bi-arrow-left text-muted me-2" />
              <span className="text-muted fw-bold small">Back to Login</span>
            </Link>
          </div>
          <h2 className="fw-bold">Create School</h2>
          <p className="sub small">Launch your institutional portal in minutes.</p>

          {error && <div className="alert alert-danger py-2 small mb-3 shadow-sm">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row g-2">
              <div className="col-12">
                <label className="form-label">School Name</label>
                <input className="form-control" required value={form.schoolName} onChange={e => setForm({...form, schoolName: e.target.value})} placeholder="e.g. Green Valley Academy" />
              </div>
              <div className="col-6">
                <label className="form-label">Principal Name</label>
                <input className="form-control" required value={form.adminName} onChange={e => setForm({...form, adminName: e.target.value})} placeholder="Admin name" />
              </div>
              <div className="col-6">
                <label className="form-label">Contact No.</label>
                <input className="form-control" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Mobile number" />
              </div>
              <div className="col-12">
                <label className="form-label">School Email</label>
                <input type="email" className="form-control" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="admin@school.com" />
              </div>
              <div className="col-6">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" />
              </div>
              <div className="col-6">
                <label className="form-label">Confirm Password</label>
                <input type="password" className="form-control" required value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} placeholder="••••••••" />
              </div>
            </div>

            <div className="mt-4">
              <button type="submit" className="btn btn-brand w-100 py-3 fw-bold shadow-sm" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : 'Register School Portal'}
              </button>
            </div>
            <p className="text-center mt-3 text-muted" style={{ fontSize: '0.75rem' }}>
              Already registered? <Link href="/login" className="text-brand fw-bold text-decoration-none">Login to your account</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
