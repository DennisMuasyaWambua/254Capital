import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

interface ApplicationSearchProps {
  onSearch: (query: string) => void;
  onFilter: (status: 'all' | 'pending' | 'approved' | 'rejected') => void;
  currentFilter: 'all' | 'pending' | 'approved' | 'rejected';
}

const ApplicationSearch: React.FC<ApplicationSearchProps> = ({ 
  onSearch, 
  onFilter,
  currentFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <motion.form 
        className="flex-1 relative"
        onSubmit={handleSearch}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7] transition duration-150 ease-in-out sm:text-sm"
            placeholder="Search applications by ID, name, email or loan type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={clearSearch}
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </motion.form>

      <motion.div 
        className="flex space-x-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Button
          type="button"
          onClick={() => onFilter('all')}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            currentFilter === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          All
        </Button>
        <Button
          type="button"
          onClick={() => onFilter('pending')}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            currentFilter === 'pending'
              ? 'bg-yellow-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Pending
        </Button>
        <Button
          type="button"
          onClick={() => onFilter('approved')}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            currentFilter === 'approved'
              ? 'bg-green-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Approved
        </Button>
        <Button
          type="button"
          onClick={() => onFilter('rejected')}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            currentFilter === 'rejected'
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Rejected
        </Button>
      </motion.div>
    </div>
  );
};

export default ApplicationSearch;
