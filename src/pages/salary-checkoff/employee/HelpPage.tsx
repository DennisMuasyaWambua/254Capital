import React, { useState } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Input } from '@/components/salary-checkoff/ui/Input';
import {
  HelpCircle,
  Send,
  CheckCircle2,
  Mail,
  Phone,
  MessageSquare,
  Loader2,
} from 'lucide-react';

export function HelpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Create mailto link with form data
      const subject = encodeURIComponent(formData.subject || 'Support Request');
      const body = encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
      );
      const mailtoLink = `mailto:checkoff@254-capital.com?subject=${subject}&body=${body}`;

      // Open default email client
      window.location.href = mailtoLink;

      // Show success message
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setError('Failed to send message. Please try again or email us directly at checkoff@254-capital.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Help & Support</h1>
        <p className="text-slate-600 mt-1">
          Get assistance with your loan applications and account
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card title="Contact Support">
            {submitted && (
              <div className="mb-6 flex items-start space-x-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-emerald-900">Message Sent!</p>
                  <p className="text-sm text-emerald-700 mt-1">
                    Your email client should have opened. If not, please email us directly at{' '}
                    <a
                      href="mailto:checkoff@254-capital.com"
                      className="underline font-medium">
                      checkoff@254-capital.com
                    </a>
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <MessageSquare className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
                <Input
                  label="Your Email *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Subject *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-[#008080] focus:border-[#008080]">
                  <option value="">Select a topic</option>
                  <option value="Loan Application Query">Loan Application Query</option>
                  <option value="Repayment Schedule">Repayment Schedule</option>
                  <option value="Account Issue">Account Issue</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please describe your question or issue in detail..."
                  required
                  rows={6}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-[#008080] focus:border-[#008080]"
                />
              </div>

              <Button
                type="submit"
                leftIcon={
                  isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )
                }
                disabled={isSubmitting}
                className="w-full sm:w-auto">
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Contact Info & FAQ */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card title="Contact Information">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-[#008080] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Email</p>
                  <a
                    href="mailto:checkoff@254-capital.com"
                    className="text-sm text-[#008080] hover:underline">
                    checkoff@254-capital.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-[#008080] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Phone</p>
                  <p className="text-sm text-slate-600">+254 700 000 000</p>
                  <p className="text-xs text-slate-500 mt-1">Mon-Fri: 8AM - 5PM EAT</p>
                </div>
              </div>
            </div>
          </Card>

          {/* FAQs */}
          <Card title="Frequently Asked Questions">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1 flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2 text-[#008080]" />
                  How long does approval take?
                </h4>
                <p className="text-sm text-slate-600 pl-6">
                  Most applications are reviewed within 24-48 hours.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1 flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2 text-[#008080]" />
                  When will I receive my funds?
                </h4>
                <p className="text-sm text-slate-600 pl-6">
                  Disbursement typically occurs within 2-3 business days after approval.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1 flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2 text-[#008080]" />
                  How are deductions made?
                </h4>
                <p className="text-sm text-slate-600 pl-6">
                  Deductions are automatically taken from your salary on the 25th of each month.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1 flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2 text-[#008080]" />
                  Can I pay off my loan early?
                </h4>
                <p className="text-sm text-slate-600 pl-6">
                  Yes, early repayment is allowed. Contact support for details.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
