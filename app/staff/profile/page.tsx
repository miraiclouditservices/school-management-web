'use client';
import { useState, useEffect } from 'react';
import DashboardShell from '../../../components/DashboardShell';
import { LoadingSpinner, StatusBadge } from '../../../components/UIComponents';
import api from '../../../lib/api';
import { formatDate, calcAge } from '../../../lib/constants';

export default function StaffProfile() {
  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/staff/me')
      .then(r => {
        if (r.success) setStaff(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <DashboardShell role="staff"><div className="d-flex justify-content-center py-5"><LoadingSpinner /></div></DashboardShell>;

  if (!staff) return <DashboardShell role="staff"><div className="alert alert-danger">Staff profile not found.</div></DashboardShell>;

  return (
    <DashboardShell role="staff">
      <div className="mb-4">
        <h2 className="fw-900 text-dark mb-1" style={{ letterSpacing: '-0.04em' }}>My Profile</h2>
        <p className="text-muted fw-semibold opacity-75">View and manage your professional identity.</p>
      </div>

      <div className="row g-4">
        {/* LEFT COLUMN - MAIN PROFILE CARD */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden text-center p-4 mb-4 bg-white">
            <div className="mx-auto mb-3" style={{ width: 120, height: 120 }}>
              <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center h-100 fs-1 fw-bold">
                {staff.name?.[0]}
              </div>
            </div>
            <h4 className="fw-900 text-dark mb-1">{staff.name}</h4>
            <p className="text-muted fw-bold extra-small uppercase tracking-wider mb-2">{staff.designation || 'Staff'}</p>
            <div className="d-flex justify-content-center gap-2 mb-4">
              <StatusBadge status={staff.status} />
              <span className="badge bg-light text-dark border px-3 rounded-pill fw-bold">{staff.staffId}</span>
            </div>
            
            <div className="d-grid gap-2">
              <button className="btn btn-primary rounded-pill fw-bold">Edit Profile</button>
              <button className="btn btn-outline-light text-dark border rounded-pill fw-bold">Change Password</button>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h6 className="fw-800 mb-3 uppercase extra-small tracking-wider text-muted">Quick Info</h6>
            <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
              <li className="d-flex align-items-center gap-3">
                <i className="bi bi-envelope text-primary fs-5"></i>
                <div>
                  <p className="extra-small text-muted mb-0 fw-bold">EMAIL ADDRESS</p>
                  <p className="small fw-800 text-dark mb-0">{staff.email}</p>
                </div>
              </li>
              <li className="d-flex align-items-center gap-3">
                <i className="bi bi-telephone text-primary fs-5"></i>
                <div>
                  <p className="extra-small text-muted mb-0 fw-bold">PHONE NUMBER</p>
                  <p className="small fw-800 text-dark mb-0">{staff.phone}</p>
                </div>
              </li>
              <li className="d-flex align-items-center gap-3">
                <i className="bi bi-building text-primary fs-5"></i>
                <div>
                  <p className="extra-small text-muted mb-0 fw-bold">DEPARTMENT</p>
                  <p className="small fw-800 text-dark mb-0">{staff.department}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN - DETAILS */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
            <h5 className="fw-800 mb-4 pb-2 border-bottom">Personal & Professional Information</h5>
            <div className="row g-4">
              <div className="col-md-6">
                <p className="extra-small text-muted mb-1 fw-bold uppercase">Designation</p>
                <p className="fw-800 text-dark">{staff.designation || '-'}</p>
              </div>
              <div className="col-md-6">
                <p className="extra-small text-muted mb-1 fw-bold uppercase">Date of Joining</p>
                <p className="fw-800 text-dark">{formatDate(staff.joiningDate)}</p>
              </div>
              <div className="col-md-6">
                <p className="extra-small text-muted mb-1 fw-bold uppercase">Gender</p>
                <p className="fw-800 text-dark">{staff.gender || '-'}</p>
              </div>
              <div className="col-md-6">
                <p className="extra-small text-muted mb-1 fw-bold uppercase">Date of Birth</p>
                <p className="fw-800 text-dark">{formatDate(staff.dob)} ({calcAge(staff.dob)})</p>
              </div>
              <div className="col-md-6">
                <p className="extra-small text-muted mb-1 fw-bold uppercase">Qualification</p>
                <p className="fw-800 text-dark">{staff.qualification || '-'}</p>
              </div>
              <div className="col-md-6">
                <p className="extra-small text-muted mb-1 fw-bold uppercase">Experience</p>
                <p className="fw-800 text-dark">{staff.experience || '0'} Years</p>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-800 mb-4 pb-2 border-bottom">Financial Information</h5>
            <div className="row g-4">
              <div className="col-md-4">
                <p className="extra-small text-muted mb-1 fw-bold uppercase">Base Salary</p>
                <p className="fw-800 text-success">₹ {staff.baseSalary?.toLocaleString() || '0'}</p>
              </div>
              <div className="col-md-4">
                <p className="extra-small text-muted mb-1 fw-bold uppercase">Account No</p>
                <p className="fw-800 text-dark">{staff.bankAccountNo || '-'}</p>
              </div>
              <div className="col-md-4">
                <p className="extra-small text-muted mb-1 fw-bold uppercase">Bank Name</p>
                <p className="fw-800 text-dark">{staff.bankName || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .extra-small { font-size: 0.65rem; }
        .uppercase { text-transform: uppercase; }
        .tracking-wider { letter-spacing: 0.05em; }
        .bg-primary-subtle { background: #eff6ff; }
      `}</style>
    </DashboardShell>
  );
}
