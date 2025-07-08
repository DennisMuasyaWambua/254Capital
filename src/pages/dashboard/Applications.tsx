import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { 
  getLoanApplications, 
  deleteLoanApplication, 
  getLoanApplicationStats, 
  updateLoanApplication,
  LoanApplication,
  searchLoanApplications,
  filterLoanApplicationsByStatus 
} from '../../lib/loanApplicationsDb';

// Import custom components
import ApplicationStats from '../../components/dashboard/ApplicationStats';
import ApplicationSearch from '../../components/dashboard/ApplicationSearch';
import ApplicationsTable from '../../components/dashboard/ApplicationsTable';

const Applications = () => {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<LoanApplication[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 'KES 0',
    avgAmount: 'KES 0'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();

  // Load applications and stats from database
  useEffect(() => {
    loadApplications();
    loadStats();
  }, [searchQuery, statusFilter]);
  
  // Apply pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setFilteredApplications(applications.slice(startIndex, endIndex));
  }, [applications, currentPage, itemsPerPage]);

  const loadApplications = () => {
    let results;

    if (searchQuery) {
      results = searchLoanApplications(searchQuery);
    } else {
      results = filterLoanApplicationsByStatus(statusFilter);
    }

    // Reset to first page when search/filter changes
    setCurrentPage(1);
    setApplications(results);
  };

  const loadStats = () => {
    const stats = getLoanApplicationStats();
    setStats(stats);
  };

  const handleEditApplication = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click event
    navigate(`/dashboard/applications/edit/${id}`);
  };
  
  const handleViewDetails = (id: string) => {
    navigate(`/dashboard/applications/${id}`);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteApplication = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click event
    setApplicationToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteApplication = () => {
    if (applicationToDelete) {
      // Delete the application
      const success = deleteLoanApplication(applicationToDelete);
      
      if (success) {
        // Update the UI with fresh data from localStorage
        setApplications(getLoanApplications());
        setStats(getLoanApplicationStats());
      }
      
      // Close the modal and reset state
      setIsDeleteModalOpen(false);
      setApplicationToDelete(null);
    }
  };

  const handleStatusChange = (id: string, status: 'pending' | 'approved' | 'rejected') => {
    updateLoanApplication(id, { status });
    loadApplications();
    loadStats();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  };

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Loan Applications</h1>
            <p className="text-gray-500 mt-1">Manage and review loan applications</p>
          </div>
          <Button 
            onClick={() => navigate('/dashboard/applications/new')}
            className="bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white rounded-md px-4 py-2 text-sm transition-all duration-200 ease-in-out hover:shadow-md flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>New Application</span>
          </Button>
        </div>

      {/* Stats cards */}
      <ApplicationStats stats={stats} />

      {/* Search and filter */}
      <ApplicationSearch 
        onSearch={setSearchQuery} 
        onFilter={setStatusFilter}
        currentFilter={statusFilter}
      />

      {/* Applications table */}
      <ApplicationsTable 
        applications={filteredApplications}
        onEdit={handleEditApplication}
        onDelete={handleDeleteApplication}
        onViewDetails={handleViewDetails}
        onStatusChange={handleStatusChange}
        currentPage={currentPage}
        totalPages={Math.ceil(applications.length / itemsPerPage)}
        onPageChange={handlePageChange}
      />
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDeleteModalOpen(false)}
          />
          
          <div className="flex items-center justify-center min-h-screen p-4">
            <motion.div 
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Application</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this application? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  onClick={confirmDeleteApplication}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
                <Button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="mt-3 sm:mt-0 sm:ml-3 w-full sm:w-auto bg-white text-gray-700 border border-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
      

    </motion.div>
    </DashboardLayout>
  );
};

export default Applications;
