'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '../../lib/api';
import Link from 'next/link';

function VerifyOtpContent() {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) router.push('/register-school');
  }, [email, router]);

  const handleOtpChange = (idx: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);

    if (val && idx < 3) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 4) return setError('Please enter all 4 digits');

    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await api.post('/auth/verify-otp', { email, otp: otpCode });
      if (res.success) {
        setSuccess('Account verified successfully! Redirecting to login...');
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      await api.post('/auth/resend-otp', { email });
      setSuccess('A new verification code has been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mirai-auth-container">
      <div className="mirai-auth-card animate-fade-in text-center">
        <div className="mb-4">
          <div className="mirai-logo mb-2">MIRAI</div>
          <div className="mirai-tagline">CLOUD IT SERVICES</div>
          <h2 className="fw-900 mt-4 text-dark">Verify Identity</h2>
          <p className="text-muted extra-small fw-bold">ENTER THE 4-DIGIT CODE SENT TO<br/><span className="text-mirai">{email}</span></p>
        </div>

        {error && <div className="mirai-alert-error mb-4">{error}</div>}
        {success && <div className="mirai-alert-success mb-4">{success}</div>}
        
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

          <button type="submit" className="mirai-primary-btn w-100 mb-4" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : 'VERIFY ACCOUNT'}
          </button>
          
          <div className="resend-section">
            <p className="text-muted extra-small fw-bold mb-2">DIDN'T RECEIVE THE CODE?</p>
            <button type="button" className="btn btn-link extra-small fw-900 text-mirai text-decoration-none p-0" onClick={handleResend} disabled={loading}>
              RESEND VERIFICATION CODE
            </button>
          </div>
        </form>
        
        <div className="text-center mt-5 pt-3 border-top">
          <p className="text-muted extra-small fw-bold">WRONG EMAIL? <Link href="/register-school" className="text-mirai fw-900 text-decoration-none">UPDATE & RE-REGISTER</Link></p>
        </div>
      </div>

      <style jsx>{`
        .mirai-auth-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; font-family: 'Inter', sans-serif; padding: 20px; }
        .mirai-auth-card { width: 100%; max-width: 440px; background: white; padding: 40px; border-radius: 24px; box-shadow: 0 20px 50px -10px rgba(0, 82, 204, 0.1); border: 1px solid #f1f5f9; }
        
        .mirai-logo { font-size: 32px; font-weight: 900; color: #0052CC; letter-spacing: -1px; line-height: 1; }
        .mirai-tagline { font-size: 10px; font-weight: 800; color: #94a3b8; letter-spacing: 3px; }
        
        .mirai-otp-input { width: 60px; height: 70px; border-radius: 16px; border: 2px solid #f1f5f9; background: #fcfcfd; font-size: 28px; font-weight: 900; text-align: center; color: #0052CC; transition: all 0.2s; }
        .mirai-otp-input:focus { border-color: #0052CC; background: white; outline: none; box-shadow: 0 0 0 4px rgba(0, 82, 204, 0.05); }
        
        .mirai-primary-btn { background: #0052CC; color: white; border: none; padding: 16px; border-radius: 14px; font-weight: 900; letter-spacing: 1px; transition: all 0.3s; }
        .mirai-primary-btn:hover { background: #0041a3; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0, 82, 204, 0.2); }
        .mirai-primary-btn:disabled { opacity: 0.5; transform: none; }
        
        .mirai-alert-error { background: #fff1f2; color: #e11d48; padding: 12px 16px; border-radius: 12px; border: 1px solid #ffe4e6; font-size: 13px; font-weight: 700; }
        .mirai-alert-success { background: #f0fdf4; color: #16a34a; padding: 12px 16px; border-radius: 12px; border: 1px solid #dcfce7; font-size: 13px; font-weight: 700; }
        
        .text-mirai { color: #0052CC; }
        .extra-small { font-size: 11px; }
        .fw-900 { font-weight: 900; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="p-5 text-center">Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
