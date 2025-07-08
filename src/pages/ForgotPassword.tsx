import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '@/components/Layout';
import { Button } from "@/components/ui/button";
import { X, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset messages
    setError(null);
    setSuccessMessage(null);
    
    // Validate input
    if (!email) {
      setError('Email is required');
      return;
    }
    
    try {
      setLoading(true);
      const { error } = await resetPassword(email);
      
      if (error) {
        throw error;
      }
      
      setSuccessMessage('Password reset link sent to your email');
      setEmail(''); // Clear the form
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[80vh] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Reset your password</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your email and we'll send you a link to reset your password
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4 rounded">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#48A7A7] hover:bg-[#48A7A7]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#48A7A7]"
              >
                {loading ? (
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                  </span>
                ) : null}
                Send reset link
              </Button>
            </div>
            
            <div className="text-center">
              <Link to="/login" className="font-medium text-[#48A7A7] hover:text-[#48A7A7]/80">
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
