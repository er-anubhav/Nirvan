import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  content: string;
  date: string;
  read: boolean;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {      try {
        const phoneNumber = localStorage.getItem('phone_number');
        
        if (!phoneNumber) {
          setError("No phone number found. Please log in again.");
          return;
        }
        
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('phone', phoneNumber);
          
        if (userError) throw userError;
        
        if (!userData || userData.length === 0) {
          setError("User profile not found");
          setLoading(false);
          return;
        }
        
        const userId = userData[0].id;
        
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const formattedNotifications = data.map(note => ({
            id: note.id,
            title: note.title,
            content: note.message,
            date: note.created_at,
            read: note.is_read
          }));
          
          setNotifications(formattedNotifications);
        } else {
          setNotifications([
            {
              id: "1",
              title: "Complaint Status Updated",
              content: "Your complaint about water leakage has been updated to 'In Progress'.",
              date: "2023-04-12",
              read: false
            },
            {
              id: "2",
              title: "Comment Added",
              content: "An official has commented on your complaint about street lights.",
              date: "2023-04-10",
              read: true
            },
            {
              id: "3",
              title: "Complaint Resolved",
              content: "Your complaint about garbage collection has been marked as resolved.",
              date: "2023-04-05",
              read: true
            }
          ]);
        }
      } catch (err: any) {
        console.error("Error fetching notifications:", err);
        setError(err.message || "Failed to fetch notifications");
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);
  
  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
        
      setNotifications(prev => 
        prev.map(note => 
          note.id === id ? { ...note, read: true } : note
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 font-serif">
      <h1 className="text-3xl font-bold">Notifications</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-center py-6 text-gray-500">
              You don't have any notifications yet.
            </p>
          ) : (
            <div className="space-y-4">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-4 border-l-4 ${notification.read ? 'border-gray-200' : 'border-blue-500 bg-blue-50'}`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex justify-between">
                    <h3 className={`font-medium ${!notification.read && 'text-blue-700'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {new Date(notification.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-600">{notification.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
