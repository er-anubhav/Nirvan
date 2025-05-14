import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { UserRole } from "@/types/supabase";
import { supabase } from "@/lib/supabase";

const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<UserRole>("citizen");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFetchUserData = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedPhone = phoneNumber.replace(/\D/g, '');
      
      localStorage.setItem('phone_number', formattedPhone);
      localStorage.setItem('user_role', role);
      localStorage.setItem('user_name', role.charAt(0).toUpperCase() + role.slice(1));
      
      if (role === "citizen") {
        navigate("/dashboard");
      } else if (role === "official" || role === "admin") {
        navigate("/admin");
      } else if (role === "super-admin") {
        navigate("/super-admin");
      }
    } catch (error) {
      console.error("Error processing login:", error);
      alert("Failed to process login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center font-serif justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="mt-2 text-gray-600">
            Welcome to Nirvana - CMS
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleFetchUserData}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <Input 
              type="tel" 
              value={phoneNumber} 
              onChange={(e) => setPhoneNumber(e.target.value)} 
              className="mt-1" 
              placeholder="+91 9876543210"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role (For User Identification)
            </label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="citizen">Citizen</option>
              <option value="official">Official</option>
              <option value="admin">Admin</option>
              <option value="super-admin">Super Admin</option>
            </select>
          </div>
          
          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full"
          >
            {loading ? "Processing..." : "Proceed to Dashboard"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
