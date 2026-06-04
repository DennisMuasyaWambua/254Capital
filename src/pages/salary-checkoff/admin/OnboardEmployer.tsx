import React, { useState } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Input } from '@/components/salary-checkoff/ui/Input';
import { Select } from '@/components/salary-checkoff/ui/Select';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { FileUpload } from '@/components/salary-checkoff/ui/FileUpload';
import {
  employerService,
  CreateEmployerRequest,
} from '@/services/salary-checkoff/employer.service';
import { documentService } from '@/services/salary-checkoff/document.service';
import { Building, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

interface OnboardEmployerProps {
  onNavigate: (page: string) => void;
}

export function OnboardEmployer({ onNavigate }: OnboardEmployerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendEmail, setSendEmail] = useState(true);
  const [agreementFile, setAgreementFile] = useState<File[]>([]);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [generatedUsername, setGeneratedUsername] = useState<string>('');

  const [formData, setFormData] = useState({
    companyName: '',
    registrationNumber: '',
    industry: '',
    numberOfEmployees: '',
    address: '',
    companyEmail: '',
    companyPhone: '',
    payrollCycle: 'monthly',
    deductionDay: '25',
    remittanceMethod: 'bank',
    remittanceAccount: '',
    hrName: '',
    hrTitle: '',
    hrEmail: '',
    hrMobile: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Normalize phone number - remove spaces and special characters
      const normalizedPhone = formData.hrMobile.replace(/\s+/g, '').replace(/[^\d+]/g, '');

      // Create employer data
      const employerData: CreateEmployerRequest = {
        name: formData.companyName,
        registration_number: formData.registrationNumber,
        address: formData.address,
        payroll_cycle_day: parseInt(formData.deductionDay),
        hr_contact_name: formData.hrName,
        hr_contact_email: formData.hrEmail,
        hr_contact_phone: normalizedPhone,
      };

      // Create the employer and get HR credentials from response
      const newEmployer: any = await employerService.createEmployer(employerData);

      // Upload agreement document if provided
      if (agreementFile.length > 0) {
        await documentService.uploadDocument({
          file: agreementFile[0],
          document_type: 'check_off_agreement',
          employer_id: newEmployer.id,
        });
      }

      // Set the credentials from backend response
      if (newEmployer.hr_credentials) {
        setGeneratedUsername(newEmployer.hr_credentials.username);
        setGeneratedPassword(newEmployer.hr_credentials.temporary_password);
      }

      // Show success
      setShowSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => {
        setShowSuccess(false);
        onNavigate('dashboard');
      }, 5000);
    } catch (error: any) {
      console.error('Error onboarding employer:', error);
      let errorMessage = 'Failed to onboard employer. Please try again.';
      if (error.data && error.data.errors) {
        const errorDetails = Object.entries(error.data.errors)
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
          .join('; ');
        errorMessage = `Validation error: ${errorDetails}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Onboard Employer</h1>
        <p className="text-slate-500">
          Add a new partner company and generate HR portal credentials.
        </p>
      </div>

      {showSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start text-emerald-800 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 mr-3 mt-0.5 text-emerald-600 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium">Employer onboarded successfully!</h4>
            <p className="text-sm text-emerald-700 mt-1">
              The company profile has been created and an HR manager account has been set up.
              {sendEmail && ' HR login credentials have been sent via email.'}
            </p>
            {generatedUsername && generatedPassword && (
              <div className="mt-3 p-3 bg-emerald-100 rounded border border-emerald-200">
                <p className="text-sm font-medium text-emerald-900 mb-2">HR Login Credentials:</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-700 font-medium">Username:</span>
                    <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-emerald-200">
                      {generatedUsername}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-700 font-medium">Password:</span>
                    <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-emerald-200">
                      {generatedPassword}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-emerald-600 mt-2">
                  Please save these credentials securely. The HR manager should change the password after first login.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
          <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Company Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Company Name *"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="e.g. TechCorp Ltd"
              required
            />
            <Input
              label="Registration Number"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleInputChange}
              placeholder="e.g. PVT-12345"
            />
            <Select
              label="Industry *"
              name="industry"
              value={formData.industry}
              onChange={handleInputChange}
              options={[
                { value: 'tech', label: 'Technology' },
                { value: 'finance', label: 'Financial Services' },
                { value: 'health', label: 'Healthcare' },
                { value: 'education', label: 'Education' },
                { value: 'manufacturing', label: 'Manufacturing' },
                { value: 'retail', label: 'Retail' },
                { value: 'hospitality', label: 'Hospitality' },
                { value: 'other', label: 'Other' },
              ]}
              required
            />
            <Input
              label="Number of Employees *"
              name="numberOfEmployees"
              type="number"
              value={formData.numberOfEmployees}
              onChange={handleInputChange}
              placeholder="e.g. 150"
              required
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Physical Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-[#008080] focus:ring-1 focus:ring-[#008080] h-20 resize-none"
              />
            </div>
            <Input
              label="Company Email *"
              name="companyEmail"
              type="email"
              value={formData.companyEmail}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Company Phone *"
              name="companyPhone"
              value={formData.companyPhone}
              onChange={handleInputChange}
              required
            />
          </div>
        </Card>

        <Card title="Payroll Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Payroll Cycle *"
              name="payrollCycle"
              value={formData.payrollCycle}
              onChange={handleInputChange}
              options={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'biweekly', label: 'Bi-weekly' },
                { value: 'weekly', label: 'Weekly' },
              ]}
              required
            />
            <Input
              label="Deduction Collection Date *"
              name="deductionDay"
              type="number"
              min="1"
              max="31"
              value={formData.deductionDay}
              onChange={handleInputChange}
              required
              helperText="Default day of month for collections"
            />
            <Select
              label="Preferred Remittance Method *"
              name="remittanceMethod"
              value={formData.remittanceMethod}
              onChange={handleInputChange}
              options={[
                { value: 'bank', label: 'Bank Transfer' },
                { value: 'mpesa', label: 'M-Pesa Paybill' },
              ]}
              required
            />
            <Input
              label="Remittance Account Details *"
              name="remittanceAccount"
              value={formData.remittanceAccount}
              onChange={handleInputChange}
              placeholder="Account number or Paybill"
              required
            />
          </div>
        </Card>

        <Card title="HR / Payroll Contact Person">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name *"
              name="hrName"
              value={formData.hrName}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Job Title *"
              name="hrTitle"
              value={formData.hrTitle}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Email Address (Login ID) *"
              name="hrEmail"
              type="email"
              value={formData.hrEmail}
              onChange={handleInputChange}
              required
              helperText="This will be used for HR portal login"
            />
            <Input
              label="Mobile Number *"
              name="hrMobile"
              value={formData.hrMobile}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h4 className="font-medium text-slate-900 mb-2 flex items-center">
              <Building className="h-4 w-4 mr-2 text-slate-500" />
              HR Portal Credentials
            </h4>
            <div className="flex items-center justify-between bg-white p-3 rounded border border-slate-200 mb-4">
              <span className="text-sm text-slate-500">Temporary Password:</span>
              <code className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                {generatedPassword || 'Will be generated on submission'}
              </code>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sendEmail"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#008080] focus:ring-[#008080]"
              />
              <label htmlFor="sendEmail" className="text-sm text-slate-700">
                Send login credentials and onboarding guide to HR email automatically
              </label>
            </div>
          </div>
        </Card>

        <Card title="Agreement Upload">
          <FileUpload
            label="Upload Check-Off Agreement"
            accept=".pdf"
            maxSizeMB={10}
            onFilesSelected={setAgreementFile}
            helperText="Signed MoU or Check-off agreement (PDF only)"
          />
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => onNavigate('dashboard')}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            leftIcon={<Mail className="h-4 w-4" />}
          >
            Submit & Activate Employer
          </Button>
        </div>
      </form>
    </div>
  );
}
