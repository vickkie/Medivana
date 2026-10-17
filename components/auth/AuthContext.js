import React, { createContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { TOKEN_KEY, setUnauthorizedHandler } from "../../utils/api";

import { Buffer } from "buffer";
// import { startPermissionCheck } from "./registerPushNotification";

//prefill
global.atob = (input) => Buffer.from(input, "base64").toString("utf-8");
global.btoa = (input) => Buffer.from(input, "utf-8").toString("base64");

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [userLogin, setUserLogin] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const userDataRef = useRef(userData);
  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  useEffect(() => {
    checkExistingUser();
  }, [checkExistingUser]);

  const checkExistingUser = useCallback(async () => {
    try {
      const id = await AsyncStorage.getItem("id");
      if (!id) return;

      const userId = `user${JSON.parse(id)}`;
      const currentUser = await AsyncStorage.getItem(userId);
      if (!currentUser) {
        if (__DEV__) console.log("User data not available");
        return;
      }

      const parsedData = JSON.parse(currentUser);

      // Token lives in SecureStore. Migrate any legacy token stored inside
      // the AsyncStorage profile blob and re-save the sanitized profile.
      let token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token && parsedData?.TOKEN) {
        token = parsedData.TOKEN;
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        const { TOKEN, ...profile } = parsedData;
        await AsyncStorage.setItem(userId, JSON.stringify(profile));
      }

      setUserData({ ...parsedData, TOKEN: token });
      setUserLogin(true);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } catch (error) {
      if (__DEV__) console.log("Error retrieving data:", error);
    } finally {
      setAuthReady(true);
    }
  }, []);

  const login = useCallback(async (data) => {
    await AsyncStorage.removeItem("id");

    setUserData(data);
    setUserLogin(true);

    axios.defaults.headers.common["Authorization"] = `Bearer ${data?.TOKEN}`;
    if (data?.TOKEN) await SecureStore.setItemAsync(TOKEN_KEY, data.TOKEN);

    await AsyncStorage.setItem("id", JSON.stringify(data?._id));

    // Persist the profile without the token - the token lives in SecureStore.
    const { TOKEN, ...profile } = data;
    await AsyncStorage.setItem(`user${data?._id}`, JSON.stringify(profile));
  }, []);

  const logout = useCallback(async () => {
    setUserData(null);
    setUserLogin(false);

    delete axios.defaults.headers.common["Authorization"];
    await SecureStore.deleteItemAsync(TOKEN_KEY);

    try {
      const keys = await AsyncStorage.getAllKeys();
      const staleUserKeys = keys.filter((k) => k.startsWith("user"));
      await AsyncStorage.multiRemove([
        "id",
        "cart",
        "wishlist",
        "profileCompletion",
        "lastExpoPushToken",
        "cachedFaqs",
        "cached_doctors",
        "cached_specializations",
        "reset-email",
        ...staleUserKeys,
      ]);
    } catch (error) {
      if (__DEV__) console.error("Error clearing storage on logout:", error);
    }
  }, []);

  const userLogout = useCallback(() => {
    logout();
  }, [logout]);

  // Force logout when any request hits a 401 (expired/invalid session)
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (userDataRef.current?._id) logout();
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const updateUserData = useCallback(async (updatedData) => {
    if (!updatedData || typeof updatedData !== "object") {
      console.error("Invalid user data:", updatedData);
      return;
    }

    setUserData(updatedData);

    try {
      if (updatedData.TOKEN) await SecureStore.setItemAsync(TOKEN_KEY, updatedData.TOKEN);
      const { TOKEN, ...profile } = updatedData;
      await AsyncStorage.setItem(`user${updatedData._id}`, JSON.stringify(profile));
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
      authReady,
    }),
    [userData, userLogin, userLogout, login, logout, updateUserData, hasRole, getRole, authReady],
  );

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
