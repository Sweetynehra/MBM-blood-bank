
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

// Define the expected type for the RPC response
type CheckAdminResponse = {
  check_is_admin: boolean;
};

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    async function checkAdmin() {
      setLoading(true);
      
      try {
        if (!user) {
          if (isMounted) setIsAdmin(false);
          return;
        }
        
        const userId = user.id;
        
        // Using a different approach to check admin status to avoid RLS recursion
        const { data, error } = await supabase.rpc<CheckAdminResponse, Database['public']['Functions']['check_is_admin']['Args']>(
          'check_is_admin',
          { user_id: userId }
        );
        
        if (error) {
          console.error("Error checking admin role:", error);
          // Fallback method if RPC fails
          const { data: roleData, error: fallbackError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", userId)
            .limit(1);

          if (fallbackError) {
            console.error("Fallback error fetching user role:", fallbackError);
            if (isMounted) setIsAdmin(false);
            
            // Show toast only for non-RLS related errors
            if (fallbackError.code !== '42P17') {
              toast({
                title: "Error checking permissions",
                description: "There was a problem verifying your admin status.",
                variant: "destructive",
              });
            }
            return;
          }
          
          if (isMounted) setIsAdmin(roleData?.some(role => role.role === "admin") || false);
          return;
        }
        
        if (isMounted) setIsAdmin(data?.check_is_admin || false);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkAdmin();

    return () => {
      isMounted = false;
    };
  }, [user, toast]);

  return { isAdmin, loading };
}
