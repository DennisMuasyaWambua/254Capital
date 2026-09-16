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

export function getEmployeePhone(item: LoanApplicationLike): string {
  const employee = item.employee;
  if (employee && typeof employee === 'object' && employee.phone_number) {
    return employee.phone_number;
  }
  return item.mpesa_number || '';
}
