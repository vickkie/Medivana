import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_PORT, EAS_PROJECT_ID } from "@env";
import axios from "axios";
import axiosRetry from "axios-retry";

axiosRetry(axios, { retries: 3 });

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

  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    status = newStatus;
  }

  if (status !== "granted") {
    if (__DEV__) console.log("Failed to get permission for push notification");
    return;
  }

  const lastToken = await AsyncStorage.getItem("lastExpoPushToken");
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? EAS_PROJECT_ID;

  if (!projectId) {
    if (__DEV__) console.error("Missing EAS Project ID! Push notifications may fail.");
    return;
  }

  let token = null;

  try {
    const response = await Notifications.getExpoPushTokenAsync({ projectId });

    if (response?.data) {
      token = response.data;
    } else {
      if (__DEV__) console.warn("No token returned from getExpoPushTokenAsync.", response);
    }
  } catch (err) {
    if (__DEV__) console.error("Error while fetching Expo Push Token:", err);
    return;
  }

  if (!token || token === lastToken) return;

  try {
    await axios.post(`${BACKEND_PORT}/api/notification/updatePushToken`, {
      userId,
      expoPushToken: token,
    });
    await AsyncStorage.setItem("lastExpoPushToken", token);
  } catch (err) {
    if (__DEV__) console.error("Error updating push token:", err);
  }
}

//! Removed startPermissionCheck:
// Continuous polling for permissions is generally not recommended.
// Instead, consider prompting the user for permissions at a relevant time
// (e.g., on app launch or when a feature requiring notifications is used).
// If permission is denied, guide the user to enable it manually via UI.
