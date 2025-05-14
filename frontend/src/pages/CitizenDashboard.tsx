import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Complaint } from "@/types/supabase";

const CitizenDashboard = () => {  const navigate = useNavigate();
  const [userName, setUserName] = useState("Citizen");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    const storedPhone = localStorage.getItem('phone_number');
    
    if (storedName) setUserName(storedName);
    if (storedPhone) {
      console.log("Phone from localStorage:", storedPhone);
      setPhoneNumber(storedPhone);
    } else {
      console.error("No phone number found in localStorage");
      setLoading(false);
      return;
    }
    const fetchComplaints = async () => {
      if (!storedPhone) return;
        try {
        console.log("Searching for profile with phone:", storedPhone);
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('phone', storedPhone);

        if (userError) {
          console.error("Error fetching user profile:", userError);
          throw userError;
        }
        
        console.log("User data result:", userData);
        
        if (!userData || userData.length === 0) {
          console.error("No user profile found for phone number:", storedPhone);
          setLoading(false);
          return;
        }
        const userId = userData[0].id;
        console.log("Using citizen_id for complaints query:", userId);
        
        const { data, error } = await supabase
          .from('complaints')
          .select('*')
          .eq('citizen_id', userId)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error in complaints query:", error);
          throw error;
        }
        
        console.log("Complaints data:", data);
        setComplaints(data || []);} catch (error: any) {
        console.error("Error fetching complaints:", error);
        console.error("Error details:", error.message, error.details, error.hint);
        alert(`Error fetching complaints: ${error.message}${error.details ? `\nDetails: ${error.details}` : ''}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchComplaints();
  }, []);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Citizen Dashboard</h1>
      <p className="text-gray-600">
        Welcome back, {userName}. You can submit and track your complaints here.
      </p>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={async () => {
          try {
            alert(`Checking database with phone: ${phoneNumber}`);
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('phone', phoneNumber);
              
            if (error) {
              alert(`Error: ${error.message}`);
              return;
            }
            
            alert(`Found ${data?.length || 0} profiles: ${JSON.stringify(data)}`);
          } catch (e) {
            alert(`Error: ${e}`);
          }
        }}
      >
        Debug: Check Database
      </Button>
      
      {loading ? (
        <div className="text-center p-4">Loading your complaints...</div>
      ) : (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Recent Complaints ({complaints.length})</h2>
          {complaints.length > 0 ? (
            <div className="grid gap-4">              {complaints.slice(0, 3).map((complaint: any) => (
                <Card key={complaint.id}>
                  <CardHeader className="pb-2">
                    <CardTitle>{complaint.title || "Complaint #" + complaint.id}</CardTitle>
                    <CardDescription>Status: {complaint.status || "Pending"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">{complaint.description?.substring(0, 100)}...</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/complaints/${complaint.id}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {complaints.length > 3 && (
                <div className="text-center mt-2">
                  <Button variant="link" onClick={() => navigate("/complaints")}>
                    View all {complaints.length} complaints
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-gray-500">You have no complaints yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>My Complaints</CardTitle>
            <CardDescription>View all your submitted complaints</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/complaints")}>View Complaints</Button>
          </CardContent>
        </Card>
        
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Public Dashboard</CardTitle>
          <CardDescription>View anonymized public statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            The public dashboard shows anonymized statistics about complaints across the system. This helps promote transparency in governance.
          </p>
          <Button variant="outline" onClick={() => navigate("/public")}>
            View Public Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CitizenDashboard;
