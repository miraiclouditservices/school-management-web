'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import Link from 'next/link';

const CONTENT = {
  admin: {
    title: 'Executive Administration',
    desc: 'Unify your institution with enterprise-grade administrative oversight and financial control.',
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000'
  },
  staff: {
    title: 'Academic Excellence',
    desc: 'Empowering educators with data-driven tools for curriculum management and student success.',
    img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2000'
  },
  student: {
    title: 'Future Readiness',
    desc: 'Access your global classroom, track your progress, and prepare for a boundaryless future.',
    img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=2000'
  }
};

const PRESETS = {
  admin: { u: 'admin@school.edu', p: 'admin123' },
  staff: { u: 'teacher@school.edu', p: 'staff123' },
  student: { u: 'student@school.edu', p: 'student123' },
};

export default function LoginPage() {
  const [role, setRole] = useState('admin');
  const [username, setUsername] = useState('admin@school.edu');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: username, password });
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
      }
      router.replace(`/${res.user.role}`);
    } catch (err: any) { 
      if (err.message.includes('not verified')) {
        router.push(`/verify-otp?email=${encodeURIComponent(username)}`);
      } else {
        setError(err.message || 'Invalid credentials'); 
        setLoading(false); 
      }
    }
  };

  const item = CONTENT[role];

  return (
    <div className="mirai-auth-page">
      <div className="auth-visual-side" style={{ backgroundImage: `url(${item.img})` }}>
        <div className="visual-overlay"></div>
        <div className="visual-content">
          <div className="brand-badge">Global Portal v4.0</div>
          <h1>{item.title}</h1>
          <p>{item.desc}</p>
          
          <div className="role-switch-pills mt-5">
            {['admin', 'staff', 'student'].map(r => (
              <button key={r} type="button" className={role === r ? 'active' : ''} 
                onClick={() => { setRole(r); setUsername(PRESETS[r].u); setPassword(PRESETS[r].p); setError(''); }}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
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
            <h2 className="fw-bold text-dark">Portal Access</h2>
            <p className="text-muted">Secure institutional sign-in</p>
          </div>

          {error && <div className="alert alert-danger-mirai mb-4">{error}</div>}

          <form onSubmit={submit}>
            <div className="mb-4">
              <div className="mirai-input-group">
                <label>Institutional Email</label>
                <input type="email" value={username} onChange={e => setUsername(e.target.value)} required disabled={loading} placeholder="e.g. admin@school.com" />
              </div>
            </div>
            <div className="mb-4">
              <div className="mirai-input-group">
                <div className="d-flex justify-content-between align-items-center">
                  <label className="mb-0">Secure Password</label>
                  <a href="#" className="small text-decoration-none fw-bold text-mirai-blue">Reset?</a>
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} placeholder="••••••••" />
              </div>
            </div>
            
            <div className="mb-5">
              <div className="form-check">
                <input className="form-check-input shadow-none" type="checkbox" id="rem" />
                <label className="form-check-label text-muted small fw-bold" htmlFor="rem">Remember this session</label>
              </div>
            </div>

            <button type="submit" className="mirai-btn-primary w-100" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : `Access ${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`}
            </button>

            <div className="text-center mt-5">
              <span className="text-muted small fw-medium">Partner with us? </span>
              <Link href="/register-school" className="small text-mirai-blue fw-bold text-decoration-none">Enroll Institution</Link>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .mirai-auth-page { display: flex; min-height: 100vh; font-family: 'Inter', sans-serif; background: #ffffff; }
        
        .auth-visual-side { flex: 1; position: relative; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; padding: 60px; color: white; transition: all 0.6s ease; }
        .visual-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0, 82, 204, 0.95) 0%, rgba(0, 61, 153, 0.8) 100%); }
        .visual-content { position: relative; z-index: 10; max-width: 500px; }
        .brand-badge { display: inline-block; padding: 6px 16px; background: rgba(255, 255, 255, 0.15); border-radius: 100px; font-size: 12px; font-weight: 700; border: 1px solid rgba(255, 255, 255, 0.3); margin-bottom: 30px; letter-spacing: 1px; }
        .visual-content h1 { font-size: 48px; font-weight: 800; line-height: 1.1; margin-bottom: 24px; letter-spacing: -1px; }
        .visual-content p { font-size: 18px; opacity: 0.85; line-height: 1.6; font-weight: 400; }
        
        .role-switch-pills { display: flex; gap: 10px; background: rgba(255, 255, 255, 0.1); padding: 6px; border-radius: 100px; width: fit-content; }
        .role-switch-pills button { background: transparent; border: none; padding: 8px 20px; border-radius: 100px; color: white; font-size: 13px; font-weight: 700; transition: all 0.3s; }
        .role-switch-pills button.active { background: white; color: #0052CC; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }

        .auth-form-side { width: 600px; display: flex; align-items: center; justify-content: center; padding: 60px; background: white; }
        .form-wrapper { width: 100%; max-width: 400px; }
        
        .mirai-logo-container { display: flex; flex-direction: column; align-items: center; }
        .mirai-logo-text { font-size: 28px; font-weight: 900; color: #0052CC; letter-spacing: -0.5px; }
        .mirai-logo-sub { font-size: 9px; font-weight: 800; color: #64748b; letter-spacing: 2px; margin-top: -5px; }

        .mirai-input-group { display: flex; flex-direction: column; gap: 8px; }
        .mirai-input-group label { font-size: 13px; font-weight: 700; color: #475569; }
        .mirai-input-group input { padding: 14px 18px; border-radius: 14px; border: 2px solid #f1f5f9; background: #f8fafc; font-size: 15px; transition: all 0.2s; outline: none; }
        .mirai-input-group input:focus { border-color: #0052CC; background: white; box-shadow: 0 0 0 4px rgba(0, 82, 204, 0.1); }
        
        .mirai-btn-primary { background: #0052CC; color: white; border: none; padding: 18px; border-radius: 16px; font-weight: 800; font-size: 16px; transition: all 0.3s; box-shadow: 0 10px 15px -3px rgba(0, 82, 204, 0.3); }
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
