import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase"; 

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  created_at: string;
  updated_at: string;
}

interface DashboardStats {
  totalComplaints: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejectedComplaints: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalComplaints: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejectedComplaints: 0
  });
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        
        const { data: complaints, error } = await supabase
          .from('complaints')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const newStats = {
          totalComplaints: complaints.length,
          pending: complaints.filter(c => c.status === 'pending').length,
          inProgress: complaints.filter(c => c.status === 'in-progress').length,
          resolved: complaints.filter(c => c.status === 'resolved').length,
          rejectedComplaints: complaints.filter(c => c.status === 'rejected').length
        };
        
        const recentComplaints = complaints.slice(0, 5);
        
        setStats(newStats);
        setRecentComplaints(recentComplaints);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
    
    const subscription = supabase
      .channel('admin_dashboard_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'complaints' }, 
        () => {
          fetchComplaints();
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'In Progress';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-serif">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.totalComplaints}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">{stats.inProgress}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{stats.resolved}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Complaints</CardTitle>
            <CardDescription>Recently submitted complaints requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentComplaints.length > 0 ? (
                recentComplaints.map(complaint => (
                  <div key={complaint.id} className="p-4 border rounded-md">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{complaint.description}</h3>
                      <span className={`px-2 py-0.5 ${getStatusBadgeClasses(complaint.status)} rounded-full text-xs`}>
                        {formatStatus(complaint.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {complaint.title}
                    </p>
                    <div className="mt-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => navigate(`/admin/complaints/${complaint.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No complaints found</p>
              )}
            </div>
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate("/admin/complaints")}
              >
                View All Complaints
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>System performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Resolution Rate</span>
                  <span className="text-sm font-medium">
                    {stats.totalComplaints > 0 
                      ? Math.round((stats.resolved / stats.totalComplaints) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${stats.totalComplaints > 0 ? (stats.resolved / stats.totalComplaints) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Average Resolution Time</span>
                  <span className="text-sm font-medium">4.5 days</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "70%" }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Citizen Satisfaction</span>
                  <span className="text-sm font-medium">4.2/5.0</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: "84%" }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate("/admin/analytics")}
              >
                View Detailed Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;