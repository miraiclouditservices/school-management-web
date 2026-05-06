'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import Link from 'next/link';

const CONTENT = {
  admin: {
    title: 'Executive School Management',
    desc: 'Take full control of your institution with our powerful administrative dashboard. Manage staff, students, and finances in one place.',
    img: '/admin-bg.png'
  },
  staff: {
    title: 'Empowering Educators',
    desc: 'Simplify your daily tasks. Track attendance, manage assignments, and communicate with students effortlessly.',
    img: '/staff-bg.png'
  },
  student: {
    title: 'Your Academic Hub',
    desc: 'Access your courses, grades, and schedules from anywhere. Stay connected with your teachers and classmates.',
    img: '/student-bg.png'
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

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: username, password });
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
      }
      router.replace(`/${res.user.role}`);
    } catch (err) { setError(err.message || 'Invalid credentials'); setLoading(false); }
  };

  const item = CONTENT[role];

  return (
    <div className="login-page-v2">
      <div className="login-side-img" style={{ 
        backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.4)), url(${item.img})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="login-side-content">
          <div className="mb-3">
            <span className="badge bg-primary px-3 py-2 rounded-pill small fw-bold">v4.0 Pro Edition</span>
          </div>
          <h1>{item.title}</h1>
          <p>{item.desc}</p>
        </div>
      </div>
      
      <div className="login-side-form">
        <div className="login-form-container">
          <div className="text-center mb-3">
            <i className="bi bi-mortarboard-fill text-brand" style={{ fontSize: '2.5rem' }} />
          </div>
          <h2 className="text-center">Secure Sign In</h2>
          <p className="sub text-center">Manage your institution with confidence.</p>

          <div className="role-tabs">
            {['admin', 'staff', 'student'].map(r => (
              <button key={r} type="button" className={role === r ? 'active' : ''} 
                onClick={() => { setRole(r); setUsername(PRESETS[r].u); setPassword(PRESETS[r].p); setError(''); }}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input className="form-control" value={username} onChange={e => setUsername(e.target.value)} required disabled={loading} placeholder="admin@school.com" />
            </div>
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label mb-0">Password</label>
                <a href="#" className="small text-decoration-none fw-bold text-muted hover-brand">Forgot?</a>
              </div>
              <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} placeholder="••••••••" />
            </div>
            
            <div className="mb-4">
              <div className="form-check">
                <input className="form-check-input shadow-none" type="checkbox" id="rem" />
                <label className="form-check-label text-muted small fw-medium" htmlFor="rem">Remember this device</label>
              </div>
            </div>

            <button type="submit" className="btn btn-brand w-100 py-3 fw-bold rounded-3 shadow-sm" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : 'Login to Dashboard'}
            </button>

            <div className="text-center mt-4">
              <span className="text-muted small fw-medium">New to School ERP? </span>
              <Link href="/register-school" className="small text-brand fw-bold text-decoration-none hover-underline">Register School</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
