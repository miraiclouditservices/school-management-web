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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    
    setLoading(true); setError('');
    try {
      const { confirmPassword, ...data } = form;
      const res = await api.post('/auth/register-school', data);
      if (res.success) {
        router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
      }
    } catch (err: any) { 
      setError(err.message || 'Failed to initiate registration'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mirai-auth-page">
      <div className="auth-visual-side">
        <div className="visual-overlay"></div>
        <div className="visual-content">
          <div className="brand-badge">Premium ERP v4.0</div>
          <h1>Empowering <br/>The Next Generation <br/>of Education.</h1>
          <p>Mirai Cloud IT Services provides the world's most advanced school management ecosystem, designed for excellence and scalability.</p>
          
          <div className="visual-stats">
            <div className="stat-item">
              <span className="stat-val">99.9%</span>
              <span className="stat-label">Uptime</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">24/7</span>
              <span className="stat-label">Support</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">Global</span>
              <span className="stat-label">Standards</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="form-wrapper">
          <div className="text-center mb-5">
            <div className="mirai-logo-container mb-3">
              <span className="mirai-logo-text">MIRAI</span>
              <span className="mirai-logo-sub">CLOUD IT SERVICES</span>
            </div>
            <h2 className="fw-bold text-dark">Register Institution</h2>
            <p className="text-muted">Join the global network of modern schools.</p>
          </div>

          {error && <div className="alert alert-danger-mirai mb-4">{error}</div>}
          
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-12">
              <div className="mirai-input-group">
                <label>Institutional Name</label>
                <input required value={form.schoolName} onChange={e => setForm({...form, schoolName: e.target.value})} placeholder="e.g. Stanford International Academy" />
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="mirai-input-group">
                <label>Admin Name</label>
                <input required value={form.adminName} onChange={e => setForm({...form, adminName: e.target.value})} placeholder="Full name" />
              </div>
            </div>

            <div className="col-md-6">
              <div className="mirai-input-group">
                <label>Contact Number</label>
                <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" />
              </div>
            </div>

            <div className="col-12">
              <div className="mirai-input-group">
                <label>Institutional Email</label>
                <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="admin@school.com" />
              </div>
            </div>

            <div className="col-md-6">
              <div className="mirai-input-group">
                <label>Password</label>
                <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" />
              </div>
            </div>

            <div className="col-md-6">
              <div className="mirai-input-group">
                <label>Confirm Password</label>
                <input type="password" required value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} placeholder="••••••••" />
              </div>
            </div>

            <div className="col-12 mt-5">
              <button type="submit" className="mirai-btn-primary w-100" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : 'Initialize School Portal'}
              </button>
            </div>
          </form>
          
          <div className="text-center mt-5">
            <p className="text-muted small">Already registered? <Link href="/login" className="text-mirai-blue fw-bold text-decoration-none">Access Dashboard</Link></p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .mirai-auth-page { display: flex; min-height: 100vh; font-family: 'Inter', sans-serif; background: #ffffff; }
        
        .auth-visual-side { flex: 1; position: relative; background: url('https://images.unsplash.com/photo-1523050338392-c0951246b73c?auto=format&fit=crop&q=80&w=2000'); background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; padding: 60px; color: white; }
        .visual-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0, 82, 204, 0.95) 0%, rgba(0, 61, 153, 0.8) 100%); }
        .visual-content { position: relative; z-index: 10; max-width: 500px; }
        .brand-badge { display: inline-block; padding: 6px 16px; background: rgba(255, 255, 255, 0.15); border-radius: 100px; font-size: 12px; font-weight: 700; border: 1px solid rgba(255, 255, 255, 0.3); margin-bottom: 30px; letter-spacing: 1px; }
        .visual-content h1 { font-size: 48px; font-weight: 800; line-height: 1.1; margin-bottom: 24px; letter-spacing: -1px; }
        .visual-content p { font-size: 18px; opacity: 0.85; line-height: 1.6; font-weight: 400; }
        
        .visual-stats { display: flex; gap: 40px; margin-top: 60px; padding-top: 60px; border-top: 1px solid rgba(255, 255, 255, 0.2); }
        .stat-item { display: flex; flex-direction: column; }
        .stat-val { font-size: 24px; font-weight: 800; }
        .stat-label { font-size: 12px; opacity: 0.7; font-weight: 600; text-transform: uppercase; }

        .auth-form-side { width: 600px; display: flex; align-items: center; justify-content: center; padding: 60px; background: white; }
        .form-wrapper { width: 100%; max-width: 440px; }
        
        .mirai-logo-container { display: flex; flex-direction: column; align-items: center; }
        .mirai-logo-text { font-size: 28px; font-weight: 900; color: #0052CC; letter-spacing: -0.5px; }
        .mirai-logo-sub { font-size: 9px; font-weight: 800; color: #64748b; letter-spacing: 2px; margin-top: -5px; }

        .mirai-input-group { display: flex; flex-direction: column; gap: 6px; }
        .mirai-input-group label { font-size: 13px; font-weight: 700; color: #475569; }
        .mirai-input-group input { padding: 12px 16px; border-radius: 12px; border: 2px solid #e2e8f0; font-size: 15px; transition: all 0.2s; outline: none; }
        .mirai-input-group input:focus { border-color: #0052CC; background: #f8faff; box-shadow: 0 0 0 4px rgba(0, 82, 204, 0.1); }
        
        .mirai-btn-primary { background: #0052CC; color: white; border: none; padding: 16px; border-radius: 14px; font-weight: 800; font-size: 16px; transition: all 0.3s; box-shadow: 0 10px 15px -3px rgba(0, 82, 204, 0.3); }
        .mirai-btn-primary:hover { background: #0041a3; transform: translateY(-2px); box-shadow: 0 20px 25px -5px rgba(0, 82, 204, 0.4); }
        .mirai-btn-primary:active { transform: translateY(0); }
        .mirai-btn-primary:disabled { background: #94a3b8; transform: none; box-shadow: none; cursor: not-allowed; }

        .alert-danger-mirai { background: #fef2f2; color: #991b1b; padding: 12px 16px; border-radius: 12px; border: 1px solid #fee2e2; font-size: 14px; font-weight: 600; text-align: center; }
        .text-mirai-blue { color: #0052CC; }

        @media (max-width: 1100px) {
          .auth-visual-side { display: none; }
          .auth-form-side { width: 100%; }
        }
      `}</style>
    </div>
  );
}
