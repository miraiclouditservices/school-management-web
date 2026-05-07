'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyOTP, resendOTP } from '../../lib/api';
import Link from 'next/link';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!email) router.push('/login');
  }, [email, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 4) return setError('Please enter 4-digit OTP');

    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await verifyOTP(email, otpString);
      if (res.success) {
        setSuccess('Account verified successfully! Redirecting...');
        setTimeout(() => {
          router.push(`/${res.user.role}`);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true); setError(''); setSuccess('');
    try {
      await resendOTP(email);
      setResendTimer(60);
      setSuccess('A new verification code has been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mirai-auth-page">
      <div className="auth-visual-side">
        <div className="visual-overlay"></div>
        <div className="visual-content">
          <div className="brand-badge">Security Shield v4.0</div>
          <h1>Protecting Your <br/>Digital Assets.</h1>
          <p>Mirai Cloud IT Services employs banking-grade encryption to ensure your institutional data remains private and secure.</p>
          
          <div className="visual-security-pills">
            <div className="pill"><i className="bi bi-shield-lock me-2"></i> 256-bit AES</div>
            <div className="pill"><i className="bi bi-person-check me-2"></i> Identity Verification</div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="form-wrapper">
          <div className="text-center mb-5">
            <div className="mirai-logo-container mb-4">
              <span className="mirai-logo-text">MIRAI</span>
              <span className="mirai-logo-sub">CLOUD IT SERVICES</span>
            </div>
            <h2 className="fw-bold text-dark">Verify Identity</h2>
            <p className="text-muted small">We've sent a secure 4-digit code to<br/><strong className="text-dark">{email}</strong></p>
          </div>

          {error && <div className="alert alert-danger-mirai mb-4">{error}</div>}
          {success && <div className="alert alert-success-mirai mb-4">{success}</div>}

          <form onSubmit={handleVerify}>
            <div className="d-flex justify-content-center gap-3 mb-5">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => { otpRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  className="mirai-otp-input"
                  value={digit}
                  onChange={e => handleOtpChange(idx, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(idx, e)}
                  autoFocus={idx === 0}
                  disabled={loading}
                />
              ))}
            </div>

            <button type="submit" className="mirai-btn-primary w-100 mb-4" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : 'Confirm Verification'}
            </button>

            <div className="text-center">
              {resendTimer > 0 ? (
                <div className="resend-countdown">
                  <span className="text-muted">Resend code in </span>
                  <span className="timer-val">{resendTimer}s</span>
                </div>
              ) : (
                <button type="button" className="btn-resend-mirai" onClick={handleResend} disabled={loading}>
                  Resend Verification Code
                </button>
              )}
            </div>
          </form>
          
          <div className="text-center mt-5">
            <p className="text-muted small">Wrong email address? <Link href="/register-school" className="text-mirai-blue fw-bold text-decoration-none">Update & Resend</Link></p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .mirai-auth-page { display: flex; min-height: 100vh; font-family: 'Inter', sans-serif; background: #ffffff; }
        
        .auth-visual-side { flex: 1; position: relative; background: url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000'); background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; padding: 60px; color: white; }
        .visual-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0, 82, 204, 0.95) 0%, rgba(0, 61, 153, 0.8) 100%); }
        .visual-content { position: relative; z-index: 10; max-width: 500px; }
        .brand-badge { display: inline-block; padding: 6px 16px; background: rgba(255, 255, 255, 0.15); border-radius: 100px; font-size: 12px; font-weight: 700; border: 1px solid rgba(255, 255, 255, 0.3); margin-bottom: 30px; letter-spacing: 1px; }
        .visual-content h1 { font-size: 48px; font-weight: 800; line-height: 1.1; margin-bottom: 24px; letter-spacing: -1px; }
        .visual-content p { font-size: 18px; opacity: 0.85; line-height: 1.6; font-weight: 400; }
        
        .visual-security-pills { display: flex; gap: 15px; margin-top: 40px; }
        .pill { background: rgba(255, 255, 255, 0.1); padding: 8px 20px; border-radius: 100px; font-size: 13px; font-weight: 600; border: 1px solid rgba(255, 255, 255, 0.2); }

        .auth-form-side { width: 600px; display: flex; align-items: center; justify-content: center; padding: 60px; background: white; }
        .form-wrapper { width: 100%; max-width: 400px; }
        
        .mirai-logo-container { display: flex; flex-direction: column; align-items: center; }
        .mirai-logo-text { font-size: 28px; font-weight: 900; color: #0052CC; letter-spacing: -0.5px; }
        .mirai-logo-sub { font-size: 9px; font-weight: 800; color: #64748b; letter-spacing: 2px; margin-top: -5px; }

        .mirai-otp-input { width: 70px; height: 85px; text-align: center; font-size: 36px; font-weight: 800; border-radius: 16px; border: 2px solid #e2e8f0; background: #f8fafc; transition: all 0.2s; outline: none; color: #0f172a; }
        .mirai-otp-input:focus { border-color: #0052CC; background: white; box-shadow: 0 0 0 4px rgba(0, 82, 204, 0.1); }
        
        .mirai-btn-primary { background: #0052CC; color: white; border: none; padding: 18px; border-radius: 16px; font-weight: 800; font-size: 16px; transition: all 0.3s; box-shadow: 0 10px 15px -3px rgba(0, 82, 204, 0.3); }
        .mirai-btn-primary:hover { background: #0041a3; transform: translateY(-2px); box-shadow: 0 20px 25px -5px rgba(0, 82, 204, 0.4); }
        
        .btn-resend-mirai { background: none; border: none; color: #0052CC; font-weight: 800; font-size: 14px; cursor: pointer; transition: opacity 0.2s; }
        .btn-resend-mirai:hover { opacity: 0.8; }
        .resend-countdown { font-size: 14px; font-weight: 700; }
        .timer-val { color: #0052CC; margin-left: 5px; }

        .alert-danger-mirai { background: #fef2f2; color: #991b1b; padding: 12px 16px; border-radius: 12px; border: 1px solid #fee2e2; font-size: 14px; font-weight: 600; text-align: center; }
        .alert-success-mirai { background: #f0fdf4; color: #166534; padding: 12px 16px; border-radius: 12px; border: 1px solid #dcfce7; font-size: 14px; font-weight: 600; text-align: center; }
        .text-mirai-blue { color: #0052CC; }

        @media (max-width: 1100px) {
          .auth-visual-side { display: none; }
          .auth-form-side { width: 100%; }
        }
      `}</style>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" /></div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
