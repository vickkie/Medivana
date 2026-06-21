import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import { Buffer } from "buffer";
// import { startPermissionCheck } from "./registerPushNotification";

//prefill
global.atob = (input) => Buffer.from(input, "base64").toString("utf-8");
global.btoa = (input) => Buffer.from(input, "utf-8").toString("base64");

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [userLogin, setUserLogin] = useState(false);

  useEffect(() => {
    checkExistingUser();
  }, []);

  useEffect(() => {
    if (userData?._id) {
      // startPermissionCheck(userData?._id);
    }
  }, [userData]);

  // console.log("data", AsyncStorage.getItem("id"));

  const checkExistingUser = useCallback(async () => {
    try {
      const id = await AsyncStorage.getItem("id");
      if (id) {
        const userId = `user${JSON.parse(id)}`;
        const currentUser = await AsyncStorage.getItem(userId);
        if (currentUser) {
          const parsedData = JSON.parse(currentUser);
          setUserData(parsedData);
          setUserLogin(true);

          axios.defaults.headers.common["Authorization"] = `Bearer ${parsedData?.TOKEN}`;
        } else {
          if (__DEV__) console.log("User data not available");
        }
      }
    } catch (error) {
      if (__DEV__) console.log("Error retrieving data:", error);
    }
  }, []);

  // AsyncStorage.clear();
  const login = useCallback(async (data) => {
    await AsyncStorage.removeItem("id");

    setUserData(data);
    setUserLogin(true);

    axios.defaults.headers.common["Authorization"] = `Bearer ${data?.TOKEN}`;

    await AsyncStorage.setItem("id", JSON.stringify(data?._id));

    await AsyncStorage.setItem(`user${data?._id}`, JSON.stringify(data));
  }, []);
  const logout = useCallback(async () => {
    setUserData(null);
    setUserLogin(false);

    delete axios.defaults.headers.common["Authorization"];
    await AsyncStorage.removeItem("id");
    await AsyncStorage.removeItem(`user${userData?._id}`);
  }, [userData?._id]);

  const userLogout = useCallback(() => {
    logout();
  }, [logout]);

  const updateUserData = useCallback(async (updatedData) => {
    if (!updatedData || typeof updatedData !== "object") {
      console.error("Invalid user data:", updatedData);
      return;
    }

    setUserData(updatedData);

    try {
      const stringifiedData = JSON.stringify(updatedData);
      await AsyncStorage.setItem(`user${updatedData._id}`, stringifiedData);
    } catch (error) {
      if (__DEV__) console.error("Error saving user data to AsyncStorage:", error);
    }
  }, []);

  // Utility function to check user's role
  const hasRole = useCallback(
    (requiredRole) => {
      if (!requiredRole || !userData?.TOKEN) {
        return false;
      }

      try {
        const decodedToken = jwtDecode(userData.TOKEN);
        const userRole = decodedToken?.role || "customer";

        return userRole === requiredRole;
      } catch (error) {
        if (__DEV__) console.error("Invalid token, cannot decode:", error);
        return false;
      }
    },
    [userData?.TOKEN],
  );

  const getRole = useCallback((data) => {
    if (!data) {
      return "customer";
    }

    const decodedToken = jwtDecode(data?.TOKEN);

    // const userRole = decodedToken.role || "customer";
    // return userRole;

    const userRole = decodedToken.position || "customer";
    return userRole;
  }, []);

  const authContextValue = useMemo(
    () => ({
      userData,
      userLogin,
      userLogout,
      login,
      logout,
      updateUserData,
      hasRole,
      getRole,
    }),
    [userData, userLogin, userLogout, login, logout, updateUserData, hasRole, getRole],
  );

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
