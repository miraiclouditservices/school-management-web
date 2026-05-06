'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '../../../../components/DashboardShell';
import { LoadingSpinner } from '../../../../components/UIComponents';
import api from '../../../../lib/api';

export default function AddStaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal
    name: '', gender: 'Male', dateOfBirth: '', bloodGroup: '', 
    aadharNumber: '', panNumber: '', maritalStatus: 'Single', photo: '',
    // Professional
    department: 'Teaching', designation: '', employmentType: 'Permanent', 
    joiningDate: new Date().toISOString().split('T')[0], qualification: '', 
    experience: '', subjectsHandled: '',
    // Contact
    phone: '', email: '', 
    emergencyContact: { name: '', relation: '', phone: '' },
    // Payroll
    basicSalary: '', bankName: '', accountNumber: '', ifscCode: '',
    // Login
    createLogin: true, username: '', password: ''
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev: any) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/staff', {
        ...formData,
        experience: Number(formData.experience),
        basicSalary: Number(formData.basicSalary),
        subjectsHandled: formData.subjectsHandled.split(',').map(s => s.trim()).filter(s => s)
      });
      if (res.success) router.push('/admin/staff');
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleClear = () => {
     if(window.confirm('Are you sure you want to clear all inputs?')) {
        window.location.reload();
     }
  };

  return (
    <DashboardShell role="admin" hideSidebar={true} hideTopBar={true}>
      {/* IMMERSIVE FIXED HEADER */}
      <header className="sticky-top bg-white border-bottom shadow-sm" style={{ zIndex: 1100 }}>
        <div className="container py-2" style={{ maxWidth: '1000px' }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <button type="button" className="btn btn-light rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm" onClick={() => router.back()} style={{ width:'32px', height:'32px' }}>
                <i className="bi bi-arrow-left fs-6"/>
              </button>
              <div>
                <h6 className="fw-800 mb-0 text-dark">Staff Registry</h6>
                <p className="text-muted extra-small fw-bold mb-0 text-uppercase opacity-75">Staff Management &gt; Add New Staff Member</p>
              </div>
            </div>
            <div className="d-flex gap-2">
               <button type="button" className="btn btn-white rounded-pill px-3 py-1 fw-bold extra-small border" onClick={handleClear}><i className="bi bi-x-circle me-2"/>Clear</button>
               <button type="submit" form="staff-form" className="btn btn-primary shadow-sm rounded-pill px-4 py-1 fw-800 extra-small" disabled={loading}>
                 {loading ? <LoadingSpinner size="sm"/> : <><i className="bi bi-plus-lg me-2"/>Save & Add Staff</>}
               </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-4" style={{ maxWidth: '1000px' }}>
        <form id="staff-form" onSubmit={handleSubmit}>
          <div className="row g-4">
             {/* PERSONAL DETAILS CARD */}
             <div className="col-12">
                <div className="card border-0 premium-shadow rounded-4 bg-white p-4">
                   <h6 className="fw-800 text-primary mb-4 extra-small text-uppercase d-flex align-items-center">
                      <i className="bi bi-person-badge-fill me-2 fs-6"/> Personal Identity Details
                   </h6>
                   <div className="row g-3">
                      <div className="col-md-4">
                         <label className="info-label">Full Name *</label>
                         <input name="name" className="form-control form-control-sm border-0 bg-light rounded-3 fw-bold extra-small" placeholder="e.g. John Smith" value={formData.name} onChange={handleChange} required />
                      </div>
                      <div className="col-md-3">
                         <label className="info-label">Date of Birth *</label>
                         <input name="dateOfBirth" type="date" className="form-control form-control-sm border-0 bg-light rounded-3 extra-small" value={formData.dateOfBirth} onChange={handleChange} required />
                      </div>
                      <div className="col-md-3">
                         <label className="info-label">Gender</label>
                         <div className="d-flex gap-3 mt-1">
                            {['Male', 'Female', 'Other'].map(g => (
                              <div key={g} className="form-check extra-small fw-bold">
                                 <input className="form-check-input" type="radio" name="gender" value={g} checked={formData.gender === g} onChange={handleChange} id={`gender-${g}`} />
                                 <label className="form-check-label" htmlFor={`gender-${g}`}>{g}</label>
                              </div>
                            ))}
                         </div>
                      </div>
                      <div className="col-md-2">
                         <label className="info-label">Blood Group</label>
                         <select name="bloodGroup" className="form-select form-select-sm border-0 bg-light rounded-3 extra-small" value={formData.bloodGroup} onChange={handleChange}>
                            <option value="">Select</option>
                            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => <option key={b} value={b}>{b}</option>)}
                         </select>
                      </div>
                      <div className="col-md-4">
                         <label className="info-label">Aadhar Card Number</label>
                         <input name="aadharNumber" className="form-control form-control-sm border-0 bg-light rounded-3 extra-small" placeholder="12-digit UIDAI Number" value={formData.aadharNumber} onChange={handleChange} />
                      </div>
                      <div className="col-md-4">
                         <label className="info-label">PAN Card Number</label>
                         <input name="panNumber" className="form-control form-control-sm border-0 bg-light rounded-3 extra-small" placeholder="e.g. ABCDE1234F" value={formData.panNumber} onChange={handleChange} />
                      </div>
                      <div className="col-md-4">
                         <label className="info-label">Marital Status</label>
                         <select name="maritalStatus" className="form-select form-select-sm border-0 bg-light rounded-3 extra-small fw-bold" value={formData.maritalStatus} onChange={handleChange}>
                            {['Single', 'Married', 'Divorced', 'Widowed'].map(m => <option key={m} value={m}>{m}</option>)}
                         </select>
                      </div>
                   </div>
                </div>
             </div>

             {/* PROFESSIONAL INFORMATION CARD */}
             <div className="col-12">
                <div className="card border-0 premium-shadow rounded-4 bg-white p-4">
                   <h6 className="fw-800 text-brand mb-4 extra-small text-uppercase d-flex align-items-center" style={{ color: '#4f46e5' }}>
                      <i className="bi bi-briefcase-fill me-2 fs-6"/> Professional Placement
                   </h6>
                   <div className="row g-3">
                      <div className="col-md-4">
                         <label className="info-label">Role / Department *</label>
                         <select name="department" className="form-select form-select-sm border-0 bg-light rounded-3 fw-bold extra-small" value={formData.department} onChange={handleChange} required>
                            {['Teaching', 'Administration', 'Accounts', 'Transport', 'Housekeeping', 'Security', 'Management'].map(d => <option key={d} value={d}>{d}</option>)}
                         </select>
                      </div>
                      <div className="col-md-4">
                         <label className="info-label">Designation *</label>
                         <input name="designation" className="form-control form-control-sm border-0 bg-light rounded-3 fw-bold extra-small" placeholder="e.g. Senior Math Teacher" value={formData.designation} onChange={handleChange} required />
                      </div>
                      <div className="col-md-4">
                         <label className="info-label">Employment Type</label>
                         <select name="employmentType" className="form-select form-select-sm border-0 bg-light rounded-3 extra-small" value={formData.employmentType} onChange={handleChange}>
                            {['Permanent', 'Contractual', 'Part-time', 'Visiting'].map(t => <option key={t} value={t}>{t}</option>)}
                         </select>
                      </div>
                      <div className="col-md-4">
                         <label className="info-label">Joining Date *</label>
                         <input name="joiningDate" type="date" className="form-control form-control-sm border-0 bg-light rounded-3 extra-small" value={formData.joiningDate} onChange={handleChange} required />
                      </div>
                      <div className="col-md-4">
                         <label className="info-label">Qualification</label>
                         <input name="qualification" className="form-control form-control-sm border-0 bg-light rounded-3 extra-small" placeholder="e.g. M.Sc, B.Ed" value={formData.qualification} onChange={handleChange} />
                      </div>
                      <div className="col-md-4">
                         <label className="info-label">Experience (Years)</label>
                         <input name="experience" type="number" className="form-control form-control-sm border-0 bg-light rounded-3 extra-small" placeholder="0" value={formData.experience} onChange={handleChange} />
                      </div>
                      <div className="col-md-12">
                         <label className="info-label">Subjects Handled (Comma Separated)</label>
                         <input name="subjectsHandled" className="form-control form-control-sm border-0 bg-light rounded-3 extra-small" placeholder="e.g. Mathematics, Science" value={formData.subjectsHandled} onChange={handleChange} />
                      </div>
                   </div>
                </div>
             </div>

             {/* CONTACT & PAYROLL CARD */}
             <div className="col-12">
                <div className="card border-0 premium-shadow rounded-4 bg-white p-4">
                   <h6 className="fw-800 text-success mb-4 extra-small text-uppercase d-flex align-items-center">
                      <i className="bi bi-wallet-fill me-2 fs-6"/> Contact & Payroll Management
                   </h6>
                   <div className="row g-3">
                      <div className="col-md-6">
                         <label className="info-label">Primary Phone Number *</label>
                         <input name="phone" className="form-control form-control-sm border-0 bg-light rounded-3 fw-bold text-primary extra-small" placeholder="e.g. +91 98765 43210" value={formData.phone} onChange={handleChange} required />
                      </div>
                      <div className="col-md-6">
                         <label className="info-label">Official Email Address *</label>
                         <input name="email" type="email" className="form-control form-control-sm border-0 bg-light rounded-3 fw-bold text-primary extra-small" placeholder="e.g. admin@naveenschools.com" value={formData.email} onChange={handleChange} required />
                      </div>
                      <div className="col-md-4">
                         <label className="info-label">Basic Monthly Salary (₹)</label>
                         <input name="basicSalary" type="number" className="form-control form-control-sm border-0 bg-light rounded-3 fw-bold extra-small" placeholder="0.00" value={formData.basicSalary} onChange={handleChange} />
                      </div>
                      <div className="col-md-4">
                         <label className="info-label">Bank Name</label>
                         <input name="bankName" className="form-control form-control-sm border-0 bg-light rounded-3 extra-small" placeholder="e.g. HDFC Bank" value={formData.bankName} onChange={handleChange} />
                      </div>
                      <div className="col-md-4">
                         <label className="info-label">Account Number</label>
                         <input name="accountNumber" className="form-control form-control-sm border-0 bg-light rounded-3 extra-small" placeholder="1234567890" value={formData.accountNumber} onChange={handleChange} />
                      </div>
                      
                      <div className="col-12 mt-4 pt-3 border-top">
                         <h6 className="info-label mb-3">Emergency Contact Profile</h6>
                         <div className="row g-3">
                            <div className="col-md-4">
                               <label className="info-label opacity-50">Contact Name</label>
                               <input name="emergencyContact.name" className="form-control form-control-sm border-0 bg-light rounded-3 extra-small" placeholder="Kin Name" value={formData.emergencyContact.name} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                               <label className="info-label opacity-50">Relationship</label>
                               <input name="emergencyContact.relation" className="form-control form-control-sm border-0 bg-light rounded-3 extra-small" placeholder="e.g. Spouse" value={formData.emergencyContact.relation} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                               <label className="info-label opacity-50">Phone Number</label>
                               <input name="emergencyContact.phone" className="form-control form-control-sm border-0 bg-light rounded-3 extra-small" placeholder="Contact Mobile" value={formData.emergencyContact.phone} onChange={handleChange} />
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* LOGIN PROVISIONING CARD */}
             <div className="col-12">
                <div className="card border-0 premium-shadow rounded-4 bg-white p-4 mb-5">
                   <div className="d-flex justify-content-between align-items-center mb-4">
                      <h6 className="fw-800 text-warning mb-0 extra-small text-uppercase d-flex align-items-center">
                         <i className="bi bi-shield-lock-fill me-2 fs-6"/> System Access Provisioning
                      </h6>
                      <div className="form-check form-switch">
                         <input className="form-check-input" type="checkbox" role="switch" checked={formData.createLogin} onChange={e => setFormData({...formData, createLogin: e.target.checked})} />
                         <label className="form-check-label extra-small fw-bold">Create User Account</label>
                      </div>
                   </div>
                   {formData.createLogin && (
                      <div className="row g-3 animate__animated animate__fadeIn">
                         <div className="col-md-6">
                            <label className="info-label">System Username / Email</label>
                            <input name="username" className="form-control form-control-sm border-0 bg-light rounded-3 extra-small fw-bold" placeholder="e.g. stf_john" value={formData.username} onChange={handleChange} autoComplete="off" />
                         </div>
                         <div className="col-md-6">
                            <label className="info-label">Initial Login Password</label>
                            <input name="password" type="password" className="form-control form-control-sm border-0 bg-light rounded-3 extra-small fw-bold" placeholder="••••••••" value={formData.password} onChange={handleChange} autoComplete="new-password" />
                         </div>
                      </div>
                   )}
                </div>
             </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        .extra-small { font-size: 0.65rem; }
        .info-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 2px; }
        .btn-white { background: #fff; border: 1px solid #f1f5f9; }
        .premium-shadow { box-shadow: 0 5px 20px -5px rgba(0, 0, 0, 0.05) !important; }
      `}</style>
    </DashboardShell>
  );
}
