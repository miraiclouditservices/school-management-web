export const CLASSES = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
export const SECTIONS = ['A', 'B', 'C', 'D'];
export const GENDERS = ['Male', 'Female', 'Other'];
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const CATEGORIES = ['General', 'SC', 'ST', 'OBC', 'EWS'];
export const FEE_STATUS = ['Paid', 'Partially Paid', 'Overdue', 'Unpaid'];
export const PAYMENT_MODES = ['Cash', 'Online', 'Bank Transfer', 'Cheque', 'UPI'];
export const INQUIRY_MODES = ['Walk-in', 'Phone', 'Email', 'Website', 'Social Media', 'Reference'];
export const INQUIRY_STATUS = ['New', 'Follow-up', 'Converted', 'Lost'];
export const ATTENDANCE_STATUS = ['Present', 'Absent', 'Late', 'Leave'];
export const DEPARTMENTS = ['English', 'Mathematics', 'Science', 'Hindi', 'Social Science', 'Computer Science', 'Physical Education', 'Administration', 'Accounts', 'Transport', 'Library'];
export const EXAM_TYPES = ['Unit Test', 'Mid-Term', 'Final', 'Pre-Board', 'Board'];
export const EVENT_AUDIENCE = ['All', 'Students', 'Parents', 'Staff', 'Students, Parents'];
export const NOTICE_CATEGORIES = ['Academic', 'Holiday', 'Fee', 'Transport', 'Meeting', 'General'];
export const PRIORITIES = ['Low', 'Medium', 'High'];

export const STATUS_COLORS: Record<string, string> = {
  New: 'primary', 'Follow-up': 'warning', Converted: 'success', Lost: 'danger',
  Active: 'success', Inactive: 'secondary', Paid: 'success', 'Partially Paid': 'warning',
  Overdue: 'danger', Unpaid: 'secondary', Upcoming: 'primary', Present: 'success', Absent: 'danger',
  Late: 'warning', Leave: 'info', 'In Progress': 'warning',
  Completed: 'success', Cancelled: 'secondary', Approved: 'success', Rejected: 'danger',
  High: 'danger', Medium: 'warning', Low: 'info', 'TC Issued': 'secondary', Passout: 'info'
};

export const MENUS: Record<string, any[]> = {
  admin: [
    { label: 'Dashboard', icon: 'hgi-dashboard-square-01', color: '#4f46e5', href: '/admin' },
    { label: 'Admissions & Inquiry', icon: 'hgi-user-add-01', color: '#0ea5e9', href: '/admin/admissions' },
    { label: 'Student Profile', icon: 'hgi-user-group', color: '#10b981', href: '/admin/students' },
    { label: 'Fee Management', icon: 'hgi-money-receive-01', color: '#f59e0b', href: '/admin/fees' },
    { label: 'Timetable', icon: 'hgi-calendar-01', color: '#8b5cf6', href: '/admin/timetable' },
    { label: 'Attendance', icon: 'hgi-checkmark-circle-02', color: '#ef4444', href: '/admin/attendance' },
    { label: 'Accounts & Payroll', icon: 'hgi-wallet-01', color: '#6366f1', href: '/admin/accounts' },
    { label: 'Marks & Report Cards', icon: 'hgi-analytics-01', color: '#ec4899', href: '/admin/marks' },
    { label: 'Events & Notices', icon: 'hgi-megaphone', color: '#f43f5e', href: '/admin/events' },
    { label: 'Staff Management', icon: 'hgi-user-badge-01', color: '#14b8a6', href: '/admin/staff' },
    { label: 'System Settings', icon: 'hgi-settings-01', color: '#64748b', href: '/admin/settings' },
  ],
  student: [
    { label: 'My Dashboard', icon: 'hgi-home-01', color: '#4f46e5', href: '/student' },
    { label: 'Class Works', icon: 'hgi-task-01', color: '#10b981', href: '/student/tasks' },
    { label: 'My Attendance', icon: 'hgi-calendar-check-01', color: '#10b981', href: '/student/attendance' },
    { label: 'Fee Statement', icon: 'hgi-wallet-02', color: '#f59e0b', href: '/student/fees' },
    { label: 'Timetable', icon: 'hgi-clock-01', color: '#8b5cf6', href: '/student/timetable' },
    { label: 'Report Cards', icon: 'hgi-note-01', color: '#ec4899', href: '/student/marks' },
    { label: 'My Profile', icon: 'hgi-user-circle', color: '#6366f1', href: '/student/profile' },
  ],
  staff: [
    { label: 'Dashboard', icon: 'hgi-dashboard-square-01', color: '#4f46e5', href: '/staff' },
    { label: 'Attendance', icon: 'hgi-checkmark-circle-02', color: '#ef4444', href: '/staff/attendance' },
    { label: 'Timetable', icon: 'hgi-calendar-01', color: '#8b5cf6', href: '/staff/timetable' },
    { label: 'Tasks & Assignments', icon: 'hgi-task-01', color: '#10b981', href: '/staff/tasks' },
    { label: 'Marks Entry', icon: 'hgi-pencil-edit-01', color: '#ec4899', href: '/staff/marks' },
    { label: 'My Profile', icon: 'hgi-user-badge-01', color: '#6366f1', href: '/staff/profile' },
  ]
};

export const QUICK_LINKS = [
  { label: 'Notice Board', icon: 'hgi-clipboard-text' },
  { label: 'Leave Application', icon: 'hgi-note-01' },
  { label: 'Library', icon: 'hgi-book-open-01' },
  { label: 'Downloads', icon: 'hgi-download-01' },
  { label: 'Help & Support', icon: 'hgi-help-circle' },
];

export const formatDate = (d: string | Date | null) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
export const formatCurrency = (n: number | string | null) => n != null ? `₹ ${Number(n).toLocaleString('en-IN')}` : '-';
export const calcAge = (dob: string | Date | null) => {
  if (!dob) return '-';
  const d = new Date(dob);
  const diff = Date.now() - d.getTime();
  const y = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  const m = Math.floor((diff % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
  return `${y} Years, ${m} Months`;
};
