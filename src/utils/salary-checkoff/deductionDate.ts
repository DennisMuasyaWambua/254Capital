/**
 * 254 Capital Deduction Date Logic
 * Rule: If disbursed on or before the 15th → first deduction on 25th of SAME month
 *       If disbursed after the 15th → first deduction on 25th of NEXT month
 */

export function getFirstDeductionDate(disbursementDate: Date): Date {
  const day = disbursementDate.getDate();
  const month = disbursementDate.getMonth();
  const year = disbursementDate.getFullYear();

  if (day < 15) {
    return new Date(year, month, 25);
  } else {
    return new Date(year, month + 1, 25);
  }
}

export function getDeductionTag(
disbursementDate: Date)
: 'same-month' | 'next-month' {
  return disbursementDate.getDate() < 15 ? 'same-month' : 'next-month';
}

export function formatDeductionDate(date: Date): string {
  return date.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function generateRepaymentSchedule(
firstDeductionDate: Date,
monthlyAmount: number,
totalMonths: number,
totalRepayment: number)
{
  const schedule = [];
  let balance = totalRepayment;
  const principal =
  totalRepayment / (1.05 * totalMonths) * totalMonths / totalMonths;
  const interest = (totalRepayment - totalRepayment / 1.05) / totalMonths;

  for (let i = 0; i < totalMonths; i++) {
    const dueDate = new Date(
      firstDeductionDate.getFullYear(),
      firstDeductionDate.getMonth() + i,
      25
    );
    balance -= monthlyAmount;

    schedule.push({
      month: i + 1,
      dueDate: dueDate.toLocaleDateString('en-KE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      amount: Math.round(monthlyAmount),
      principal: Math.round(monthlyAmount / 1.05 * (1 / 1)),
      interest: Math.round(monthlyAmount - monthlyAmount / 1.05),
      status: i === 0 ? 'current' : 'upcoming',
      balance: Math.max(0, Math.round(balance)),
      isFirst: i === 0
    });
  }

  return schedule;
}

/**
 * Calculate first repayment month based on 15th-day rule
 * - If disbursed before 15th: first repayment is same month
 * - If disbursed on/after 15th: first repayment is next month
 */
export function getFirstRepaymentMonth(disbursementDate: Date): { month: number; year: number } {
  const day = disbursementDate.getDate();
  const month = disbursementDate.getMonth() + 1; // Convert to 1-12
  const year = disbursementDate.getFullYear();

  if (day < 15) {
    return { month, year };
  } else {
    // Add 1 month
    if (month === 12) {
      return { month: 1, year: year + 1 };
    } else {
      return { month: month + 1, year };
    }
  }
}

/**
 * Calculate last repayment month
 */
export function getLastRepaymentMonth(
  disbursementDate: Date,
  tenureMonths: number
): { month: number; year: number } {
  const firstRepayment = getFirstRepaymentMonth(disbursementDate);

  // Calculate last repayment month by adding tenure_months - 1
  let lastMonth = firstRepayment.month + tenureMonths - 1;
  let lastYear = firstRepayment.year;

  // Handle year overflow
  while (lastMonth > 12) {
    lastMonth -= 12;
    lastYear += 1;
  }

  return { month: lastMonth, year: lastYear };
}

/**
 * Check if loan should appear on collection report for given month/year
 * Returns true if: first_repayment_month <= report_month <= last_repayment_month
 */
export function shouldIncludeInCollectionReport(
  disbursementDate: Date,
  tenureMonths: number,
  reportMonth: number,
  reportYear: number
): boolean {
  const firstRepayment = getFirstRepaymentMonth(disbursementDate);
  const lastRepayment = getLastRepaymentMonth(disbursementDate, tenureMonths);

  // Convert dates to comparable numbers (YYYYMM format)
  const firstRepaymentNum = firstRepayment.year * 100 + firstRepayment.month;
  const lastRepaymentNum = lastRepayment.year * 100 + lastRepayment.month;
  const reportNum = reportYear * 100 + reportMonth;

  return reportNum >= firstRepaymentNum && reportNum <= lastRepaymentNum;
}

/**
 * Check if loan has matured (past its last repayment month)
 */
export function isLoanMatured(
  disbursementDate: Date,
  tenureMonths: number,
  currentMonth: number,
  currentYear: number
): boolean {
  const lastRepayment = getLastRepaymentMonth(disbursementDate, tenureMonths);
  const lastRepaymentNum = lastRepayment.year * 100 + lastRepayment.month;
  const currentNum = currentYear * 100 + currentMonth;

  return currentNum > lastRepaymentNum;
}