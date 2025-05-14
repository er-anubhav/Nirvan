
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { Complaint, ComplaintStatus, ComplaintPriority } from "@/types/supabase";

export function useComplaintActions() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const submitComplaint = async (
    complaintData: {
      title: string;
      description: string;
      category: string;
      location: string;
      latitude: number | null;
      longitude: number | null;
      citizen_id: string;
      status: ComplaintStatus;
      priority: ComplaintPriority;
      phone_number: string;
      assigned_to_id?: string | null;
      predicted_category?: string | null;
      predicted_priority?: ComplaintPriority | null;
      confidence_score?: number | null;
    },
    imageFiles?: File[]
  ): Promise<Complaint | null> => {
    setIsLoading(true);
    
    try {
      if (!complaintData.title || !complaintData.description || !complaintData.category || 
          !complaintData.location || !complaintData.citizen_id) {
        throw new Error("Missing required complaint fields");
      }
      
      const { data: complaintResponse, error: complaintError } = await supabase
        .from('complaints')
        .insert(complaintData)
        .select()
        .single();
      
      if (complaintError) throw complaintError;
      
      const complaint = complaintResponse as Complaint;
      
      if (imageFiles && imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileName = `${complaint.id}/${Date.now()}-${file.name}`;
          
          const { error: uploadError } = await supabase.storage
            .from('complaint_images')
            .upload(fileName, file);
          
          if (uploadError) throw uploadError;
          
          const { data: publicUrlData } = supabase.storage
            .from('complaint_images')
            .getPublicUrl(fileName);
          
          const { error: imageRecordError } = await supabase
            .from('complaint_images')
            .insert({
              complaint_id: complaint.id,
              image_url: publicUrlData.publicUrl,
            });
          
          if (imageRecordError) throw imageRecordError;
        }
      }
      
      await categorizeThroughAI(complaint);
      
      toast({
        title: "Success",
        description: "Your complaint has been submitted successfully.",
      });
      
      return complaint;
    } catch (error: any) {
      console.error("Error submitting complaint:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit complaint. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get a single complaint
  const getComplaint = async (id: string): Promise<Complaint | null> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data as Complaint;
    } catch (error: any) {
      console.error("Error fetching complaint:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch complaint details.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getComplaintImages = async (complaintId: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('complaint_images')
        .select('*')
        .eq('complaint_id', complaintId);
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error("Error fetching complaint images:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch complaint images.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const categorizeThroughAI = async (complaint: Complaint) => {
    try {
      const response = await supabase.functions.invoke('categorize-complaint', {
        body: {
          id: complaint.id,
          title: complaint.title,
          description: complaint.description
        }
      });
      
      if (response.error) throw response.error;
      
      return response.data;
    } catch (error) {
      console.error("Error calling AI categorization:", error);
      return null;
    }
  };

  const submitFeedback = async (
    complaintId: string, 
    rating: number, 
    comment?: string
  ) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          complaint_id: complaintId,
          rating,
          comment
        });
      
      if (error) throw error;
      
      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    submitComplaint,
    getComplaint,
    getComplaintImages,
    submitFeedback
  };
}
