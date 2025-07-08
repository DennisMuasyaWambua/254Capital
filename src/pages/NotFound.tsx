import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Layout from '@/components/Layout';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 text-[#15133F]">404</h1>
          <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
          <Link to="/" className="bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white px-6 py-3 rounded-md inline-block transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
