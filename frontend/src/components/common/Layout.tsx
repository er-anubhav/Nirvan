import { UserRole } from "@/types/supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
}

const Layout = ({
  children,
  requireAuth = false,
  allowedRoles,
}: LayoutProps) => {
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  
  const isLoading = false;
  const profile = { full_name: localStorage.getItem('user_name') || 'User' };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
  }, [isMounted]);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-serif flex flex-col">
      <header className="bg-white border-b shadow-sm py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl cursor-pointer" onClick={() => navigate("/")}>
            Nirvana
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
      <footer className="bg-gray-100 py-4 text-center text-sm text-gray-600">
        <div className="container mx-auto">
          &copy; {new Date().getFullYear()} Nirvana - A Complaint Management System
        </div>
      </footer>
    </div>
  );
};

export default Layout;
