import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const logSupabaseError = (context: string, error: any) => {
  console.error(`${context} error:`, error);
  console.error('Error details:', JSON.stringify(error, null, 2));
  
  if (error?.message) console.error('Error message:', error.message);
  if (error?.code) console.error('Error code:', error.code);
  if (error?.details) console.error('Error details:', error.details);
  if (error?.hint) console.error('Error hint:', error.hint);
};

interface Complaint {
  id: string;
  title: string;
  status: string;
  category: string;
  priority: string;
  location: string;
  description: string;
  citizen_id: string;
  created_at: string;
  updated_at: string;
  assigned_to_id?: string;
  citizen?: {
    name: string;
    email: string;
  };
}

interface Comment {
  id: string;
  user_type: 'citizen' | 'official' | 'system';
  content: string;
  created_at: string;
  complaint_id: string;
  user_id: string;
  user?: {
    name: string;
  };
}

const AdminComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [officials, setOfficials] = useState<{id: string, name: string, department: string}[]>([]);
  const [selectedOfficial, setSelectedOfficial] = useState(""); 
  useEffect(() => {
    const fetchComplaintDetails = async () => {
      try {
        setLoading(true);
        
        console.log("Fetching complaint with ID:", id);
        
        const { data: basicComplaintData, error: basicError } = await supabase
          .from('complaints')
          .select('*')
          .eq('id', id)
          .single();
        
        if (basicError) {
          console.error('Basic complaint fetch error:', basicError);
          throw basicError;
        }
        
        console.log("Fetched basic complaint data:", basicComplaintData);
        
        setComplaint(basicComplaintData);
        
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select('*')
          .eq('complaint_id', id)
          .order('created_at', { ascending: true });
        
        if (commentsError) {
          console.error('Comments fetch error:', commentsError);
        } else {
          setComments(commentsData || []);
        }
        
        const { data: officialsData, error: officialsError } = await supabase
          .from('profiles')
          .select('id, name, department')
          .eq('role', 'official');
        
        if (officialsError) {
          console.error('Officials fetch error:', officialsError);
        } else {
          setOfficials(officialsData || []);
        }
       
        if (basicComplaintData?.assigned_to_id) {
          setSelectedOfficial(basicComplaintData.assigned_to_id);
        }
        
      } catch (error) {
        console.error('Error fetching complaint details:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load complaint details."
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchComplaintDetails();
    }
   
    const commentsSubscription = supabase
      .channel('complaint_comments')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'comments', filter: `complaint_id=eq.${id}` }, 
        (payload) => {
          console.log("Real-time comment event detected:", payload);
   
          if (payload.eventType === 'INSERT') {
         
            (async () => {
              const { data } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', payload.new.user_id)
                .single();
                
              console.log("Fetched user data for comment:", data);
                
              const newComment: Comment = {
                ...payload.new,
                user: data,
                id: payload.new.id,
                user_type: payload.new.user_type,
                content: payload.new.content,
                created_at: payload.new.created_at,
                complaint_id: payload.new.complaint_id,
                user_id: payload.new.user_id
              };
                
              console.log("Adding new comment to UI:", newComment);
              setComments(prev => [...prev, newComment]);
            })();
          }
        }
      )
      .subscribe();
      const handleStatusChangeFixed = async (status: string) => {
        if (!complaint) return;
        
        try {
          setStatusLoading(true);
          
          console.log("Updating complaint status:", {
            complaintId: complaint.id,
            currentStatus: complaint.status,
            newStatus: status
          });
          
          if (complaint.status === status) {
            console.log("Status is already set to", status);
            toast({
              title: "No Change Needed",
              description: `Complaint status is already ${formatStatus(status)}`
            });
            setStatusLoading(false);
            return;
          }
          
          console.log("Sending update to Supabase for complaint ID:", complaint.id);
          
          const { data, error } = await supabase
            .from('complaints')
            .update({ status })
            .eq('id', complaint.id)
            .select();
          
          if (error) {
            console.error('Status update error:', error);
            console.error('Error details:', {
              message: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint
            });
            throw error;
          }
          
          console.log("Status updated successfully:", data);
          
          if (data && data.length > 0) {
            setComplaint(prev => ({...prev, ...data[0]}));
          } else {
            setComplaint(prev => prev ? {...prev, status: status, updated_at: new Date().toISOString()} : null);
          }
          
          toast({
            title: "Status Updated",
            description: `Complaint status changed to ${formatStatus(status)}`
          });
          
       
          await addSystemComment(`Status updated to: ${formatStatus(status)}`);
          
        } catch (error) {
          console.error('Error updating status:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update complaint status."
          });
        } finally {
          setStatusLoading(false);
        }
      };
      
    const complaintSubscription = supabase
      .channel('complaint_updates')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'complaints', filter: `id=eq.${id}` },
        (payload) => {
          console.log("Real-time complaint update detected:", payload);
   
          setComplaint(payload.new as Complaint);
        }
      )
      .subscribe();
      
    return () => {
      commentsSubscription.unsubscribe();
      complaintSubscription.unsubscribe();
    };
  }, [id]); 
  const handleStatusChange = async (status: string) => {
    if (!complaint) return;
    
    try {
      setStatusLoading(true);
      
      console.log("Updating complaint status:", {
        complaintId: complaint.id,
        currentStatus: complaint.status,
        newStatus: status
      });
      
      if (complaint.status === status) {
        console.log("Status is already set to", status);
        toast({
          title: "No Change Needed",
          description: `Complaint status is already ${formatStatus(status)}`
        });
        setStatusLoading(false);
        return;
      }
      
      console.log("Sending update to Supabase for complaint ID:", complaint.id);
      
      const { data, error } = await supabase
        .from('complaints')
        .update({ status })
        .eq('id', complaint.id)
        .select();
      
      if (error) {
        console.error('Status update error:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      console.log("Status updated successfully:", data);
      
      if (data && data.length > 0) {
        setComplaint(prev => ({...prev, ...data[0]}));
      } else {
        setComplaint(prev => prev ? {...prev, status: status, updated_at: new Date().toISOString()} : null);
      }
      
      toast({
        title: "Status Updated",
        description: `Complaint status changed to ${formatStatus(status)}`
      });
      
      await addSystemComment(`Status updated to: ${formatStatus(status)}`);
      
      if (complaint.citizen_id) {
        try {
          console.log("Sending status update notification for citizen_id:", complaint.citizen_id);
          
          const response = await fetch('http://localhost:5000/notify-status-update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              citizen_id: complaint.citizen_id,
              complaint_id: complaint.id,
              description: complaint.description,
              status: status
            }),
          });
          
          const result = await response.json();
          console.log("Notification response:", result);
          
          if (result.success) {
            console.log("Status update notification sent successfully");
          } else {
            console.error("Failed to send status update notification:", result.error);
          }
        } catch (notificationError) {
          console.error("Error sending status update notification:", notificationError);
        }
      } else {
        console.warn("No citizen_id found for complaint, can't send notification");
      }
      
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update complaint status."
      });
    } finally {
      setStatusLoading(false);
    }
  };
  const handleAddComment = async () => {
    if (!newComment.trim() || !complaint) return;
    
    try {
      const currentUserId = "admin-user-id"; 
      
      console.log("Adding official comment:", {
        complaintId: complaint.id,
        content: newComment,
        userId: currentUserId
      });
      
      const { data, error } = await supabase
        .from('comments')
        .insert({
          complaint_id: complaint.id,
          user_id: currentUserId,
          user_type: 'official',
          content: newComment,
          created_at: new Date().toISOString()
        })
        .select();
      
      if (error) {
        console.error('Comment error:', error);
        throw error;
      }
      
      console.log("Official comment added successfully:", data);
      
      if (data && data.length > 0) {
        const newCommentObj: Comment = {
          ...data[0],
          user: { name: "Official" }
        };
        setComments(prev => [...prev, newCommentObj]);
      }
      
      setNewComment("");
      
      toast({
        title: "Comment Added",
        description: "Your comment has been added to the complaint."
      });
      
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add comment."
      });
    }
  };
  const addSystemComment = async (content: string) => {
    if (!complaint) return;
    
    try {
      const systemUserId = "system-user-id";
      
      console.log("Adding system comment:", {
        complaintId: complaint.id,
        content: content,
        userId: systemUserId
      });
      
      const { data, error } = await supabase
        .from('comments')
        .insert({
          complaint_id: complaint.id,
          user_id: systemUserId,
          user_type: 'system',
          content: content,
          created_at: new Date().toISOString()
        })
        .select();
      
      if (error) {
        console.error('System comment error:', error);
        throw error;
      }
      
      console.log("System comment added successfully:", data);
      
      if (data && data.length > 0) {
        const newComment: Comment = {
          ...data[0],
          user: { name: "System" }
        };
        setComments(prev => [...prev, newComment]);
      }
      
    } catch (error) {
      console.error('Error adding system comment:', error);
    }
  };
  const handleAssign = async () => {
    if (!complaint || !selectedOfficial) return;
    
    try {
      console.log("Assigning complaint:", {
        complaintId: complaint.id,
        officialId: selectedOfficial
      });
      
      const { error } = await supabase
        .from('complaints')
        .update({ 
          assigned_to_id: selectedOfficial,
          updated_at: new Date().toISOString()
        })
        .eq('id', complaint.id);
      
      if (error) {
        console.error('Assignment error:', error);
        throw error;
      }
      
      console.log("Assignment successful");
      
      setComplaint(prev => prev ? {...prev, assigned_to_id: selectedOfficial, updated_at: new Date().toISOString()} : null);
      
      const official = officials.find(o => o.id === selectedOfficial);
      
      toast({
        title: "Official Assigned",
        description: `Complaint assigned to ${official?.name || 'selected official'}`
      });
      
      await addSystemComment(`Complaint assigned to ${official?.name || 'official'}`);
      
    } catch (error) {
      console.error('Error assigning official:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to assign official."
      });
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
        <span className="ml-2">Loading complaint details...</span>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Complaint Not Found</h2>
        <p className="mt-2">The complaint you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button className="mt-4" onClick={() => navigate("/admin/complaints")}>
          Back to All Complaints
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{complaint.description}</h1>
        <Button variant="outline" onClick={() => navigate("/admin/complaints")}>
          Back to All Complaints
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Complaint Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Title</h3>
                <p className="mt-1">{complaint.description}</p>
              </div>
                <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="mt-1">{complaint.location || 'No location provided'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Priority</h3>
                  <p className="mt-1 capitalize">{complaint.priority || 'Medium'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Submitted By</h3>
                  <p className="mt-1">Citizen ID: {complaint.citizen_id || 'Unknown'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Dates</h3>
                  <p className="mt-1">
                    Submitted: {new Date(complaint.created_at).toLocaleDateString()}<br />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Comments & Communication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.length > 0 ? (
                comments.map(comment => (
                  <div 
                    key={comment.id} 
                    className={`border-l-4 ${
                      comment.user_type === 'citizen' ? 'border-blue-500' : 
                      comment.user_type === 'system' ? 'border-gray-500' : 'border-green-500'
                    } pl-4 py-2`}
                  >
                    <div className="flex justify-between">
                      <p className="font-medium">
                        {comment.user_type === 'system' ? 'System' : 
                         comment.user?.name || (comment.user_type === 'citizen' ? 'Citizen' : 'Official')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="mt-1">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No comments yet</p>
              )}
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Add Comment</h3>
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add an official response or update..."
                  rows={3}
                />
                <Button className="mt-2" onClick={handleAddComment}>
                  Post Comment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Status Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Current Status</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                  complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  complaint.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                  complaint.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {formatStatus(complaint.status).toUpperCase()}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Update Status</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={complaint.status === 'pending' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('pending')}
                    size="sm"
                    disabled={statusLoading}
                  >
                    {statusLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                    Pending
                  </Button>
                  <Button 
                    variant={complaint.status === 'in-progress' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('in-progress')}
                    size="sm"
                    disabled={statusLoading}
                  >
                    {statusLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                    In Progress
                  </Button>
                  <Button 
                    variant={complaint.status === 'resolved' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('resolved')}
                    size="sm"
                    disabled={statusLoading}
                  >
                    {statusLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                    Resolved
                  </Button>
                  <Button 
                    variant={complaint.status === 'rejected' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('rejected')}
                    size="sm"
                    disabled={statusLoading}
                  >
                    {statusLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                    Reject
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Priority</h3>                <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                  complaint.priority === 'high' ? 'bg-red-100 text-red-800' :
                  complaint.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                  complaint.priority === 'low' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {(complaint.priority || 'Medium').toUpperCase()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminComplaintDetail;