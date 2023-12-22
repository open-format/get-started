import { useEffect } from "react";
import { useSupabase } from "../hooks/useSupabase";
import * as React from "react";

const Welcome = () => {
  const supabase = useSupabase();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      const signIn = async () => {
        const { data, error } = await supabase.auth.signInWithOtp({ token });

        if (error) {
          console.error("Error completing sign in:", error);
          // Handle error (e.g., show error message to user)
        } else {
          console.log("Sign in successful!", data);
          // Redirect or update UI accordingly
        }
      };

      signIn();
    }
  }, [supabase]);

  return <div>Welcome...</div>;
};

export default Welcome;
