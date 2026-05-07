'use client';
import React, { useState, useEffect } from 'react';
import DashboardShell from '../../../components/DashboardShell';
import { 
  StatCard, DataTable, LoadingSpinner, FormModal, ConfirmDialog, StatusBadge 
} from '../../../components/UIComponents';
import api from '../../../lib/api';

export default function TransportManagementPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [showDelete, setShowDelete] = useState<any>(null);
  const [form, setForm] = useState({
    routeName: '',
    vehicleNo: '',
    driverName: '',
    driverMobile: '',
    helperName: '',
    helperMobile: '',
    capacity: 40,
    fee: 0,
    villageName: ''
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transport');
      setData(res.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/transport/${editItem._id}`, form);
      } else {
        await api.post('/transport', form);
      }
      setShowForm(false);
      setEditItem(null);
      load();
    } catch (e: any) { alert(e.message); }
  };

  const openAdd = () => {
    setEditItem(null);
    setForm({
      routeName: '',
      vehicleNo: '',
      driverName: '',
      driverMobile: '',
      helperName: '',
      helperMobile: '',
      capacity: 40,
      fee: 0,
      villageName: ''
    });
    setShowForm(true);
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setForm(item);
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/transport/${showDelete._id}`);
      setShowDelete(null);
      load();
    } catch (e: any) { alert(e.message); }
  };

  const columns = [
    { 
      label: 'Route Name', 
      key: 'routeName',
      render: (row: any) => (
        <div>
          <div className="fw-800 text-dark small">{row.routeName}</div>
          <div className="text-muted extra-small">{row.villageName}</div>
        </div>
      )
    },
    { label: 'Vehicle No', key: 'vehicleNo', render: (row: any) => <span className="badge bg-light text-dark border extra-small">{row.vehicleNo}</span> },
    { 
      label: 'Driver', 
      key: 'driverName',
      render: (row: any) => (
        <div>
          <div className="fw-bold extra-small">{row.driverName}</div>
          <div className="text-primary extra-small">{row.driverMobile}</div>
        </div>
      )
    },
    { label: 'Capacity', key: 'capacity', render: (row: any) => <span className="fw-bold extra-small">{row.capacity} Seats</span> },
    { label: 'Fee', key: 'fee', render: (row: any) => <span className="fw-800 text-success extra-small">₹{row.fee}</span> },
    { label: 'Status', key: 'isActive', render: (row: any) => <StatusBadge status={row.isActive ? 'Active' : 'Inactive'} /> },
  ];

  return (
    <DashboardShell role="admin">
      <div className="container-fluid py-3">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="fw-800 mb-0">Transport Logistics</h5>
            <p className="text-muted extra-small fw-bold mb-0 text-uppercase opacity-75">Fleet & Route Management</p>
          </div>
          <button className="btn btn-primary rounded-pill px-4 fw-800 extra-small shadow-sm" onClick={openAdd}>
            <i className="bi bi-plus-lg me-2"/>Add New Route
          </button>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-3">
             <StatCard horizontal={true} icon="bi-bus-front" iconBg="rgba(59, 130, 246, 0.1)" label="Total Routes" value={data.length.toString()} />
          </div>
          <div className="col-md-3">
             <StatCard horizontal={true} icon="bi-people" iconBg="rgba(16, 185, 129, 0.1)" label="Total Capacity" value={data.reduce((acc, r: any) => acc + (r.capacity || 0), 0).toString()} />
          </div>
        </div>

        <div className="card border-0 premium-shadow rounded-4 bg-white overflow-hidden">
          <div className="card-body p-0">
            {loading ? <div className="p-5 text-center"><LoadingSpinner /></div> : (
              <DataTable 
                columns={columns} 
                data={data} 
                actions={(row: any) => (
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-light rounded-circle" onClick={() => openEdit(row)} title="Edit"><i className="bi bi-pencil small text-primary"/></button>
                    <button className="btn btn-sm btn-light rounded-circle" onClick={() => setShowDelete(row)} title="Delete"><i className="bi bi-trash small text-danger"/></button>
                  </div>
                )}
              />
            )}
          </div>
        </div>
      </div>

      <FormModal show={showForm} onClose={() => setShowForm(false)} title={editItem ? 'Edit Route' : 'Add Route'} onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="info-label">Route Name *</label>
            <input className="form-control form-control-sm rounded-3 fw-bold" value={form.routeName} onChange={e => setForm({...form, routeName: e.target.value})} required />
          </div>
          <div className="col-md-6">
            <label className="info-label">Vehicle Number *</label>
            <input className="form-control form-control-sm rounded-3 fw-bold" value={form.vehicleNo} onChange={e => setForm({...form, vehicleNo: e.target.value})} required />
          </div>
          <div className="col-md-6">
            <label className="info-label">Driver Name</label>
            <input className="form-control form-control-sm rounded-3" value={form.driverName} onChange={e => setForm({...form, driverName: e.target.value})} />
          </div>
          <div className="col-md-6">
            <label className="info-label">Driver Mobile</label>
            <input className="form-control form-control-sm rounded-3" value={form.driverMobile} onChange={e => setForm({...form, driverMobile: e.target.value})} />
          </div>
          <div className="col-md-6">
            <label className="info-label">Village / Area Name</label>
            <input className="form-control form-control-sm rounded-3" value={form.villageName} onChange={e => setForm({...form, villageName: e.target.value})} />
          </div>
          <div className="col-md-3">
            <label className="info-label">Capacity</label>
            <input type="number" className="form-control form-control-sm rounded-3" value={form.capacity} onChange={e => setForm({...form, capacity: Number(e.target.value)})} />
          </div>
          <div className="col-md-3">
            <label className="info-label">Monthly Fee (₹)</label>
            <input type="number" className="form-control form-control-sm rounded-3 fw-bold text-success" value={form.fee} onChange={e => setForm({...form, fee: Number(e.target.value)})} />
          </div>
          <div className="col-md-6">
            <label className="info-label">Helper Name</label>
            <input className="form-control form-control-sm rounded-3" value={form.helperName} onChange={e => setForm({...form, helperName: e.target.value})} />
          </div>
          <div className="col-md-6">
            <label className="info-label">Helper Mobile</label>
            <input className="form-control form-control-sm rounded-3" value={form.helperMobile} onChange={e => setForm({...form, helperMobile: e.target.value})} />
          </div>
        </div>
      </FormModal>

      <ConfirmDialog show={!!showDelete} onClose={() => setShowDelete(null)} onConfirm={handleDelete} message="Delete this transport route?" />

      <style jsx>{`
        .extra-small { font-size: 0.65rem; }
        .info-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 2px; }
        .premium-shadow { box-shadow: 0 5px 20px -5px rgba(0, 0, 0, 0.05) !important; }
      `}</style>
    </DashboardShell>
  );
}
