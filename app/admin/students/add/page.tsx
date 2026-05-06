'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '../../../../components/DashboardShell';
import { LoadingSpinner, StatusBadge } from '../../../../components/UIComponents';
import api from '../../../../lib/api';
import { CLASSES, SECTIONS, GENDERS, BLOOD_GROUPS, formatDate, formatCurrency } from '../../../../lib/constants';

export default function AddStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [currentAY, setCurrentAY] = useState<any>(null);
  const [routes, setRoutes] = useState<any[]>([]);

  const [form, setForm] = useState<any>({
    firstName: '', lastName: '', dateOfBirth: '', gender: 'Male', bloodGroup: '',
    currentClass: '1', section: 'A', category: 'General', academicYear: '',
    username: '', password: '', 
    father: { name: '', mobile: '', email: '', occupation: '' },
    mother: { name: '', mobile: '', email: '', occupation: '' },
    emergencyContact: { name: '', phone: '', relationship: '' },
    aadharNumber: '',
    feeDetails: {
      applicationFee: { original: 0, concession: 0, final: 0 },
      admissionFee: { original: 0, concession: 0, final: 0 },
      schoolFee: { original: 0, concession: 0, final: 0 },
      transportFee: { original: 0, concession: 0, final: 0 },
      grandTotal: { original: 0, concession: 0, final: 0 }
    },
    transportRoute: '',
    installments: []
  });

  const [error, setError] = useState('');
  const [instCount, setInstCount] = useState(4);
  const [instInterval, setInstInterval] = useState(3);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ayRes, transRes] = await Promise.all([
          api.get('/academic-years'),
          api.get('/transport')
        ]);
        setAcademicYears(ayRes.data);
        setRoutes(transRes.data || []);
        const active = ayRes.data.find((a: any) => a.isCurrent);
        if (active) {
          setCurrentAY(active);
          setForm((prev: any) => ({ ...prev, academicYear: active._id }));
          updateFeeFromStructure(active, '1', 'General');
        }
      } catch (e) { console.error(e); }
    };
    loadData();
  }, []);

  const updateFeeFromStructure = (ay: any, className: string, category: string) => {
    if (!ay || !ay.feeStructures) return;
    const fs = ay.feeStructures.find((f: any) => f.className === className && (f.category === category || f.category === 'General'))
      || ay.feeStructures.find((f: any) => f.className === className);

    if (fs) {
      const newFeeDetails = {
        applicationFee: { original: fs.applicationFee || 0, concession: 0, final: fs.applicationFee || 0 },
        admissionFee: { original: fs.admissionFee || 0, concession: 0, final: fs.admissionFee || 0 },
        schoolFee: { original: fs.tuitionFee || 0, concession: 0, final: fs.tuitionFee || 0 },
        transportFee: { original: 0, concession: 0, final: 0 },
        grandTotal: { original: 0, concession: 0, final: 0 }
      };
      
      const total = (fs.applicationFee || 0) + (fs.admissionFee || 0) + (fs.tuitionFee || 0);
      newFeeDetails.grandTotal = { original: total, concession: 0, final: total };
      
      setForm((prev: any) => ({ ...prev, feeDetails: newFeeDetails }));
      generateInstallments(total, instCount);
    }
  };

  const updateFee = (type: string, field: string, val: number) => {
    const feeDetails = { ...form.feeDetails };
    const updatedFee = { ...feeDetails[type], [field]: Number(val) };
    updatedFee.final = (updatedFee.original || 0) - (updatedFee.concession || 0);
    feeDetails[type] = updatedFee;
    
    // Recalculate Grand Total
    const types = ['applicationFee', 'admissionFee', 'schoolFee', 'transportFee'];
    const grand = { original: 0, concession: 0, final: 0 };
    types.forEach(t => {
      grand.original += feeDetails[t]?.original || 0;
      grand.concession += feeDetails[t]?.concession || 0;
      grand.final += feeDetails[t]?.final || 0;
    });
    feeDetails.grandTotal = grand;
    
    setForm((prev: any) => ({ ...prev, feeDetails }));
    generateInstallments(grand.final, instCount);
  };

  const generateInstallments = (total: number, count: number) => {
    if (count <= 0) return;
    const amount = Math.floor(total / count);
    const remainder = total % count;
    const newInst = Array.from({ length: count }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() + (i * instInterval));
      return {
        name: `${i + 1}${getOrdinal(i + 1)} Installment`,
        amount: i === 0 ? amount + remainder : amount,
        dueDate: d.toISOString().split('T')[0],
        status: 'Upcoming'
      };
    });
    setForm((prev: any) => ({ ...prev, installments: newInst }));
  };

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    const instTotal = form.installments.reduce((a: any, b: any) => a + Number(b.amount), 0);
    if (Math.abs(instTotal - form.feeDetails.grandTotal.final) > 1) {
      setError(`Installment total (${instTotal}) must match final fee (${form.feeDetails.grandTotal.final})`);
      return;
    }

    setLoading(true);
    try {
      await api.post('/students', form);
      router.push('/admin/students');
    } catch (err: any) {
      setError(err.message || 'Failed to enroll student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell role="admin">
      <div className="bg-light-subtle py-3 border-bottom sticky-top" style={{ top: 0, zIndex: 1020 }}>
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-800 mb-0">Student Enrollment</h5>
            <p className="text-muted extra-small mb-0">Adding new admission to {currentAY?.name || 'Loading...'}</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-light rounded-pill px-4 fw-bold extra-small" onClick={() => router.back()}>Cancel</button>
            <button className="btn btn-primary rounded-pill px-4 fw-bold extra-small shadow-sm" type="submit" form="enrollment-form" disabled={loading}>
              {loading ? <LoadingSpinner size="sm" /> : <><i className="bi bi-shield-check me-2"/>Confirm Enrollment</>}
            </button>
          </div>
        </div>
      </div>

      <div className="container-fluid py-4" style={{ maxWidth: '1200px' }}>
        {error && <div className="alert alert-danger border-0 premium-shadow rounded-4 mb-4 fw-bold extra-small animate__animated animate__shakeX"><i className="bi bi-exclamation-triangle-fill me-2" />{error}</div>}

        <form id="enrollment-form" onSubmit={handleSubmit}>
          <div className="row g-4">
            <div className="col-lg-8">
              {/* Identity */}
              <div className="card border-0 premium-shadow rounded-4 mb-4">
                <div className="card-body p-4">
                  <h6 className="fw-800 mb-4 d-flex align-items-center text-primary small text-uppercase"><i className="bi bi-person-circle me-2" />Student Identity</h6>
                  <div className="row g-3">
                    <div className="col-md-6"><label className="info-label">First Name *</label><input className="form-control form-control-sm rounded-3 bg-light-subtle" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required /></div>
                    <div className="col-md-6"><label className="info-label">Last Name *</label><input className="form-control form-control-sm rounded-3 bg-light-subtle" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required /></div>
                    <div className="col-md-4"><label className="info-label">Date of Birth *</label><input type="date" className="form-control form-control-sm rounded-3 bg-light-subtle" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} required /></div>
                    <div className="col-md-4"><label className="info-label">Gender *</label><select className="form-select form-select-sm rounded-3 bg-light-subtle" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>{GENDERS.map(g => <option key={g}>{g}</option>)}</select></div>
                    <div className="col-md-4"><label className="info-label">Blood Group</label><select className="form-select form-select-sm rounded-3 bg-light-subtle" value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}><option value="">Select</option>{BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}</select></div>
                    <div className="col-md-12"><label className="info-label text-primary">Aadhar Number (UIDAI) *</label><input className="form-control form-control-sm rounded-3 bg-light-subtle fw-bold" placeholder="0000-0000-0000" value={form.aadharNumber} onChange={e => setForm({ ...form, aadharNumber: e.target.value })} required /></div>
                  </div>
                </div>
              </div>

              {/* Guardians */}
              <div className="card border-0 premium-shadow rounded-4 mb-4">
                <div className="card-body p-4">
                  <h6 className="fw-800 mb-4 d-flex align-items-center text-primary small text-uppercase"><i className="bi bi-people me-2" />Guardian Information</h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="p-3 rounded-4 bg-light-subtle border">
                        <label className="info-label mb-2">Father's Name *</label><input className="form-control form-control-sm mb-2 rounded-3" value={form.father.name} onChange={e => setForm({ ...form, father: { ...form.father, name: e.target.value } })} required />
                        <label className="info-label mb-2">Father's Mobile *</label><input className="form-control form-control-sm rounded-3" value={form.father.mobile} onChange={e => setForm({ ...form, father: { ...form.father, mobile: e.target.value } })} required />
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

              {/* Fee Configuration */}
              <div className="card border-0 premium-shadow rounded-4 mb-4">
                <div className="card-body p-4">
                  <h6 className="fw-800 mb-4 d-flex align-items-center text-primary small text-uppercase"><i className="bi bi-wallet2 me-2" />Fee & Concession Structure</h6>
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered align-middle">
                      <thead className="bg-light extra-small">
                        <tr>
                          <th>Fee Category</th>
                          <th>Original (₹)</th>
                          <th>Concession (₹)</th>
                          <th>Final (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="extra-small">
                        {[
                          { label: 'Application Fee', key: 'applicationFee' },
                          { label: 'Admission Fee', key: 'admissionFee' },
                          { label: 'School/Tuition Fee', key: 'schoolFee' },
                        ].map(f => (
                          <tr key={f.key}>
                            <td className="fw-bold">{f.label}</td>
                            <td><input type="number" className="form-control form-control-sm border-0 bg-light" value={form.feeDetails[f.key]?.original || ''} onChange={e => updateFee(f.key, 'original', Number(e.target.value))} /></td>
                            <td><input type="number" className="form-control form-control-sm border-0 bg-light" value={form.feeDetails[f.key]?.concession || ''} onChange={e => updateFee(f.key, 'concession', Number(e.target.value))} /></td>
                            <td className="fw-800 text-dark">₹{form.feeDetails[f.key]?.final || 0}</td>
                          </tr>
                        ))}
                        <tr>
                          <td>
                            <select className="form-select form-select-sm border-0 bg-light extra-small fw-bold" value={form.transportRoute} onChange={e => {
                              const route = routes.find(r => r._id === e.target.value);
                              setForm({ ...form, transportRoute: e.target.value });
                              if (route) updateFee('transportFee', 'original', route.fee);
                              else updateFee('transportFee', 'original', 0);
                            }}>
                              <option value="">Select Transport Route</option>
                              {routes.map(r => <option key={r._id} value={r._id}>{r.routeName} - ₹{r.fee}</option>)}
                            </select>
                          </td>
                          <td><input type="number" className="form-control form-control-sm border-0 bg-light" value={form.feeDetails.transportFee.original || ''} onChange={e => updateFee('transportFee', 'original', Number(e.target.value))} /></td>
                          <td><input type="number" className="form-control form-control-sm border-0 bg-light" value={form.feeDetails.transportFee.concession || ''} onChange={e => updateFee('transportFee', 'concession', Number(e.target.value))} /></td>
                          <td className="fw-800 text-dark">₹{form.feeDetails.transportFee.final || 0}</td>
                        </tr>
                      </tbody>
                      <tfoot className="bg-primary bg-opacity-10 extra-small fw-800">
                        <tr>
                          <td>GRAND TOTAL PAYABLE</td>
                          <td>₹{form.feeDetails.grandTotal.original || 0}</td>
                          <td className="text-danger">₹{form.feeDetails.grandTotal.concession || 0}</td>
                          <td className="text-primary">₹{form.feeDetails.grandTotal.final || 0}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="sticky-top" style={{ top: '80px', zIndex: 1000 }}>
                {/* Academic Placement */}
                <div className="card border-0 premium-shadow rounded-4 mb-4 bg-white">
                  <div className="card-body p-4">
                    <h6 className="fw-800 text-uppercase extra-small opacity-75 mb-3">Academic Placement</h6>
                    <div className="d-flex flex-column gap-2 mb-3">
                      <label className="info-label">Target Class</label>
                      <select className="form-select form-select-sm border-0 bg-light-subtle rounded-3 fw-bold" value={form.currentClass} onChange={e => { setForm({ ...form, currentClass: e.target.value }); updateFeeFromStructure(currentAY, e.target.value, form.category); }}>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                      <label className="info-label">Assigned Section</label>
                      <select className="form-select form-select-sm border-0 bg-light-subtle rounded-3 fw-bold" value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}>{SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    </div>
                  </div>
                </div>

                {/* Installments */}
                <div className="card border-0 premium-shadow rounded-4 mb-4 bg-white">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-800 text-uppercase extra-small opacity-75 mb-0">Installment Plan</h6>
                      <span className="badge bg-primary rounded-pill extra-small">{form.installments.length} Slots</span>
                    </div>
                    <div className="ds-inst-scroll" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {form.installments.map((inst: any, idx: number) => (
                        <div key={idx} className="p-2 mb-2 rounded-3 bg-light border-start border-primary border-4">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="extra-small fw-bold">{inst.name}</span>
                            <input type="date" className="border-0 bg-transparent extra-small fw-bold text-muted" style={{ width: '100px' }} value={inst.dueDate} onChange={e => {
                               const updated = [...form.installments];
                               updated[idx].dueDate = e.target.value;
                               setForm({ ...form, installments: updated });
                            }} />
                          </div>
                          <div className="input-group input-group-sm">
                            <span className="input-group-text bg-transparent border-0 pe-1 fw-bold">₹</span>
                            <input type="number" className="form-control border-0 bg-transparent fw-800 text-primary" value={inst.amount} onChange={e => {
                               const updated = [...form.installments];
                               updated[idx].amount = Number(e.target.value);
                               setForm({ ...form, installments: updated });
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        .info-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 0.4rem; }
        .extra-small { font-size: 0.65rem; }
        .fw-800 { font-weight: 800; }
        .premium-shadow { box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05) !important; }
        .ds-inst-scroll::-webkit-scrollbar { width: 4px; }
        .ds-inst-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </DashboardShell>
  );
}
