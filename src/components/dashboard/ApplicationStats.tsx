import React from 'react';
import { Users, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

interface ApplicationStatsProps {
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalAmount: string;
    avgAmount: string;
  };
}

const ApplicationStats: React.FC<ApplicationStatsProps> = ({ stats }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div 
        className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all duration-300"
        variants={item}
        whileHover={{ y: -5 }}
      >
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Applications</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all duration-300"
        variants={item}
        whileHover={{ y: -5 }}
      >
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all duration-300"
        variants={item}
        whileHover={{ y: -5 }}
      >
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Approved</p>
            <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all duration-300"
        variants={item}
        whileHover={{ y: -5 }}
      >
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-[#48A7A7]/20 text-[#48A7A7] mr-4">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalAmount}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ApplicationStats;
