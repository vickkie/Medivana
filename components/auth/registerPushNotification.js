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
    console.log("Must use a physical device for push notifications");
    return;
  }

  let { status } = await Notifications.getPermissionsAsync();

  // Request permissions if not granted. Expo's API handles platform specifics.
  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    status = newStatus;
  }

  if (status !== "granted") {
    console.log("Failed to get permission for push notification");
    return;
  }

  const lastToken = await AsyncStorage.getItem("lastExpoPushToken");
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? EAS_PROJECT_ID;

  if (!projectId) {
    console.error("Missing EAS Project ID! Push notifications may fail.");
    return;
  }

  let token = null;
  try {
    const response = await Notifications.getExpoPushTokenAsync({ projectId });
    if (response?.data) {
      token = response.data;
      console.log("Expo Push Token:", token);
    } else {
      console.warn("⚠️ No token returned from getExpoPushTokenAsync. Response:", response);
    }
  } catch (err) {
    console.error("Error while fetching Expo Push Token:", err);
    return; // Exit if token fetching fails
  }

  if (token === lastToken) {
    console.log("Same token already sent, skipping update");
    return;
  }

  try {
    const response = await axios.post(`${BACKEND_PORT}/api/notification/updatePushToken`, {
      userId,
      expoPushToken: token,
    });
    await AsyncStorage.setItem("lastExpoPushToken", token);
    console.log("Push token updated successfully", response.data);
  } catch (err) {
    console.error("Error updating push token:", err);
  }
}

//! Removed startPermissionCheck:
// Continuous polling for permissions is generally not recommended.
// Instead, consider prompting the user for permissions at a relevant time
// (e.g., on app launch or when a feature requiring notifications is used).
// If permission is denied, guide the user to enable it manually via UI.
