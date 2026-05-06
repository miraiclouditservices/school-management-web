'use client';
import { useState, useEffect } from 'react';
import DashboardShell from '../../../components/DashboardShell';
import { LoadingSpinner } from '../../../components/UIComponents';
import api from '../../../lib/api';
import { formatDate } from '../../../lib/constants';

export default function ProfilePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/students/me')
      .then(r => {
        if (r.success) setData(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <DashboardShell role="student"><div className="d-flex justify-content-center py-5"><LoadingSpinner /></div></DashboardShell>;
  if (!data) return <DashboardShell role="student"><div className="alert alert-danger">Failed to load profile</div></DashboardShell>;

  return (
    <DashboardShell role="student">
      <div className="row g-4 animate__animated animate__fadeIn">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 text-center p-4 mb-4">
            <div className="position-relative d-inline-block mx-auto mb-4">
              <div className="rounded-circle bg-primary-subtle d-flex align-items-center justify-content-center overflow-hidden" style={{ width: '150px', height: '150px', border: '5px solid #fff', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                {data.photo ? (
                  <img src={data.photo} alt="Profile" className="w-100 h-100 object-fit-cover" />
                ) : (
                  <span className="display-4 fw-900 text-primary">{data.firstName[0]}{data.lastName[0]}</span>
                )}
              </div>
              <button className="btn btn-primary btn-sm rounded-circle position-absolute bottom-0 end-0 p-2 shadow">
                <i className="bi bi-camera"></i>
              </button>
            </div>
            <h4 className="fw-900 text-dark mb-1">{data.firstName} {data.lastName}</h4>
            <p className="text-muted fw-bold small mb-3">Student ID: {data.admissionNo}</p>
            <div className="d-flex justify-content-center gap-2 mb-4">
              <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">Class {data.currentClass}</span>
              <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">Section {data.section}</span>
            </div>
            <hr className="my-4 opacity-50" />
            <div className="text-start">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="bg-light p-2 rounded-3 text-primary"><i className="bi bi-envelope"></i></div>
                <div>
                  <p className="extra-small text-muted mb-0 fw-bold">EMAIL ADDRESS</p>
                  <p className="small text-dark mb-0 fw-800">{data.email || 'N/A'}</p>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-light p-2 rounded-3 text-primary"><i className="bi bi-telephone"></i></div>
                <div>
                  <p className="extra-small text-muted mb-0 fw-bold">PHONE NUMBER</p>
                  <p className="small text-dark mb-0 fw-800">{data.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h6 className="fw-800 mb-4">Quick Links</h6>
            <div className="list-group list-group-flush gap-2">
              <button className="list-group-item list-group-item-action border-0 rounded-3 small fw-bold px-3 py-2">
                <i className="bi bi-shield-lock me-2"></i>Change Password
              </button>
              <button className="list-group-item list-group-item-action border-0 rounded-3 small fw-bold px-3 py-2">
                <i className="bi bi-printer me-2"></i>Print ID Card
              </button>
              <button className="list-group-item list-group-item-action border-0 rounded-3 small fw-bold px-3 py-2 text-danger">
                <i className="bi bi-box-arrow-right me-2"></i>Logout
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div className="card-header bg-white border-0 py-4 px-4 border-bottom">
              <h5 className="mb-0 fw-800">Academic & Personal Information</h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-4">
                <div className="col-md-6">
                  <h6 className="fw-800 text-primary mb-3 small uppercase tracking-wider">Academic Details</h6>
                  <div className="d-flex flex-column gap-3">
                    <InfoRow label="Admission No" value={data.admissionNo} />
                    <InfoRow label="Roll Number" value={data.rollNo || 'Not Assigned'} />
                    <InfoRow label="Admission Date" value={formatDate(data.admissionDate)} />
                    <InfoRow label="Admission Status" value={data.admissionStatus} />
                    <InfoRow label="Class Teacher" value={data.classTeacher?.name || 'TBA'} />
                  </div>
                </div>
                <div className="col-md-6">
                  <h6 className="fw-800 text-primary mb-3 small uppercase tracking-wider">Personal Details</h6>
                  <div className="d-flex flex-column gap-3">
                    <InfoRow label="Date of Birth" value={formatDate(data.dateOfBirth)} />
                    <InfoRow label="Gender" value={data.gender} />
                    <InfoRow label="Blood Group" value={data.bloodGroup || 'N/A'} />
                    <InfoRow label="Category" value={data.category || 'General'} />
                    <InfoRow label="Aadhar No" value={data.aadharNumber || 'N/A'} />
                  </div>
                </div>
                <div className="col-12 mt-5">
                  <h6 className="fw-800 text-primary mb-3 small uppercase tracking-wider">Parent/Guardian Details</h6>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="p-3 rounded-4 bg-light">
                        <p className="extra-small text-muted fw-bold mb-1">FATHER'S NAME</p>
                        <p className="fw-800 mb-0">{data.father?.name || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 rounded-4 bg-light">
                        <p className="extra-small text-muted fw-bold mb-1">MOTHER'S NAME</p>
                        <p className="fw-800 mb-0">{data.mother?.name || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-800 mb-4">Address Details</h5>
            <div className="row g-4">
              <div className="col-md-6">
                <p className="extra-small text-muted fw-bold mb-1 uppercase">Current Address</p>
                <p className="small text-dark mb-0 fw-medium">
                  {data.address?.street}, {data.address?.city},<br />
                  {data.address?.state}, {data.address?.pincode}
                </p>
              </div>
              <div className="col-md-6">
                <p className="extra-small text-muted fw-bold mb-1 uppercase">Permanent Address</p>
                <p className="small text-dark mb-0 fw-medium">
                  {data.sameAsAddress ? 'Same as Current Address' : (
                    `${data.permanentAddress?.street}, ${data.permanentAddress?.city}, ${data.permanentAddress?.state}, ${data.permanentAddress?.pincode}`
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="d-flex justify-content-between align-items-center border-bottom border-light pb-2">
      <span className="small text-muted fw-bold">{label}</span>
      <span className="small text-dark fw-800">{value}</span>
    </div>
  );
}
