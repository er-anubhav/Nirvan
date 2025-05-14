
import { supabase } from "./client";
import { Complaint, ComplaintStatus, ComplaintPriority } from "@/types/supabase";

/**
 * Create a new complaint
 */
export const createComplaint = async (complaintData: {
  title: string;
  description: string;
  category: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  citizen_id: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  assigned_to_id: string | null;
  predicted_category: string | null;
  predicted_priority: ComplaintPriority | null;
  confidence_score: number | null;
}) => {
  try {
    const { data, error } = await supabase
      .from("complaints")
      .insert(complaintData)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error creating complaint:", error);
    return { data: null, error };
  }
};

export const uploadComplaintImage = async (
  complaintId: string,
  image: File
) => {
  try {
    const fileName = `${complaintId}/${Date.now()}-${image.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('complaint_images')
      .upload(fileName, image);
    
    if (uploadError) throw uploadError;
    
    const { data: publicUrlData } = supabase.storage
      .from('complaint_images')
      .getPublicUrl(fileName);
    
    const { error: imageRecordError } = await supabase
      .from('complaint_images')
      .insert({
        complaint_id: complaintId,
        image_url: publicUrlData.publicUrl,
      });
    
    if (imageRecordError) throw imageRecordError;
    
    return { error: null };
  } catch (error: any) {
    console.error("Error uploading image:", error);
    return { error };
  }
};

export const getCitizenComplaints = async (citizenId: string) => {
  try {
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .eq("citizen_id", citizenId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error fetching complaints:", error);
    return { data: null, error };
  }
};


export const getComplaintById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error fetching complaint details:", error);
    return { data: null, error };
  }
};


export const updateComplaintStatus = async (
  id: string, 
  status: ComplaintStatus,
  assignedToId?: string
) => {
  try {
    const updateData: any = { status };
    
    if (assignedToId) {
      updateData.assigned_to_id = assignedToId;
    }
    
    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from("complaints")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error updating complaint status:", error);
    return { data: null, error };
  }
};
