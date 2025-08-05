import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Custom hook
export const useAuthLoader = () => {
  const [userData, setUserData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("id");
        if (storedUser) {
          setUserData(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Failed to load userData:", err);
      } finally {
        setAuthLoading(false);
      }
    };

    loadUser();
  }, []);

  return { userData, authLoading };
};
