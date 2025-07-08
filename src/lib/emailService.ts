// Simple email service for sending notifications
// In a production environment, this would be replaced with a real email service like SendGrid, Mailgun, etc.

export interface EmailOptions {
  to: string;
  subject: string;
  body: string;
}

export interface LoanStatusUpdateData {
  name: string;
  loanType: string;
  amount: string;
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * Send an email notification
 * This is a mock implementation that logs to console in development
 * In production, this would be replaced with a real email service
 */
export const sendEmail = async (options: EmailOptions): Promise<{ success: boolean; message?: string }> => {
  try {
    console.log('Sending email:');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Body:', options.body);
    
    // In a real implementation, this would call an email API
    // For now, we'll simulate a successful email send
    
    // Store the email in localStorage for demo purposes
    const sentEmails = getSentEmails();
    sentEmails.push({
      ...options,
      sentAt: new Date().toISOString()
    });
    localStorage.setItem('254_capital_sent_emails', JSON.stringify(sentEmails));
    
    return { success: true };
  } catch (error: any) {
    console.error('Failed to send email:', error);
    return { success: false, message: error.message || 'Failed to send email' };
  }
};

/**
 * Get all sent emails from localStorage (for demo purposes)
 */
export const getSentEmails = (): (EmailOptions & { sentAt: string })[] => {
  const emails = localStorage.getItem('254_capital_sent_emails');
  return emails ? JSON.parse(emails) : [];
};

/**
 * Generate a loan application confirmation email
 */
export const generateLoanApplicationEmail = (
  name: string,
  email: string,
  loanType: string,
  amount: string,
  applicationId: string
): EmailOptions => {
  return {
    to: email,
    subject: `254 Capital: Your Loan Application ${applicationId} Has Been Received`,
    body: `
Dear ${name},

Thank you for applying for a ${loanType} with 254 Capital. We have received your application (ID: ${applicationId}) for KES ${amount}.

Our team will review your application and get back to you within 24-48 hours. If we need any additional information, we will contact you via email or phone.

Application Details:
- Application ID: ${applicationId}
- Loan Type: ${loanType}
- Amount: KES ${amount}
- Submission Date: ${new Date().toLocaleDateString()}

You can check the status of your application by logging into your account on our website or contacting our customer service team at support@254capital.com.

Thank you for choosing 254 Capital for your financial needs.

Best regards,
The 254 Capital Team
    `
  };
};

/**
 * Generate a loan status update email
 */
export const generateLoanStatusUpdateEmail = (data: LoanStatusUpdateData): string => {
  let statusMessage = '';
  
  switch (data.status) {
    case 'approved':
      statusMessage = 'We are pleased to inform you that your loan application has been APPROVED. Our team will contact you shortly to discuss the next steps and disbursement process.';
      break;
    case 'rejected':
      statusMessage = 'We regret to inform you that your loan application has been REJECTED. This decision was based on our current lending criteria. You are welcome to contact us for more information or to discuss alternative financing options.';
      break;
    case 'pending':
      statusMessage = 'Your loan application is currently PENDING review. Our team is carefully evaluating your application and will provide a decision as soon as possible.';
      break;
  }
  
  return `
Dear ${data.name},

Re: Loan Application Status Update

${statusMessage}

Application Details:
- Loan Type: ${data.loanType}
- Amount: ${data.amount}
- Current Status: ${data.status.toUpperCase()}

If you have any questions, please don't hesitate to contact us at support@254capital.co.ke.

Best regards,
The 254 Capital Team
`;
};
