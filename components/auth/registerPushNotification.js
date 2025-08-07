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

  if (Platform.OS === "android" && Platform.Version >= 33) {
    const { status: androidStatus } = await Notifications.requestPermissionsAsync();
    status = androidStatus;
  } else if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    status = newStatus;
  }

  const lastToken = await AsyncStorage.getItem("lastExpoPushToken");
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? EAS_PROJECT_ID;

  console.log(lastToken, projectId, "last push token");

  let token = null;

  try {
    const response = await Notifications.getExpoPushTokenAsync({ projectId });

    if (response?.data) {
      token = response.data;
      console.log(" Expo Push Token:", token);
    } else {
      console.warn("⚠️ No token returned from getExpoPushTokenAsync. Response:", response);
    }
  } catch (err) {
    console.error(" Error while fetching Expo Push Token:", err);
  }

  if (status !== "granted") {
    console.log("Failed to get permission for push notification");
    return;
  }

  if (!projectId) {
    console.error("Missing EAS Project ID! Push notifications may fail.");
    return;
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

export function startPermissionCheck(userId) {
  const interval = setInterval(async () => {
    console.log("Checking notification permission...");

    const { status } = await Notifications.getPermissionsAsync();
    console.log(status);

    registerForPushNotificationsAsync(userId);

    if (status === "granted") {
      console.log("Permission granted, stopping checks.");
      clearInterval(interval);
    } else if (status === "denied") {
      console.log("Permission denied. User needs to enable manually.");
    } else if (!status) {
      console.log("Permission status is unknown or not determined yet.");
    }
  }, 3000);
}
