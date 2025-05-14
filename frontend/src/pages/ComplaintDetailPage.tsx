import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Complaint, ComplaintImage } from "@/types/supabase";
import { Loader2 } from "lucide-react";

interface Comment {
  id: string;
  user: string;
  content: string;
  date: string;
}

interface ComplaintDetail extends Complaint {
  images?: ComplaintImage[];
  comments?: Comment[];
}

const ComplaintDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  useEffect(() => {
    const storedPhone = localStorage.getItem('phone_number');
    setPhoneNumber(storedPhone);
    
    const fetchComplaintDetails = async () => {
      if (!id) {
        setError("No complaint ID provided");
        setLoading(false);
        return;
      }

      try {
        const { data: complaintData, error: complaintError } = await supabase
          .from('complaints')
          .select('*')
          .eq('id', id)
          .single();

        if (complaintError) throw complaintError;

     
        const { data: imagesData, error: imagesError } = await supabase
          .from('complaint_images')
          .select('*')
          .eq('complaint_id', id);

        if (imagesError) console.error("Error fetching images:", imagesError);

        const { data: commentsData, error: commentsError } = await supabase
          .from('complaint_comments')
          .select('*')
          .eq('complaint_id', id)
          .order('created_at', { ascending: true });

        if (commentsError) console.error("Error fetching comments:", commentsError);

        const formattedComments = commentsData ? commentsData.map((comment: any) => ({
          id: comment.id,
          user: comment.user_name || 'Anonymous',
          content: comment.content,
          date: comment.created_at
        })) : [];

        setComplaint({
          ...complaintData as Complaint,
          images: imagesData || [],
          comments: formattedComments
        });
      } catch (err: any) {
        console.error("Error fetching complaint details:", err);
        setError(err.message || "Failed to fetch complaint details");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaintDetails();
  }, [id]);
  const handleSubmitComment = async () => {
    if (!comment.trim() || !id || !complaint) return;
    
    setSubmittingComment(true);
    
    try {
      const userName = localStorage.getItem('user_name') || 'Citizen';
      
      if (!phoneNumber) {
        throw new Error("No phone number found. Please log in again.");
      }
      
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', phoneNumber);
      
      if (userError) throw userError;
      
      if (!userData || userData.length === 0) {
        throw new Error("User profile not found");
      }
      
      const userId = userData[0].id;
      
      const { error } = await supabase
        .from('complaint_comments')
        .insert({
          complaint_id: id,
          user_id: userId,
          user_name: userName,
          content: comment,
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      setComplaint({
        ...complaint,
        comments: [
          ...(complaint.comments || []),
          {
            id: Date.now().toString(),
            user: userName,
            content: comment,
            date: new Date().toISOString()
          }
        ]
      });
      
      // Clear the comment field
      setComment("");
    } catch (err: any) {
      console.error("Error submitting comment:", err);
      alert("Failed to submit comment: " + err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-red-500">
            <p className="mb-4">{error || "Complaint not found"}</p>
            <Button variant="outline" onClick={() => navigate("/complaints")}>
              Back to Complaints
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 font-serif">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{complaint.description}</h1>
        <Button variant="outline" onClick={() => navigate("/complaints")}>
          Back to Complaints
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
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1">{complaint.title}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p className="mt-1">{complaint.location}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Dates</h3>
                <p className="mt-1">
                  Submitted: {new Date(complaint.created_at).toLocaleDateString()}<br />
                </p>
              </div>
              
              {complaint.images && complaint.images.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Images</h3>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {complaint.images.map(img => (
                      <img 
                        key={img.id} 
                        src={img.image_url} 
                        alt="Complaint" 
                        className="rounded-md object-cover h-40 w-full"
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Comments & Updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {complaint.comments && complaint.comments.length > 0 ? (
                complaint.comments.map(comment => (
                  <div key={comment.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex justify-between">
                      <p className="font-medium">{comment.user}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(comment.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="mt-1">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-2">No comments yet</p>
              )}
              
              <div className="mt-4">
                <textarea 
                  className="w-full p-2 border rounded-md" 
                  placeholder="Add a comment or question..."
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
                <Button 
                  className="mt-2" 
                  onClick={handleSubmitComment}
                  disabled={submittingComment || !comment.trim()}
                >
                  {submittingComment ? "Submitting..." : "Submit Comment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  complaint.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                  complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {complaint.status.toUpperCase()}
                </span>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Category</h3>
                <p className="mt-1 capitalize">{complaint.category}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Priority</h3>
                <p className="mt-1 capitalize">{complaint.priority}</p>
              </div>
              
              {complaint.status === 'resolved' && (
                <div className="mt-4">
                  <h3 className="font-medium">Provide Feedback</h3>
                  <div className="flex items-center mt-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button key={rating} className="text-gray-300 hover:text-yellow-400">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      </button>
                    ))}
                  </div>
                  <Button className="mt-4 w-full">Submit Feedback</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetailPage;
