'use client';
import { useState, useEffect } from 'react';
import DashboardShell from '../../../components/DashboardShell';
import { LoadingSpinner, DataTable, StatusBadge } from '../../../components/UIComponents';
import api from '../../../lib/api';

export default function MarksPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/marks/my-marks')
      .then(r => {
        if (r.success) setExams(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const columns = [
    { header: 'EXAM TYPE', accessor: 'examType' },
    { header: 'SUBJECT', accessor: 'subject' },
    { header: 'MARKS OBTAINED', accessor: (row: any) => <span className="fw-800">{row.marks} / {row.maxMarks}</span> },
    { header: 'PERCENTAGE', accessor: (row: any) => `${((row.marks / row.maxMarks) * 100).toFixed(1)}%` },
    { header: 'GRADE', accessor: 'grade' },
    { header: 'REMARKS', accessor: 'remarks' },
  ];

  return (
    <DashboardShell role="student">
      <div className="mb-4">
        <h2 className="fw-900 text-dark mb-1" style={{ letterSpacing: '-0.04em' }}>Academic Performance</h2>
        <p className="text-muted fw-semibold opacity-75">View your grades and examination results</p>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5"><LoadingSpinner /></div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden animate__animated animate__fadeIn">
          <div className="card-header bg-white border-0 py-4 px-4 border-bottom d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-800">Recent Exam Results</h5>
            <div className="dropdown">
              <button className="btn btn-light btn-sm dropdown-toggle fw-bold border" type="button" data-bs-toggle="dropdown">
                Filter by Term
              </button>
              <ul className="dropdown-menu shadow border-0 mt-2">
                <li><a className="dropdown-item active" href="#">Final Exam 2024</a></li>
                <li><a className="dropdown-item" href="#">Mid-Term 2024</a></li>
                <li><a className="dropdown-item" href="#">Unit Test 2</a></li>
              </ul>
            </div>
          </div>
          <div className="card-body p-0">
            <DataTable columns={columns} data={exams} loading={false} />
            {exams.length === 0 && (
              <div className="text-center py-5">
                <i className="bi bi-journal-x text-muted fs-1 mb-3 d-block opacity-25"></i>
                <h6 className="fw-800">No results published yet</h6>
                <p className="text-muted small">Academic marks will appear here once published by the faculty.</p>
              </div>
            )}
          </div>
          <div className="card-footer bg-light-subtle border-0 py-3 px-4 text-center">
            <p className="extra-small fw-bold text-muted uppercase mb-0" style={{ letterSpacing: '0.1em' }}>
              Previous exams are archived. Contact the office for older records.
            </p>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
