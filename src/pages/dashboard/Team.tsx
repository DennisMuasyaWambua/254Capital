import React, { useState, useEffect, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone, MapPin, Edit, Trash2, X, Check, AlertCircle, Upload, Image, Loader2 } from 'lucide-react';
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { fetchTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember, TeamMember } from '@/services/teamService';

// TeamMember interface is now imported from teamService

const Team = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingMember, setAddingMember] = useState(false);
  const [updatingMember, setUpdatingMember] = useState(false);
  const [deletingMember, setDeletingMember] = useState(false);
  
  // Fetch team members from the API
  useEffect(() => {
    const getTeamMembers = async () => {
      try {
        setLoading(true);
        const data = await fetchTeamMembers();
        setTeamMembers(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching team members:', err);
        setError('Failed to load team members. Please try again later.');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load team members",
        });
        // Initialize with empty array instead of failing completely
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };
    
    getTeamMembers();
  }, [toast]);

  // State for managing modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    name: '',
    position: '',
    email: '',
    phone: '',
    location: 'Nairobi, Kenya',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    department: ''
  });
  
  // Filter team members by department
  const filteredMembers = selectedDepartment === 'All Departments' 
    ? teamMembers 
    : teamMembers.filter(member => member.department === selectedDepartment);

  // Group team members by department
  const departments = ['All Departments', ...new Set(teamMembers.map(member => member.department))];
  
  // Handle file upload and convert to base64
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }

    // Check file type
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      
      if (isEdit && currentMember) {
        setCurrentMember({
          ...currentMember,
          image: base64String
        });
        setEditImagePreview(base64String);
      } else {
        setNewMember({
          ...newMember,
          image: base64String
        });
        setImagePreview(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle adding a new team member
  const handleAddMember = async () => {
    if (!newMember.name || !newMember.position || !newMember.email) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields",
      });
      return;
    }
    try {
      setAddingMember(true);
      
      // Prepare data for submission
      const memberData = {
        name: newMember.name || '',
        position: newMember.position || '',
        email: newMember.email || '',
        phone: newMember.phone || '',
        location: newMember.location || '',
        image: imagePreview || newMember.image || 'https://randomuser.me/api/portraits/lego/1.jpg',
        department: newMember.department || 'General'
      };
      
      // Add team member via our local database
      const addedMember = await addTeamMember(memberData);
      
      // Update local state
      setTeamMembers(prev => [...prev, addedMember]);
      
      toast({
        title: "Success",
        description: "Team member added successfully",
      });
    } catch (err) {
      console.error('Error adding team member:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add team member",
      });

    } finally {
      setAddingMember(false);
    }
  };

  // Handle editing a team member
  const handleEditMember = async () => {
    if (!currentMember) return;
    
    try {
      setUpdatingMember(true);
      
      // Prepare data for submission
      const updatedMember = {
        ...currentMember,
        image: editImagePreview || currentMember.image
      };
      
      // Update team member via our local database
      const result = await updateTeamMember(currentMember.id, updatedMember);
      
      // Update local state
      const updatedMembers = teamMembers.map(member => 
        member.id === currentMember.id ? result : member
      );
      setTeamMembers(updatedMembers);
      
      toast({
        title: "Success",
        description: "Team member updated successfully",
      });
    } catch (err) {
      console.error('Error updating team member:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update team member",
      });

    } finally {
      setUpdatingMember(false);
    }
  };

  // Handle deleting a team member
  const handleDeleteMember = async () => {
    try {
      setDeletingMember(true);
      
      if (!currentMember) return;
      
      // Delete team member via our local database
      await deleteTeamMember(currentMember.id);
      
      // Update local state
      const updatedMembers = teamMembers.filter(member => member.id !== currentMember.id);
      setTeamMembers(updatedMembers);
      
      toast({
        title: "Success",
        description: "Team member deleted successfully",
      });
    } catch (err) {
      console.error('Error deleting team member:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete team member",
      });
    } finally {
      setDeletingMember(false);
      setIsDeleteModalOpen(false);
    }
  };

  // Open edit modal with member data
  const openEditModal = (member: TeamMember) => {
    setCurrentMember(member);
    setEditImagePreview(member.image);
    setIsEditModalOpen(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (member: TeamMember) => {
    setCurrentMember(member);
    setIsDeleteModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-500 mt-1">Manage your organization's team</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white rounded-md px-4 py-2 text-sm transition-all duration-200 ease-in-out hover:shadow-md flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Team Member</span>
        </Button>
      </div>

      {/* Department tabs */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {departments.map(department => (
            <Button 
              key={department}
              onClick={() => setSelectedDepartment(department)}
              className={`${selectedDepartment === department 
                ? 'bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'} 
                rounded-md px-4 py-2 text-sm transition-all duration-200 ease-in-out whitespace-nowrap`}
            >
              {department}
            </Button>
          ))}
        </div>
      </div>

      {/* Team members grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMembers.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle size={48} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No team members found</h3>
            <p className="text-gray-500 mb-4">There are no team members in this department yet.</p>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white rounded-md px-4 py-2 text-sm transition-all duration-200 ease-in-out"
            >
              <Plus size={16} className="mr-2" />
              Add Team Member
            </Button>
          </div>
        ) : (
          filteredMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="relative">
              <img 
                src={member.image} 
                alt={member.name} 
                className="w-full h-48 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#15133F] to-transparent p-4">
                <h3 className="text-white font-bold">{member.name}</h3>
                <p className="text-white/80 text-sm">{member.position}</p>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Mail size={16} className="mr-2 text-[#48A7A7]" />
                <a href={`mailto:${member.email}`} className="hover:text-[#48A7A7]">
                  {member.email}
                </a>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone size={16} className="mr-2 text-[#48A7A7]" />
                <a href={`tel:${member.phone.replace(/\s+/g, '')}`} className="hover:text-[#48A7A7]">
                  {member.phone}
                </a>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin size={16} className="mr-2 text-[#48A7A7]" />
                <span>{member.location}</span>
              </div>
              <div className="pt-2 flex space-x-2">
                <Button 
                  onClick={() => openEditModal(member)}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md px-2 py-2 text-sm transition-all duration-200 ease-in-out flex items-center justify-center"
                >
                  <Edit size={14} className="mr-1" />
                  Edit
                </Button>
                <Button 
                  onClick={() => openDeleteModal(member)}
                  className="flex-1 bg-white border border-gray-300 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-md px-2 py-2 text-sm transition-all duration-200 ease-in-out flex items-center justify-center"
                >
                  <Trash2 size={14} className="mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))
        )}
      </div>

      {/* Add Team Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsAddModalOpen(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add Team Member</h3>
                  <button
                    onClick={() => {
                      setNewMember({
                        name: '',
                        position: '',
                        email: '',
                        phone: '',
                        location: 'Nairobi, Kenya',
                        image: 'https://randomuser.me/api/portraits/men/32.jpg',
                        department: ''
                      });
                      setImagePreview(null);
                      setIsAddModalOpen(false);
                    }}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {/* Image Upload Section */}
                <div className="mb-6 flex flex-col items-center justify-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center bg-gray-100">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Image className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <label htmlFor="image-upload" className="mt-2 cursor-pointer bg-white hover:bg-gray-100 text-[#15133F] rounded-md px-4 py-2 text-sm font-medium border border-gray-300 inline-flex items-center">
                    <Upload size={16} className="mr-2" />
                    Upload Photo
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e)}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Max size: 2MB</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={newMember.name || ''}
                      onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                      Position *
                    </label>
                    <input
                      type="text"
                      id="position"
                      value={newMember.position || ''}
                      onChange={(e) => setNewMember({...newMember, position: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                      Department *
                    </label>
                    <select
                      id="department"
                      value={newMember.department || ''}
                      onChange={(e) => setNewMember({...newMember, department: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                      required
                    >
                      <option value="">Select Department</option>
                      {Array.from(new Set(teamMembers.map(m => m.department))).map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                      <option value="Executive">Executive</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                      <option value="Marketing">Marketing</option>
                      <option value="IT">IT</option>
                      <option value="Legal">Legal</option>
                      <option value="Customer Service">Customer Service</option>
                      <option value="Risk Management">Risk Management</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={newMember.email || ''}
                      onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={newMember.phone || ''}
                      onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                    />
                  </div>

                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  onClick={handleAddMember}
                  className="w-full sm:w-auto bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white rounded-md px-4 py-2 text-sm transition-all duration-200 ease-in-out hover:shadow-md flex items-center justify-center sm:ml-3"
                >
                  <Check size={16} className="mr-2" />
                  Add Member
                </Button>
                <Button
                  onClick={() => setIsAddModalOpen(false)}
                  className="mt-3 sm:mt-0 w-full sm:w-auto bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md px-4 py-2 text-sm transition-all duration-200 ease-in-out hover:shadow-sm flex items-center justify-center"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Team Member Modal */}
      {isEditModalOpen && currentMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsEditModalOpen(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Edit Team Member</h3>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {/* Image Upload Section */}
                <div className="mb-6 flex flex-col items-center justify-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center bg-gray-100">
                    {editImagePreview ? (
                      <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Image className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <label htmlFor="edit-image-upload" className="mt-2 cursor-pointer bg-white hover:bg-gray-100 text-[#15133F] rounded-md px-4 py-2 text-sm font-medium border border-gray-300 inline-flex items-center">
                    <Upload size={16} className="mr-2" />
                    Change Photo
                    <input
                      id="edit-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, true)}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Max size: 2MB</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      value={currentMember.name}
                      onChange={(e) => setCurrentMember({...currentMember, name: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-position" className="block text-sm font-medium text-gray-700 mb-1">
                      Position *
                    </label>
                    <input
                      type="text"
                      id="edit-position"
                      value={currentMember.position}
                      onChange={(e) => setCurrentMember({...currentMember, position: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-department" className="block text-sm font-medium text-gray-700 mb-1">
                      Department *
                    </label>
                    <select
                      id="edit-department"
                      value={currentMember.department}
                      onChange={(e) => setCurrentMember({...currentMember, department: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                      required
                    >
                      <option value="">Select Department</option>
                      {Array.from(new Set(teamMembers.map(m => m.department))).map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                      <option value="Executive">Executive</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                      <option value="Marketing">Marketing</option>
                      <option value="IT">IT</option>
                      <option value="Legal">Legal</option>
                      <option value="Customer Service">Customer Service</option>
                      <option value="Risk Management">Risk Management</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="edit-email"
                      value={currentMember.email}
                      onChange={(e) => setCurrentMember({...currentMember, email: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="edit-phone"
                      value={currentMember.phone}
                      onChange={(e) => setCurrentMember({...currentMember, phone: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  onClick={handleEditMember}
                  className="w-full sm:w-auto bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white rounded-md px-4 py-2 text-sm transition-all duration-200 ease-in-out hover:shadow-md flex items-center justify-center sm:ml-3"
                >
                  <Check size={16} className="mr-2" />
                  Save Changes
                </Button>
                <Button
                  onClick={() => setIsEditModalOpen(false)}
                  className="mt-3 sm:mt-0 w-full sm:w-auto bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md px-4 py-2 text-sm transition-all duration-200 ease-in-out hover:shadow-sm flex items-center justify-center"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && currentMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsDeleteModalOpen(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Team Member</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete {currentMember.name}? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  onClick={() => handleDeleteMember()}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 text-sm transition-all duration-200 ease-in-out hover:shadow-md flex items-center justify-center sm:ml-3"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
                <Button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="mt-3 sm:mt-0 w-full sm:w-auto bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md px-4 py-2 text-sm transition-all duration-200 ease-in-out hover:shadow-sm flex items-center justify-center"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Team;
