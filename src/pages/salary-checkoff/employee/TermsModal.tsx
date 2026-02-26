import React, { useEffect, useState, useRef } from 'react';
import { Modal } from '@/components/salary-checkoff/ui/Modal';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Download, ScrollText, CheckCircle } from 'lucide-react';
interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (timestamp: string) => void;
}
export function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) {
      setHasScrolled(false);
      setIsChecked(false);
    }
  }, [isOpen]);
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
    if (atBottom) setHasScrolled(true);
  };
  const handleAccept = () => {
    const timestamp = new Date().toISOString();
    onAccept(timestamp);
    onClose();
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Terms & Conditions — Salary Check-Off Loan"
      size="xl"
      footer={
      <div className="w-full space-y-4">
          {!hasScrolled &&
        <p className="text-xs text-amber-600 text-center">
              Please scroll through and read all terms before accepting.
            </p>
        }
          <div className="flex items-start space-x-3">
            <input
            type="checkbox"
            id="tc-accept"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            disabled={!hasScrolled}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-[#008080] focus:ring-[#008080] disabled:opacity-40 cursor-pointer" />

            <label
            htmlFor="tc-accept"
            className={`text-sm ${hasScrolled ? 'text-slate-700 cursor-pointer' : 'text-slate-400'}`}>

              I have read and agree to the Terms and Conditions, including the
              payroll deduction authorization and privacy policy.
            </label>
          </div>
          <div className="flex justify-between items-center">
            <Button
            variant="ghost"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}>

              Download PDF
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
              onClick={handleAccept}
              disabled={!isChecked}
              leftIcon={<CheckCircle className="h-4 w-4" />}>

                Accept & Continue
              </Button>
            </div>
          </div>
        </div>
      }>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-96 overflow-y-auto pr-2 space-y-6 text-sm text-slate-700 leading-relaxed">

        <div className="flex items-center space-x-2 p-3 bg-[#E0F2F2] rounded-lg border border-[#99CCCC]">
          <ScrollText className="h-5 w-5 text-[#008080] flex-shrink-0" />
          <p className="text-[#008080] font-medium">
            Please read these terms carefully before applying for a loan.
          </p>
        </div>

        <section>
          <h4 className="font-semibold text-slate-900 mb-2">
            1. Eligibility Requirements
          </h4>
          <p>
            This salary check-off loan facility is{' '}
            <strong>available only to confirmed staff</strong> members. Employees
            on probation or temporary contracts are not eligible to apply for
            this loan product.
          </p>
          <p className="mt-2">
            You must have completed your probation period and received written
            confirmation of permanent employment from your employer to qualify
            for this facility.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-slate-900 mb-2">
            2. Interest Rate Disclosure
          </h4>
          <p>
            254 Capital charges a <strong>flat interest rate of 5%</strong> on
            the principal loan amount for the entire loan duration. This rate is
            applied once to the principal and does not compound. The total
            repayment amount is calculated as:{' '}
            <em>Total = Principal + (Principal × 5%)</em>.
          </p>
          <p className="mt-2">
            Example: A loan of KES 100,000 over 12 months will attract KES 5,000
            in interest, making the total repayment KES 105,000, with a monthly
            deduction of KES 8,750.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-slate-900 mb-2">
            3. Payroll Deduction Authorization
          </h4>
          <p>
            By accepting these terms, you{' '}
            <strong>irrevocably authorize your employer</strong> to deduct the
            agreed monthly loan repayment amount directly from your salary. This
            deduction will be remitted to 254 Capital on your behalf.
          </p>
          <p className="mt-2">
            You acknowledge that this authorization remains in effect until the
            loan is fully repaid and cannot be withdrawn without prior written
            consent from 254 Capital.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-slate-900 mb-2">
            4. Deduction Date Rules
          </h4>
          <p>
            Monthly deductions are processed on the{' '}
            <strong>25th of each calendar month</strong>. The first deduction
            date is determined as follows:
          </p>
          <ul className="mt-2 space-y-1 list-disc list-inside ml-2">
            <li>
              If the loan is disbursed on or before the{' '}
              <strong>15th of the month</strong>, the first deduction will be on
              the <strong>25th of that same month</strong>.
            </li>
            <li>
              If the loan is disbursed <strong>after the 15th</strong>, the
              first deduction will be on the{' '}
              <strong>25th of the following month</strong>.
            </li>
          </ul>
          <p className="mt-2">
            Subsequent deductions will occur on the 25th of each consecutive
            month until the loan is fully repaid.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-slate-900 mb-2">
            5. Early Exit / Employment Termination
          </h4>
          <p>
            This facility is{' '}
            <strong>eligible to confirmed staff only</strong>. In the event
            that your employment is terminated for any reason before the loan
            is fully repaid, the{' '}
            <strong>
              outstanding loan balance becomes immediately due and payable
            </strong>
            . Your employer is authorized to deduct the full outstanding balance
            from your terminal dues.
          </p>
          <p className="mt-2">
            If terminal dues are insufficient to cover the outstanding
            balance, you remain personally liable for the remaining amount and
            must arrange alternative repayment with 254 Capital within 30 days
            of termination.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-slate-900 mb-2">
            6. Document Handling & Privacy Policy
          </h4>
          <p>
            All documents submitted (National ID, payslips, etc.) will be stored
            securely and used solely for the purpose of loan assessment and
            verification. 254 Capital will not share your personal documents
            with third parties except as required by law or for credit reference
            purposes.
          </p>
          <p className="mt-2">
            Documents are retained for a minimum of 7 years in compliance with
            Kenyan financial regulations. You have the right to request access
            to your personal data at any time.
          </p>
          <p className="mt-2">
            <strong>Data Protection Compliance:</strong> 254 Capital is fully
            compliant with the{' '}
            <strong>Data Protection Act, 2019 (Act No. 24 of 2019)</strong> of
            the Republic of Kenya. Your personal data is processed lawfully,
            fairly, and transparently in accordance with the Act. You have
            rights to access, rectify, and request deletion of your personal
            data as provided under the Act.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-slate-900 mb-2">
            7. Employment Verification Consent
          </h4>
          <p>
            You hereby consent to 254 Capital contacting your employer's HR
            department to verify your employment status, salary details, and any
            existing financial obligations. This verification is a mandatory
            requirement for loan processing.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-slate-900 mb-2">
            8. Default & Late Payment
          </h4>
          <p>
            Failure to maintain employment without notifying 254 Capital, or any
            action that prevents the scheduled deduction, will be considered a
            default. 254 Capital reserves the right to report defaults to the
            Credit Reference Bureau (CRB) and pursue legal recovery.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-slate-900 mb-2">
            9. Governing Law
          </h4>
          <p>
            These terms are governed by the laws of the Republic of Kenya. Any
            disputes shall be resolved through the courts of Kenya or through
            mutually agreed arbitration.
          </p>
        </section>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500">
          Last updated: January 2026 · 254 Capital Limited · Nairobi, Kenya
        </div>
      </div>
    </Modal>);

}