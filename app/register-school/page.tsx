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
    <div className="mirai-auth-container">
      <div className="mirai-auth-card animate-fade-in">
        <div className="text-center mb-4">
          <div className="mirai-logo mb-2">MIRAI</div>
          <div className="mirai-tagline">CLOUD IT SERVICES</div>
          <h2 className="fw-900 mt-4 text-dark">Register Institution</h2>
          <p className="text-muted extra-small fw-bold">JOIN OUR GLOBAL NETWORK OF EXCELLENCE</p>
        </div>

        {error && <div className="mirai-alert-error mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-12">
            <div className="mirai-field">
              <label>School/College Name</label>
              <input required value={form.schoolName} onChange={e => setForm({...form, schoolName: e.target.value})} placeholder="Full Institutional Name" />
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="mirai-field">
              <label>Administrator Name</label>
              <input required value={form.adminName} onChange={e => setForm({...form, adminName: e.target.value})} placeholder="Full Name" />
            </div>
          </div>

          <div className="col-md-6">
            <div className="mirai-field">
              <label>Contact Number</label>
              <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91" />
            </div>
          </div>

          <div className="col-12">
            <div className="mirai-field">
              <label>Institutional Email</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="admin@mirai.edu" />
            </div>
          </div>

          <div className="col-md-6">
            <div className="mirai-field">
              <label>Password</label>
              <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" />
            </div>
          </div>

          <div className="col-md-6">
            <div className="mirai-field">
              <label>Confirm Password</label>
              <input type="password" required value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} placeholder="••••••••" />
            </div>
          </div>

          <div className="col-12 mt-4">
            <button type="submit" className="mirai-primary-btn w-100" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : 'INITIALIZE REGISTRATION'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4 pt-3 border-top">
          <p className="text-muted extra-small fw-bold">ALREADY REGISTERED? <Link href="/login" className="text-mirai fw-900 text-decoration-none">LOGIN HERE</Link></p>
        </div>
      </div>

      <style jsx>{`
        .mirai-auth-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; font-family: 'Inter', sans-serif; padding: 20px; }
        .mirai-auth-card { width: 100%; max-width: 500px; background: white; padding: 40px; border-radius: 24px; box-shadow: 0 20px 50px -10px rgba(0, 82, 204, 0.1); border: 1px solid #f1f5f9; }
        
        .mirai-logo { font-size: 32px; font-weight: 900; color: #0052CC; letter-spacing: -1px; line-height: 1; }
        .mirai-tagline { font-size: 10px; font-weight: 800; color: #94a3b8; letter-spacing: 3px; }
        
        .mirai-field { display: flex; flex-direction: column; gap: 6px; }
        .mirai-field label { font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .mirai-field input { padding: 12px 16px; border-radius: 12px; border: 2px solid #f1f5f9; background: #fcfcfd; font-size: 15px; font-weight: 600; transition: all 0.2s; }
        .mirai-field input:focus { border-color: #0052CC; background: white; outline: none; box-shadow: 0 0 0 4px rgba(0, 82, 204, 0.05); }
        
        .mirai-primary-btn { background: #0052CC; color: white; border: none; padding: 16px; border-radius: 14px; font-weight: 900; letter-spacing: 1px; transition: all 0.3s; }
        .mirai-primary-btn:hover { background: #0041a3; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0, 82, 204, 0.2); }
        .mirai-primary-btn:disabled { opacity: 0.5; transform: none; }
        
        .mirai-alert-error { background: #fff1f2; color: #e11d48; padding: 12px 16px; border-radius: 12px; border: 1px solid #ffe4e6; font-size: 13px; font-weight: 700; text-align: center; }
        .text-mirai { color: #0052CC; }
        .extra-small { font-size: 11px; }
        .fw-900 { font-weight: 900; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}
