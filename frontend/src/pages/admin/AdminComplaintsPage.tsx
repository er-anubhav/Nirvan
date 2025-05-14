import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2, Search, FilterX } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Complaint {
  id: string;
  title: string;
  description?: string;
  status: string;
  category: string;
  priority: string;
  created_at: string;
  updated_at: string;
  citizen_id: string;
  citizen?: {
    name: string;
    email: string;
  };
}

const AdminComplaintsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {    const fetchComplaints = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('complaints')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Supabase error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }
        
        const processedData = data?.map(complaint => ({
          ...complaint,
          status: complaint.status || 'pending',
          category: complaint.category || 'general',
          priority: complaint.priority || 'medium',
          citizen: {
            name: "Unknown",
            email: ""
          }
        })) || [];
        
        console.log('Processed complaint data:', processedData);
        
        setComplaints(processedData);
        setFilteredComplaints(processedData);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
    
    const subscription = supabase
      .channel('admin_complaints_changes')
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

  useEffect(() => {
    let results = complaints;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(complaint => 
        (complaint.title && complaint.title.toLowerCase().includes(term)) || 
        (complaint.description && complaint.description.toLowerCase().includes(term)) ||
        (complaint.citizen?.name && complaint.citizen.name.toLowerCase().includes(term))
      );
    }
    if (statusFilter && statusFilter !== 'all') {
      results = results.filter(complaint => complaint.status === statusFilter);
    }
    
  
    if (categoryFilter && categoryFilter !== 'all') {
      results = results.filter(complaint => complaint.category === categoryFilter);
    }
    
    setFilteredComplaints(results);
  }, [searchTerm, statusFilter, categoryFilter, complaints]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'In Progress';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  
  const getPriorityBadgeClasses = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const categories = [...new Set(complaints.map(c => c.category || 'uncategorized'))]
    .filter(category => category !== ''); 

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading complaints...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Complaints</h1>
        <Button onClick={() => navigate("/admin")}>
          Back to Dashboard
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search complaints..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {(searchTerm || statusFilter || categoryFilter) && (
          <div className="md:col-span-4 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              className="flex items-center"
            >
              <FilterX className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>
      
      {filteredComplaints.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComplaints.map(complaint => (              <TableRow key={complaint.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{complaint.description}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClasses(complaint.status)}`}>
                      {formatStatus(complaint.status)}
                    </span>
                  </TableCell><TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityBadgeClasses(complaint.priority)}`}>
                      {(complaint.priority || 'Medium').toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(complaint.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        console.log("Navigating to complaint:", complaint.id);
                        navigate(`/admin/complaints/${complaint.id}`);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10 border rounded-md">
          <h3 className="text-lg font-medium">No complaints found</h3>
          <p className="text-muted-foreground">
            {complaints.length > 0 
              ? "Try adjusting your filters to see more results" 
              : "No complaints have been submitted yet"}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminComplaintsPage;