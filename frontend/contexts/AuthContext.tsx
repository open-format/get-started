import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthProviderProps {
  children: React.ReactNode;
}

// Define the type for your context
interface AuthContextType {
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
});

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function isLoggedIn() {
      try {
        const response = await axios.get("/api/auth");
        if (response.status === 200) {
          // The API call was successful, update isAuthenticated accordingly
          setIsAuthenticated(response.data.isAuthenticated);
        } else {
          // Handle any other response status codes or errors
          console.error("Error fetching authentication status");
        }
      } catch (error) {
        // Handle network errors or exceptions
        console.error("Error fetching authentication status:", error);
      }
    }

    isLoggedIn(); // Call the function to check authentication status
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
