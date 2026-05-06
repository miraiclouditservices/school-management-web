'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardShell from '../../../../../components/DashboardShell';
import { LoadingSpinner, StatusBadge } from '../../../../../components/UIComponents';
import api from '../../../../../lib/api';
import { CLASSES, SECTIONS, GENDERS, BLOOD_GROUPS, CATEGORIES, formatDate, formatCurrency } from '../../../../../lib/constants';

export default function EditStudentPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  
  const [form, setForm] = useState<any>({
    firstName: '', lastName: '', dateOfBirth: '', gender: 'Male', bloodGroup: '',
    currentClass: '1', section: 'A', category: 'General', academicYear: '',
    father: { name: '', mobile: '', occupation: '' },
    mother: { name: '', mobile: '', occupation: '' },
    emergencyContact: { name: '', phone: '', relationship: '' },
    aadharNumber: '',
    totalFee: 0,
    installments: []
  });

  const [feeBreakdown, setFeeBreakdown] = useState({
    tuition: 0, transport: 0, lab: 0, books: 0, activities: 0
  });

  const [error, setError] = useState('');
  const [instInterval, setInstInterval] = useState(3);
  const [instCount, setInstCount] = useState(4);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ayRes, sRes, fRes] = await Promise.all([
          api.get('/academic-years'),
          api.get(`/students/${id}`),
          api.get('/fees', { student: id })
        ]);
        setAcademicYears(ayRes.data);
        
        const s = sRes.data;
        setForm({
          ...s,
          dateOfBirth: s.dateOfBirth ? new Date(s.dateOfBirth).toISOString().split('T')[0] : '',
          academicYear: s.academicYear?._id || s.academicYear,
          father: s.father || { name: '', mobile: '', occupation: '' },
          mother: s.mother || { name: '', mobile: '', occupation: '' },
          emergencyContact: s.emergencyContact || { name: '', phone: '', relationship: '' }
        });

        if (fRes.data && fRes.data.length > 0) {
          const f = fRes.data[0];
          setFeeBreakdown({
            tuition: f.tuitionFee || 0,
            transport: f.transportFee || 0,
            lab: f.labFee || 0,
            books: f.booksFee || 0,
            activities: f.activityFee || 0
          });
          setForm((prev: any) => ({ 
            ...prev, 
            totalFee: f.totalFee, 
            installments: f.installments?.map((inst: any) => ({
              ...inst,
              dueDate: inst.dueDate ? new Date(inst.dueDate).toISOString().split('T')[0] : ''
            })) || [] 
          }));
          setInstCount(f.installments?.length || 4);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    loadData();
  }, [id]);

  const generateInstallments = (total: number, count: number) => {
    const amount = Math.floor(total / count);
    const remainder = total % count;
    const newInst = Array.from({ length: count }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() + (i * instInterval));
      return {
        name: `${i + 1}th Installment`,
        amount: i === 0 ? amount + remainder : amount,
        dueDate: d.toISOString().split('T')[0],
        status: 'Upcoming'
      };
    });
    setForm((prev: any) => ({ ...prev, installments: newInst }));
  };

  const handleBreakdownChange = (field: string, val: number) => {
    const updated = { ...feeBreakdown, [field]: val };
    setFeeBreakdown(updated);
    const newTotal = Object.values(updated).reduce((a, b) => a + b, 0);
    setForm((prev: any) => ({ ...prev, totalFee: newTotal }));
  };

  const handleInstallmentChange = (index: number, field: string, value: any) => {
    const updated = [...form.installments];
    updated[index] = { ...updated[index], [field]: value };
    setForm((prev: any) => ({ ...prev, installments: updated }));
  };

  const instTotal = form.installments.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
  const isMatch = instTotal === Number(form.totalFee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatch) {
      setError(`Installment mismatch`);
      return;
    }
    setError('');
    setSaving(true);
    try {
      await api.put(`/students/${id}`, { ...form, ...feeBreakdown });
      router.push('/admin/students');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error updating student');
    }
    setSaving(false);
  };

  if (loading) return <DashboardShell role="admin" hideSidebar={true} hideTopBar={true}><div className="p-5 text-center"><LoadingSpinner /></div></DashboardShell>;

  return (
    <DashboardShell role="admin" hideSidebar={true} hideTopBar={true}>
      {/* FIXED HEADER */}
      <header className="sticky-top bg-white border-bottom premium-shadow" style={{ zIndex: 1020 }}>
        <div className="container-fluid py-3 px-4" style={{ maxWidth: '1100px' }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <button type="button" className="btn btn-light rounded-circle p-2 shadow-sm" onClick={() => router.back()} style={{ width:'36px', height:'36px' }}>
                <i className="bi bi-arrow-left fs-6"/>
              </button>
              <div>
                <h5 className="fw-800 mb-0 text-dark" style={{ fontSize: '1rem' }}>Modify Profile</h5>
                <p className="text-muted extra-small fw-bold mb-0 text-uppercase opacity-75">Editing: {form.firstName} {form.lastName}</p>
              </div>
            </div>
            <div className="d-flex gap-2">
               <button type="submit" form="edit-form" className="btn btn-primary btn-sm rounded-pill px-4 fw-800" disabled={saving || !isMatch}>
                  {saving ? 'Synchronizing...' : 'Save All Updates'}
               </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-fluid py-4" style={{ maxWidth: '1100px' }}>
        {error && <div className="alert alert-danger border-0 premium-shadow rounded-4 mb-4 fw-bold extra-small"><i className="bi bi-exclamation-triangle-fill me-2"/>{error}</div>}

        <form id="edit-form" onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-lg-8">
              {/* Personal */}
              <div className="card border-0 premium-shadow rounded-4 mb-4">
                <div className="card-body p-4">
                  <h6 className="fw-800 mb-4 d-flex align-items-center text-primary small"><i className="bi bi-person-circle me-2"/>Personal Details</h6>
                  <div className="row g-3">
                    <div className="col-md-6"><label className="info-label">First Name *</label><input className="form-control form-control-sm rounded-3 bg-light-subtle" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required /></div>
                    <div className="col-md-6"><label className="info-label">Last Name *</label><input className="form-control form-control-sm rounded-3 bg-light-subtle" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required /></div>
                    <div className="col-md-4"><label className="info-label">Date of Birth *</label><input type="date" className="form-control form-control-sm rounded-3 bg-light-subtle" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} required /></div>
                    <div className="col-md-4"><label className="info-label">Gender *</label><select className="form-select form-select-sm rounded-3 bg-light-subtle" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>{GENDERS.map(g => <option key={g}>{g}</option>)}</select></div>
                    <div className="col-md-4"><label className="info-label">Blood Group</label><select className="form-select form-select-sm rounded-3 bg-light-subtle" value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}><option value="">Select</option>{BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}</select></div>
                    <div className="col-md-12"><label className="info-label text-primary">Aadhar Number *</label><input className="form-control form-control-sm rounded-3 bg-light-subtle fw-bold" value={form.aadharNumber} onChange={e => setForm({ ...form, aadharNumber: e.target.value })} required /></div>
                  </div>
                </div>
              </div>

              {/* Guardians */}
              <div className="card border-0 premium-shadow rounded-4 mb-4">
                <div className="card-body p-4">
                  <h6 className="fw-800 mb-4 d-flex align-items-center text-primary small"><i className="bi bi-people me-2"/>Guardian Hierarchy</h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="p-3 rounded-4 bg-light-subtle border">
                        <label className="info-label mb-2">Father's Name</label><input className="form-control form-control-sm mb-2 rounded-3" value={form.father.name} onChange={e => setForm({ ...form, father: { ...form.father, name: e.target.value } })} />
                        <label className="info-label mb-2">Father's Mobile</label><input className="form-control form-control-sm rounded-3" value={form.father.mobile} onChange={e => setForm({ ...form, father: { ...form.father, mobile: e.target.value } })} />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 rounded-4 bg-light-subtle border">
                        <label className="info-label mb-2">Mother's Name</label><input className="form-control form-control-sm mb-2 rounded-3" value={form.mother.name} onChange={e => setForm({ ...form, mother: { ...form.mother, name: e.target.value } })} />
                        <label className="info-label mb-2">Mother's Mobile</label><input className="form-control form-control-sm rounded-3" value={form.mother.mobile} onChange={e => setForm({ ...form, mother: { ...form.mother, mobile: e.target.value } })} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="sticky-top" style={{ top: '80px' }}>
                <div className={`card border-0 premium-shadow rounded-4 mb-3 ${isMatch ? 'bg-success' : 'bg-danger'} text-white`}>
                  <div className="card-body p-3 text-center">
                    <div className="fw-800 small">{isMatch ? 'Plan Verified' : 'Total Mismatch'}</div>
                    {!isMatch && <div className="extra-small opacity-75 mt-1">Variance: {formatCurrency(form.totalFee - instTotal)}</div>}
                  </div>
                </div>
                <div className="card border-0 premium-shadow rounded-4 bg-white p-4">
                   <h6 className="fw-800 small text-uppercase opacity-50 mb-3">Net Fee Recap</h6>
                   <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="extra-small fw-bold">TOTAL ANNUAL</span>
                      <span className="fw-800 text-primary small">{formatCurrency(form.totalFee)}</span>
                   </div>
                </div>
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
