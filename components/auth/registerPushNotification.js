import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_PORT, EAS_PROJECT_ID } from "@env";
import axios from "axios";


export async function registerForPushNotificationsAsync(userId) {
  if (!Device.isDevice) {
    if (__DEV__) console.log("Must use a physical device for push notifications");
    return;
  }

  // Android 13+ (API 33) requires POST_NOTIFICATIONS at runtime
  if (Platform.OS === "android" && Platform.Version >= 33) {
    const { status: androidStatus } = await Notifications.requestPermissionsAsync({
      android: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    if (androidStatus !== "granted") {
      if (__DEV__) console.log("Failed to get permission for push notification");
      return;
    }
  }

  let { status } = await Notifications.getPermissionsAsync();
  if (__DEV__) console.log("[push] initial permission status:", JSON.stringify(status));

  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (__DEV__) console.log("[push] after request:", JSON.stringify(newStatus));
    status = newStatus;
  }

  if (status !== "granted") {
    if (__DEV__) console.log("Failed to get permission for push notification");
    return;
  }

  // Dedupe per-user: a shared key would skip re-registration after an
  // account switch, leaving pushes targeted at the previous account.
  const lastTokenKey = `lastExpoPushToken_${userId}`;
  const lastToken = await AsyncStorage.getItem(lastTokenKey);
  if (__DEV__) console.log("[push] registering for userId:", userId);
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? EAS_PROJECT_ID;

  if (!projectId) {
    if (__DEV__) console.error("Missing EAS Project ID! Push notifications may fail.");
    return;
  }

  let token = null;

  try {
    if (__DEV__) console.log("[push] fetching expo push token, projectId:", projectId);
    const response = await Notifications.getExpoPushTokenAsync({ projectId });
    if (__DEV__) console.log("[push] token response:", JSON.stringify(response).slice(0, 80));

    if (response?.data) {
      token = response.data;
    } else {
      if (__DEV__) console.warn("No token returned from getExpoPushTokenAsync.", response);
    }
  } catch (err) {
    if (__DEV__) console.error("Error while fetching Expo Push Token:", err);
    return;
  }

  if (!token || token === lastToken) {
    if (__DEV__) console.log("[push] skipping save — token unchanged");
    return;
  }

  try {
    if (__DEV__) console.log("[push] POSTing token to", `${BACKEND_PORT}/api/notification/updatePushToken`);
    await axios.post(`${BACKEND_PORT}/api/notification/updatePushToken`, {
      userId,
      expoPushToken: token,
    });
    await AsyncStorage.setItem(lastTokenKey, token);
    if (__DEV__) console.log("[push] expo push token saved to backend");
  } catch (err) {
    if (__DEV__) console.error("Error updating push token:", err);
  }
}

//! Removed startPermissionCheck:
// Continuous polling for permissions is generally not recommended.
// Instead, consider prompting the user for permissions at a relevant time
// (e.g., on app launch or when a feature requiring notifications is used).
// If permission is denied, guide the user to enable it manually via UI.
