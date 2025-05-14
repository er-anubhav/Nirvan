import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  location: string;
  created_at: string;
  phone_number: string;
}

const ComplaintsPage = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  useEffect(() => {
    const storedPhone = localStorage.getItem('phone_number');
    setPhoneNumber(storedPhone);
    
    const fetchComplaints = async () => {
      if (!storedPhone) {
        setError("No phone number found. Please log in again.");
        setLoading(false);
        return;
      }
  try {
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('phone', storedPhone);

  if (userError) throw userError;
  
  if (!userData || userData.length === 0) {
    setError("User profile not found");
    setLoading(false);
    return;
  }
  const userId = userData[0].id;
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('citizen_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  setComplaints(data as Complaint[]);
} catch (err: any) {
  console.error("Error fetching complaints:", err);
  setError(err.message || "Failed to fetch complaints");
} finally {
  setLoading(false);
}
    };

    fetchComplaints();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  return (
    <div className="space-y-6 font-serif">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Complaints</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-red-500">
              <p className="mb-4">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : complaints.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-lg text-gray-500 mb-4">You haven't submitted any complaints yet.</p>
            <Button onClick={() => navigate("/complaints/new")}>
              Submit Your First Complaint
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <Card key={complaint.id}>
              <CardHeader className="pb-2">
                <CardTitle>{complaint.description}</CardTitle>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Submitted on {formatDate(complaint.created_at)}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    complaint.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                    complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {complaint.status.toUpperCase()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-gray-600 line-clamp-2">{complaint.title}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {complaint.category}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {complaint.location}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/complaints/${complaint.id}`)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplaintsPage;
