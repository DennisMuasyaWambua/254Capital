import React, { useState, useEffect, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Shield, 
  Bell, 
  Save,
  User,
  Loader2,
  AlertCircle,
  Check,
  Upload
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { fetchCompanyProfile, updateCompanyProfile, CompanyProfile } from "@/services/companyService";

const Settings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('company');
  
  // State for company profile data
  const [companyData, setCompanyData] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // Fetch company profile data
  useEffect(() => {
    const getCompanyProfile = async () => {
      try {
        setLoading(true);
        const data = await fetchCompanyProfile();
        setCompanyData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching company profile:', err);
        setError('Failed to load company profile data. Please try again later.');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load company profile data",
        });
        // Initialize with a minimal object to prevent null reference errors
        setCompanyData({
          id: 0,
          name: '',
          logo: '',
          description: '',
          mission: '',
          vision: '',
          address: '',
          phone: '',
          email: '',
          website: '',
          socialMedia: {}
        });
      } finally {
        setLoading(false);
      }
    };
    
    getCompanyProfile();
  }, [toast]);
  
  // Handle logo file upload
  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (companyData) {
      setCompanyData({
        ...companyData,
        [name]: value
      });
    }
  };
  
  // Handle form submission
  const handleSaveCompanyProfile = async () => {
    if (!companyData) return;
    
    try {
      setSaving(true);
      
      // Prepare data for submission
      const updatedData = {
        ...companyData,
        logo: logoPreview || companyData.logo
      };
      
      // Update company profile via API
      await updateCompanyProfile(updatedData);
      
      toast({
        title: "Success",
        description: "Company profile updated successfully",
      });
    } catch (err) {
      console.error('Error updating company profile:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update company profile. Please check your connection and try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'company', label: 'Company Profile', icon: <Building size={18} /> },
    { id: 'account', label: 'Account Settings', icon: <User size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> }
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and application settings</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-gray-50 p-4 border-r border-gray-200">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'bg-[#48A7A7]/10 text-[#48A7A7] border-l-4 border-[#48A7A7]'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-[#48A7A7] animate-spin" />
                <span className="ml-2 text-gray-600">Loading company profile data...</span>
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
            
            {activeTab === 'company' && !loading && !error && companyData && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Company Profile</h2>
                
                <div className="space-y-6">
                  {/* Company Logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Logo
                    </label>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md overflow-hidden">
                        <img 
                          src={logoPreview || companyData.logo} 
                          alt="Company logo" 
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="ml-5 relative">
                        <input
                          type="file"
                          id="logo-upload"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md px-4 py-2 text-sm flex items-center space-x-2">
                          <Upload size={16} />
                          <span>Change Logo</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Company Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={companyData.name}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                    />
                  </div>

                  {/* Company Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Company Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={companyData.description}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                    />
                  </div>

                  {/* Mission & Vision */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="mission" className="block text-sm font-medium text-gray-700 mb-1">
                        Mission
                      </label>
                      <textarea
                        id="mission"
                        name="mission"
                        rows={3}
                        value={companyData.mission}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="vision" className="block text-sm font-medium text-gray-700 mb-1">
                        Vision
                      </label>
                      <textarea
                        id="vision"
                        name="vision"
                        rows={3}
                        value={companyData.vision}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={companyData.address}
                          onChange={handleInputChange}
                          className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="phone"
                          name="phone"
                          value={companyData.phone}
                          onChange={handleInputChange}
                          className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={companyData.email}
                          onChange={handleInputChange}
                          className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Globe className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="website"
                          name="website"
                          value={companyData.website}
                          onChange={handleInputChange}
                          className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Social Media</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                          Facebook
                        </label>
                        <input
                          type="text"
                          id="facebook"
                          name="socialMedia.facebook"
                          value={companyData.socialMedia?.facebook || ''}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                          placeholder="https://facebook.com/yourcompany"
                        />
                      </div>
                      <div>
                        <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
                          Twitter
                        </label>
                        <input
                          type="text"
                          id="twitter"
                          name="socialMedia.twitter"
                          value={companyData.socialMedia?.twitter || ''}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                          placeholder="https://twitter.com/yourcompany"
                        />
                      </div>
                      <div>
                        <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                          LinkedIn
                        </label>
                        <input
                          type="text"
                          id="linkedin"
                          name="socialMedia.linkedin"
                          value={companyData.socialMedia?.linkedin || ''}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                          placeholder="https://linkedin.com/company/yourcompany"
                        />
                      </div>
                      <div>
                        <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                          Instagram
                        </label>
                        <input
                          type="text"
                          id="instagram"
                          name="socialMedia.instagram"
                          value={companyData.socialMedia?.instagram || ''}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                          placeholder="https://instagram.com/yourcompany"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-5">
                    <Button 
                      className="bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white rounded-md px-4 py-2 text-sm transition-all duration-200 ease-in-out hover:shadow-md flex items-center space-x-2"
                      onClick={handleSaveCompanyProfile}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>Save Changes</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h2>
                <p className="text-gray-500">Manage your account preferences and personal information.</p>
                
                {/* Placeholder content for account settings */}
                <div className="mt-6 space-y-6">
                  <div>
                    <label htmlFor="user-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="user-name"
                      defaultValue="Admin User"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="user-email"
                      defaultValue="admin@254capital.com"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                    />
                  </div>
                  <div className="pt-4">
                    <Button className="bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white rounded-md px-4 py-2 text-sm transition-all duration-200 ease-in-out hover:shadow-md flex items-center space-x-2">
                      <Save size={16} />
                      <span>Save Changes</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h2>
                <p className="text-gray-500">Manage how you receive notifications.</p>
                
                {/* Placeholder content for notification settings */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="email-notifications"
                        name="email-notifications"
                        type="checkbox"
                        defaultChecked
                        className="focus:ring-[#48A7A7] h-4 w-4 text-[#48A7A7] border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="email-notifications" className="font-medium text-gray-700">Email Notifications</label>
                      <p className="text-gray-500">Receive email notifications about loan applications and account updates.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="sms-notifications"
                        name="sms-notifications"
                        type="checkbox"
                        className="focus:ring-[#48A7A7] h-4 w-4 text-[#48A7A7] border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="sms-notifications" className="font-medium text-gray-700">SMS Notifications</label>
                      <p className="text-gray-500">Receive SMS alerts for important updates and approvals.</p>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button className="bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white rounded-md px-4 py-2 text-sm transition-all duration-200 ease-in-out hover:shadow-md flex items-center space-x-2">
                      <Save size={16} />
                      <span>Save Preferences</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h2>
                <p className="text-gray-500">Manage your account security and password.</p>
                
                {/* Placeholder content for security settings */}
                <div className="mt-6 space-y-6">
                  <div>
                    <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="current-password"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="new-password"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirm-password"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                    />
                  </div>
                  <div className="pt-4">
                    <Button className="bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white rounded-md px-4 py-2 text-sm transition-all duration-200 ease-in-out hover:shadow-md flex items-center space-x-2">
                      <Save size={16} />
                      <span>Update Password</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
