import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import LeafletMap from "@/components/map/LeafletMap";

interface DashboardStats {
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  rejectedComplaints: number;
  categories: Record<string, number>;
}

interface ComplaintsByMonth {
  month: string;
  total: number;
  resolved: number;
}

export interface ComplaintLocation {
  id: string;
  latitude: number;
  longitude: number;
  status: string;
  category: string;
}

const PublicDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeData, setTimeData] = useState<ComplaintsByMonth[]>([]);
  const [locationData, setLocationData] = useState<ComplaintLocation[]>([]);
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: statusCounts, error: statusError } = await supabase
          .from('complaints')
          .select('status', { count: 'exact' })
          .order('status');
        
        if (statusError) throw statusError;
        
        const { data: categoryCounts, error: categoryError } = await supabase
          .from('complaints')
          .select('category', { count: 'exact' });
        
        if (categoryError) throw categoryError;
        
        const categoryMap: Record<string, number> = {};
        categoryCounts.forEach((item: any) => {
          const category = item.category;
          categoryMap[category] = (categoryMap[category] || 0) + 1;
        });
        
        const pendingCount = statusCounts.filter((c: any) => c.status === 'pending').length;
        const inProgressCount = statusCounts.filter((c: any) => c.status === 'in-progress').length;
        const resolvedCount = statusCounts.filter((c: any) => c.status === 'resolved').length;
        const rejectedCount = statusCounts.filter((c: any) => c.status === 'rejected').length;
        
        setStats({
          totalComplaints: statusCounts.length,
          resolvedComplaints: resolvedCount,
          pendingComplaints: pendingCount,
          inProgressComplaints: inProgressCount,
          rejectedComplaints: rejectedCount,
          categories: categoryMap,
        });

        const now = new Date();
        const monthsData: ComplaintsByMonth[] = [];
        
        for (let i = 5; i >= 0; i--) {
          const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthName = month.toLocaleString('default', { month: 'short' });
          const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).toISOString();
          const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString();
          
          const { data: monthlyData, error: monthlyError } = await supabase
            .from('complaints')
            .select('status')
            .gte('created_at', startOfMonth)
            .lt('created_at', endOfMonth);
            
          if (monthlyError) throw monthlyError;
          
          const totalMonthly = monthlyData.length;
          const resolvedMonthly = monthlyData.filter(c => c.status === 'resolved').length;
          
          monthsData.push({
            month: monthName,
            total: totalMonthly,
            resolved: resolvedMonthly,
          });
        }
        
        setTimeData(monthsData);
        
        const { data: locationData, error: locationError } = await supabase
          .from('complaints')
          .select('id, location, status, category');
        
        if (locationError) throw locationError;
        
        const processedLocationData: ComplaintLocation[] = locationData
          .filter(item => item.location) 
          .map(item => {            
            let latitude, longitude;
            
            if (typeof item.location === 'string') {
              const [lat, lng] = item.location.split(',').map(coord => parseFloat(coord.trim()));
              latitude = lat;
              longitude = lng;
            } else if (typeof item.location === 'object' && item.location !== null) {
              const locationObj = item.location as any;
              latitude = locationObj.latitude || locationObj.lat;
              longitude = locationObj.longitude || locationObj.lng;
            }
            
            return {
              id: item.id,
              latitude,
              longitude,
              status: item.status,
              category: item.category
            };
          })
          .filter(item => !isNaN(item.latitude) && !isNaN(item.longitude)); 
        
        setLocationData(processedLocationData);
        
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    const subscription = supabase
      .channel('public_dashboard_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'complaints' }, 
        () => {
        
          fetchDashboardData();
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-2">
          {error || "Failed to load dashboard data"}
        </p>
        <button 
          className="text-blue-500 underline" 
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Public Complaint Dashboard</h1>
        <p className="text-gray-600 mb-8">
          This dashboard provides transparent information about citizen complaints and government responses.
          All data is anonymized to protect privacy.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Complaints</CardTitle>
            <CardDescription>All registered complaints</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.totalComplaints}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Resolved</CardTitle>
            <CardDescription>Successfully addressed</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{stats.resolvedComplaints}</p>
            <p className="text-sm text-gray-500">
              {stats.totalComplaints ? Math.round((stats.resolvedComplaints / stats.totalComplaints) * 100) : 0}% resolution rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>In Progress</CardTitle>
            <CardDescription>Being handled by officials</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">{stats.inProgressComplaints}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Pending</CardTitle>
            <CardDescription>Awaiting processing</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-amber-600">{stats.pendingComplaints}</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Monthly Complaints Trend</CardTitle>
          <CardDescription>Complaints filed and resolved over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={timeData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total Complaints" fill="#8884d8" />
                <Bar dataKey="resolved" name="Resolved" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Complaint Categories</CardTitle>
          <CardDescription>Distribution by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.categories).map(([category, count]) => (
              <div key={category}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium capitalize">{category}</span>
                  <span className="text-sm text-gray-500">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${(count / stats.totalComplaints) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>      <Card>
        <CardHeader>
          <CardTitle>Complaint Locations</CardTitle>
          <CardDescription>Geographical distribution of complaints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <LeafletMap locations={locationData} height="100%" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicDashboard;
