/**
 * HR Notification Service for Salary Check-Off System
 * Handles sending email notifications to HR users
 */

import { sendEmail } from '@/lib/emailService';
import { hrUserService, HRUser } from './hruser.service';
import { getFirstDeductionDate, formatDeductionDate } from '@/utils/salary-checkoff/deductionDate';

export interface NewApplicationNotificationData {
  employeeFullName: string;
  loanAmount: number;
  applicationDate: string;
  applicationNumber: string;
  employerId: string;
}

export interface DisbursementNotificationData {
  employeeFullName: string;
  loanAmount: number;
  disbursementDate: string;
  monthlyInstallment: number;
  loanTenure: number;
  applicationNumber: string;
  employerId: string;
}

/**
 * Get HR users for a specific employer
 */
const getHRUsersForEmployer = async (employerId: string): Promise<HRUser[]> => {
  try {
    const response = await hrUserService.listHRUsers({
      employer_id: employerId,
      is_active: true,
    });
    return response.results;
  } catch (error) {
    console.error('Failed to fetch HR users for employer:', employerId, error);
    return [];
  }
};

/**
 * Format currency amount
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date for display
 */
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Calculate first deduction month note based on 15th-day rule
 */
const getDeductionStartNote = (disbursementDate: string): string => {
  const disbDate = new Date(disbursementDate);
  const dayOfMonth = disbDate.getDate();

  if (dayOfMonth <= 15) {
    const month = disbDate.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' });
    return `Payroll deductions should commence from ${month} (disbursed on or before the 15th).`;
  } else {
    const nextMonth = new Date(disbDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const month = nextMonth.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' });
    return `Payroll deductions should commence from ${month} (disbursed after the 15th).`;
  }
};

/**
 * Send notification to HR when a new loan application is submitted
 */
export const sendNewApplicationNotificationToHR = async (
  data: NewApplicationNotificationData
): Promise<{ success: boolean; hrUsersNotified: number; errors: string[] }> => {
  const errors: string[] = [];
  let hrUsersNotified = 0;

  try {
    const hrUsers = await getHRUsersForEmployer(data.employerId);

    if (hrUsers.length === 0) {
      console.warn(`No HR users found for employer ${data.employerId}. Skipping HR notification.`);
      return { success: true, hrUsersNotified: 0, errors: [] };
    }

    for (const hrUser of hrUsers) {
      try {
        const emailBody = `
Dear ${hrUser.first_name} ${hrUser.last_name},

A new loan application has been submitted and requires your review.

APPLICATION DETAILS
-------------------
Employee: ${data.employeeFullName}
Loan Amount: ${formatCurrency(data.loanAmount)}
Application Date: ${formatDate(data.applicationDate)}
Application Number: ${data.applicationNumber}

ACTION REQUIRED
---------------
Please log in to the HR portal to review and approve this application.

This application is pending your approval before it can proceed to the next stage.

Best regards,
254 Capital Team
---
This is an automated notification. Please do not reply to this email.
        `.trim();

        await sendEmail({
          to: hrUser.email,
          subject: `[Action Required] New Loan Application - ${data.employeeFullName} (${data.applicationNumber})`,
          body: emailBody,
        });

        hrUsersNotified++;
        console.log(`HR notification sent to ${hrUser.email} for application ${data.applicationNumber}`);
      } catch (emailError: any) {
        const errorMsg = `Failed to send notification to ${hrUser.email}: ${emailError.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    return { success: errors.length === 0, hrUsersNotified, errors };
  } catch (error: any) {
    console.error('Error in sendNewApplicationNotificationToHR:', error);
    return { success: false, hrUsersNotified: 0, errors: [error.message] };
  }
};

/**
 * Send notification to HR when a loan is disbursed
 */
export const sendDisbursementNotificationToHR = async (
  data: DisbursementNotificationData
): Promise<{ success: boolean; hrUsersNotified: number; errors: string[] }> => {
  const errors: string[] = [];
  let hrUsersNotified = 0;

  try {
    const hrUsers = await getHRUsersForEmployer(data.employerId);

    if (hrUsers.length === 0) {
      console.warn(`No HR users found for employer ${data.employerId}. Skipping disbursement notification.`);
      return { success: true, hrUsersNotified: 0, errors: [] };
    }

    const deductionNote = getDeductionStartNote(data.disbursementDate);

    for (const hrUser of hrUsers) {
      try {
        const emailBody = `
Dear ${hrUser.first_name} ${hrUser.last_name},

A loan has been disbursed to one of your employees. Please note the following details for payroll processing.

DISBURSEMENT DETAILS
--------------------
Employee: ${data.employeeFullName}
Loan Amount Disbursed: ${formatCurrency(data.loanAmount)}
Disbursement Date: ${formatDate(data.disbursementDate)}
Monthly Installment: ${formatCurrency(data.monthlyInstallment)}
Loan Tenure: ${data.loanTenure} months
Application Number: ${data.applicationNumber}

PAYROLL DEDUCTION SCHEDULE
--------------------------
${deductionNote}

Please ensure the monthly installment of ${formatCurrency(data.monthlyInstallment)} is deducted from the employee's salary each month until the loan is fully repaid.

You can view full loan details and repayment schedules in the HR portal.

Best regards,
254 Capital Team
---
This is an automated notification. Please do not reply to this email.
        `.trim();

        await sendEmail({
          to: hrUser.email,
          subject: `Loan Disbursed - ${data.employeeFullName} (${data.applicationNumber})`,
          body: emailBody,
        });

        hrUsersNotified++;
        console.log(`Disbursement notification sent to ${hrUser.email} for application ${data.applicationNumber}`);
      } catch (emailError: any) {
        const errorMsg = `Failed to send disbursement notification to ${hrUser.email}: ${emailError.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    return { success: errors.length === 0, hrUsersNotified, errors };
  } catch (error: any) {
    console.error('Error in sendDisbursementNotificationToHR:', error);
    return { success: false, hrUsersNotified: 0, errors: [error.message] };
  }
};

export const hrNotificationService = {
  sendNewApplicationNotificationToHR,
  sendDisbursementNotificationToHR,
  getHRUsersForEmployer,
};
