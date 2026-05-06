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
    { label: 'Dashboard', icon: 'bi-grid-fill', color: '#4f46e5', href: '/admin' },
    { label: 'Admissions & Inquiry', icon: 'bi-person-plus-fill', color: '#0ea5e9', href: '/admin/admissions' },
    { label: 'Student Profile', icon: 'bi-people-fill', color: '#10b981', href: '/admin/students' },
    { label: 'Fee Management', icon: 'bi-currency-rupee', color: '#f59e0b', href: '/admin/fees' },
    { label: 'Timetable', icon: 'bi-calendar3', color: '#8b5cf6', href: '/admin/timetable' },
    { label: 'Attendance', icon: 'bi-check2-square', color: '#ef4444', href: '/admin/attendance' },
    { label: 'Accounts & Payroll', icon: 'bi-wallet2', color: '#6366f1', href: '/admin/accounts' },
    { label: 'Marks & Report Cards', icon: 'bi-journal-check', color: '#ec4899', href: '/admin/marks' },
    { label: 'Events & Notices', icon: 'bi-megaphone-fill', color: '#f43f5e', href: '/admin/events' },
    { label: 'Staff Management', icon: 'bi-person-badge-fill', color: '#14b8a6', href: '/admin/staff' },
    { label: 'System Settings', icon: 'bi-gear-fill', color: '#64748b', href: '/admin/settings' },
  ],
  student: [
    { label: 'My Dashboard', icon: 'bi-house-heart-fill', color: '#4f46e5', href: '/student' },
    { label: 'Class Works', icon: 'bi-journal-check', color: '#10b981', href: '/student/tasks' },
    { label: 'My Attendance', icon: 'bi-calendar-check', color: '#10b981', href: '/student/attendance' },
    { label: 'Fee Statement', icon: 'bi-wallet2', color: '#f59e0b', href: '/student/fees' },
    { label: 'Timetable', icon: 'bi-clock-history', color: '#8b5cf6', href: '/student/timetable' },
    { label: 'Report Cards', icon: 'bi-journal-text', color: '#ec4899', href: '/student/marks' },
    { label: 'My Profile', icon: 'bi-person-circle', color: '#6366f1', href: '/student/profile' },
  ],
  staff: [
    { label: 'Dashboard', icon: 'bi-grid-fill', color: '#4f46e5', href: '/staff' },
    { label: 'Attendance', icon: 'bi-check2-square', color: '#ef4444', href: '/staff/attendance' },
    { label: 'Timetable', icon: 'bi-calendar3', color: '#8b5cf6', href: '/staff/timetable' },
    { label: 'Tasks & Assignments', icon: 'bi-journal-check', color: '#10b981', href: '/staff/tasks' },
    { label: 'Marks Entry', icon: 'bi-pencil-square', color: '#ec4899', href: '/staff/marks' },
    { label: 'My Profile', icon: 'bi-person-badge-fill', color: '#6366f1', href: '/staff/profile' },
  ]
};

export const QUICK_LINKS = [
  { label: 'Notice Board', icon: 'bi-clipboard-check' },
  { label: 'Leave Application', icon: 'bi-file-earmark-text' },
  { label: 'Library', icon: 'bi-book' },
  { label: 'Downloads', icon: 'bi-download' },
  { label: 'Help & Support', icon: 'bi-question-circle' },
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
