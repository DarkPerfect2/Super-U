import { useState, useEffect } from "react";
import { User } from "@shared/schema";
import { authStorage } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = authStorage.getUser();
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  const login = (user: User, accessToken: string, refreshToken: string) => {
    authStorage.setUser(user);
    authStorage.setAccessToken(accessToken);
    authStorage.setRefreshToken(refreshToken);
    setUser(user);
  };

  const logout = () => {
    authStorage.clear();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    authStorage.setUser(updatedUser);
    setUser(updatedUser);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
  };
}
