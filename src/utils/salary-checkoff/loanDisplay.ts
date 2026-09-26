// Loan application list endpoints (adminListQueue, hrListAll) serialize
// `employee` and `employer` as plain UUID strings and provide the display
// names/ids in separate flat fields (employee_name, employer_name), while
// the detail endpoint (getApplication) nests full objects. These helpers
// work with either shape so the same UI code can render both.

interface LoanApplicationLike {
  employee?: { id?: string; first_name?: string; last_name?: string; phone_number?: string } | string | null;
  employer?: { id?: string; name?: string } | string | null;
  employee_name?: string;
  employer_name?: string;
  mpesa_number?: string;
}

export function getEmployerName(item: LoanApplicationLike): string {
  const employer = item.employer;
  if (employer && typeof employer === 'object' && employer.name) {
    return employer.name;
  }
  return item.employer_name || 'N/A';
}

export function getEmployerId(item: LoanApplicationLike): string {
  const employer = item.employer;
  if (employer && typeof employer === 'object' && employer.id) {
    return employer.id;
  }
  return typeof employer === 'string' ? employer : '';
}

export function getEmployeeName(item: LoanApplicationLike): string {
  const employee = item.employee;
  if (employee && typeof employee === 'object' && (employee.first_name || employee.last_name)) {
    return `${employee.first_name || ''} ${employee.last_name || ''}`.trim();
  }
  return item.employee_name || 'N/A';
}

// Backend status values are raw snake_case (e.g. 'under_review_admin'), which
// is not what staff should be reading in a table. 'under_review_admin' in
// particular means HR has signed off and 254 Capital now owns the decision.
const LOAN_STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  under_review_admin: 'Approved by HR',
  approved: 'Approved',
  declined: 'Declined',
  disbursed: 'Disbursed',
};

const LOAN_STATUS_VARIANTS: Record<string, string> = {
  submitted: 'pending',
  under_review_admin: 'under-review',
  approved: 'approved',
  declined: 'declined',
  disbursed: 'disbursed',
};

export function getLoanStatusLabel(status: string | undefined | null): string {
  if (!status) return 'Unknown';
  return LOAN_STATUS_LABELS[status] || status.replace(/_/g, ' ');
}

export function getLoanStatusVariant(status: string | undefined | null): string {
  if (!status) return 'default';
  return LOAN_STATUS_VARIANTS[status] || 'default';
}

export function getEmployeePhone(item: LoanApplicationLike): string {
  const employee = item.employee;
  if (employee && typeof employee === 'object' && employee.phone_number) {
    return employee.phone_number;
  }
  return item.mpesa_number || '';
}
