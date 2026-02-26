/**
 * 254 Capital Deduction Date Logic
 * Rule: If disbursed on or before the 15th → first deduction on 25th of SAME month
 *       If disbursed after the 15th → first deduction on 25th of NEXT month
 */

export function getFirstDeductionDate(disbursementDate: Date): Date {
  const day = disbursementDate.getDate();
  const month = disbursementDate.getMonth();
  const year = disbursementDate.getFullYear();

  if (day <= 15) {
    return new Date(year, month, 25);
  } else {
    return new Date(year, month + 1, 25);
  }
}

export function getDeductionTag(
disbursementDate: Date)
: 'same-month' | 'next-month' {
  return disbursementDate.getDate() <= 15 ? 'same-month' : 'next-month';
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