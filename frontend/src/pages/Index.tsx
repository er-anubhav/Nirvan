
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Nirvana - A Complaint Management System</h1>
        <p className="text-xl text-gray-600">Loading application...</p>
        <div className="mt-6">
          <div className="w-12 h-12 border-4 border-governance-200 border-t-governance-400 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default Index;
