import { useContext, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import axios from "axios";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "./AuthContext";
import { BACKEND_PORT } from "@env";

// Google sign-in for the patient app. The web client id is fetched from the
// backend's /auth/google/config endpoint so both sides stay in sync from a
// single source of truth (GOOGLE_CLIENT_ID on the server).
const useGoogleLogin = () => {
  const { login } = useContext(AuthContext);
  const navigation = useNavigation();

  const [googleLoading, setGoogleLoading] = useState(false);
  // null = not yet known, true/false = backend verdict
  const [googleEnabled, setGoogleEnabled] = useState(null);
  const webClientIdRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await axios.get(`${BACKEND_PORT}/auth/google/config`, { timeout: 8000 });
        if (!mounted) return;
        if (data?.enabled && data?.clientId) {
          webClientIdRef.current = data.clientId;
          GoogleSignin.configure({ webClientId: data.clientId });
          setGoogleEnabled(true);
        } else {
          setGoogleEnabled(false);
        }
      } catch (error) {
        if (__DEV__) console.log("Google config fetch failed:", error?.message);
        if (mounted) setGoogleEnabled(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleGoogleLogin = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      if (!webClientIdRef.current) {
        Alert.alert("Unavailable", "Google sign-in is not configured right now.");
        return;
      }

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // Clear the cached grant so the account picker shows every time —
      // otherwise Google silently re-auths the previously chosen account.
      await GoogleSignin.signOut().catch(() => {});
      await GoogleSignin.signIn();

      const { idToken } = await GoogleSignin.getTokens();
      if (!idToken) {
        Alert.alert("Google sign-in failed", "No identity token returned. Please try again.");
        return;
      }

      const response = await axios.post(`${BACKEND_PORT}/auth/google/user`, { credential: idToken });
      if (response.status !== 200 || !response.data?.TOKEN) {
        Alert.alert("Error Logging In", "Unexpected response. Please try again.");
        return;
      }

      await login(response.data);

      // New Google accounts land on profile completion (phone, names, etc.)
      navigation.reset({
        index: response.data?.isNewUser ? 1 : 0,
        routes: [
          { name: "Bottom Navigation", params: { screen: "Home" } },
          ...(response.data?.isNewUser ? [{ name: "UserDetails" }] : []),
        ],
      });
    } catch (error) {
      if (error?.code === statusCodes.SIGN_IN_CANCELLED || error?.code === statusCodes.IN_PROGRESS) return;
      const errorMsg =
        error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
          ? "Google Play Services is not available or outdated on this device."
          : error.response?.data?.message || "Google sign-in failed. Please try again.";
      Alert.alert("Login Failure", errorMsg);
    } finally {
      setGoogleLoading(false);
    }
  };

  return { handleGoogleLogin, googleLoading, googleEnabled };
};

export default useGoogleLogin;
