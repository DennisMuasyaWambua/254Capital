import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import LoanApplicationForm from "../../components/LoanApplicationForm";

const NewApplication = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center">
        <Button 
          onClick={() => navigate('/dashboard/applications')}
          variant="outline"
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Applications
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">New Loan Application</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <LoanApplicationForm onSuccess={() => navigate('/dashboard/applications')} />
      </div>
    </DashboardLayout>
  );
};

export default NewApplication;
