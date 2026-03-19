import { useState, useEffect } from "react";
import { supabaseClient } from "../../supabase/supabaseClient";
import { useAuth } from "../../context/AuthContext";

export const useAdminStatus = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setAdminLoading(false);
        return;
      }

      try {
        const { data, error } = await supabaseClient
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setIsAdmin(data?.is_admin || false);
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setAdminLoading(false);
      }
    };

    checkAdmin();
  }, [user]);

  return { isAdmin, adminLoading };
};