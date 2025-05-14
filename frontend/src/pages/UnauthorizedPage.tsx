
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";


const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please contact an administrator if you believe this is an error.
        </p>
        
        <div className="space-y-3">
          <Button onClick={() => navigate("/")} className="w-full">
            Go to Home
          </Button>
          <Button onClick={() => navigate(-1)} variant="outline" className="w-full">
            Go Back
          </Button>
          <Button onClick={handleLogout} variant="ghost" className="w-full">
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
