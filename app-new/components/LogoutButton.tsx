import React from "react";

export default function LogoutButton() {
  const handleLogout = async () => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    const data = await response.json();
    if (response.ok) {
      console.log("Logout successful");
      // Handle successful logout (e.g., redirect to login page)
    } else {
      console.error("Logout failed:", data.error);
      // Handle errors
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
}
