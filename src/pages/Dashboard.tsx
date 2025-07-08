import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { 
  FileText, 
  DollarSign, 
  CreditCard, 
  Clock, 
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { fetchDashboardMetrics, fetchRecentActivities, DashboardMetrics, Activity } from "@/services/dashboardService";
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch metrics and activities separately to handle partial failures
        try {
          const metricsData = await fetchDashboardMetrics();
          setMetrics(metricsData);
        } catch (metricsErr) {
          console.error('Error fetching metrics:', metricsErr);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load dashboard metrics",
          });
        }
        
        try {
          const activitiesData = await fetchRecentActivities();
          setActivities(activitiesData);
        } catch (activitiesErr) {
          console.error('Error fetching activities:', activitiesErr);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load recent activities",
          });
        }
        
        // Only show error if both failed
        if (!metrics && activities.length === 0) {
          setError('Failed to load dashboard data. Please try again later.');
        } else {
          setError(null);
        }
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load dashboard data",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  // Define dashboard cards based on fetched metrics
  const dashboardCards = metrics ? [
    {
      title: 'Active Loans',
      value: metrics.activeLoans.toString(),
      icon: <CreditCard className="h-8 w-8 text-[#48A7A7]" />,
      description: 'Current active financing',
      link: '/dashboard/applications',
    },
    {
      title: 'Available Credit',
      value: `KES ${metrics.availableCredit.toLocaleString()}`,
      icon: <DollarSign className="h-8 w-8 text-[#48A7A7]" />,
      description: 'Remaining credit limit',
      link: '/dashboard/applications',
    },
    {
      title: 'Pending Applications',
      value: metrics.pendingApplications.toString(),
      icon: <Clock className="h-8 w-8 text-[#48A7A7]" />,
      description: 'Applications in progress',
      link: '/dashboard/applications',
    },
    {
      title: 'Documents',
      value: metrics.documents.toString(),
      icon: <FileText className="h-8 w-8 text-[#48A7A7]" />,
      description: 'Uploaded documents',
      link: '/dashboard/applications',
    },
  ] : [];



  return (
    <DashboardLayout>
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-[#48A7A7] animate-spin" />
              <span className="ml-2 text-gray-600">Loading dashboard data...</span>
            </div>
          )}
          
          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          {/* Dashboard Content */}
          {!loading && !error && (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {dashboardCards.map((card, index) => (
                  <div 
                    key={index}
                    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(card.link)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-500 text-sm">{card.title}</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
                        <p className="text-gray-500 text-sm mt-2">{card.description}</p>
                      </div>
                      <div className="bg-[#48A7A7]/10 p-3 rounded-full">
                        {card.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>  
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activity */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                  
                  {activities.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No recent activities found.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div key={activity.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">{activity.type}</h3>
                              <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
                              <p className="text-gray-400 text-xs mt-1">{activity.date}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              activity.status === 'approved' ? 'bg-green-100 text-green-800' : 
                              activity.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {activities.length > 0 && (
                    <div className="mt-4 text-center">
                      <Button 
                        className="text-[#48A7A7] hover:text-[#48A7A7]/80 bg-transparent hover:bg-[#48A7A7]/10 transition-colors duration-200"
                        onClick={() => navigate('/dashboard/applications')}
                      >
                        View All Activity
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                  
                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white rounded-md px-4 py-3 text-sm transition-all duration-200 ease-in-out hover:shadow-md flex items-center justify-center space-x-2"
                      onClick={() => navigate('/dashboard/applications/new')}
                    >
                      <DollarSign size={16} />
                      <span>Apply for Financing</span>
                    </Button>
                    
                    <Button 
                      className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-md px-4 py-3 text-sm transition-all duration-200 ease-in-out hover:shadow-sm flex items-center justify-center space-x-2"
                      onClick={() => navigate('/dashboard/applications')}
                    >
                      <FileText size={16} />
                      <span>Upload Documents</span>
                    </Button>
                    
                    <Button 
                      className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-md px-4 py-3 text-sm transition-all duration-200 ease-in-out hover:shadow-sm flex items-center justify-center space-x-2"
                      onClick={() => navigate('/dashboard/settings')}
                    >
                      <ArrowRight size={16} />
                      <span>Update Profile</span>
                    </Button>
                    
                    <Button 
                      className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-md px-4 py-3 text-sm transition-all duration-200 ease-in-out hover:shadow-sm flex items-center justify-center space-x-2"
                      onClick={() => navigate('/dashboard/settings')}
                    >
                      <ArrowRight size={16} />
                      <span>Account Settings</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
    </DashboardLayout>
  );
};

export default Dashboard;
