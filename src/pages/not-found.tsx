
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-purple-100 p-4">
      <div className="text-center max-w-md mx-auto bg-white/90 rounded-xl shadow-lg p-10">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
        <p className="text-xl text-gray-900 mb-6">
          Oops! We couldn't find the page you're looking for.
        </p>
        <p className="text-gray-600 mb-8">
          The page you requested doesn't exist or may have been moved.
        </p>
        <Link to="/">
          <Button className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-md">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
