import React, { useEffect, useState } from "react";
import { View, Text, Button, Alert, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import NetInfo from "@react-native-community/netinfo";
import { BACKEND_PORT } from "@env";
import { isTrustedUpdateUrl } from "../utils/urlSafety";

const CHECK_UPDATE_URL = `${BACKEND_PORT}/api/version/latest`;
const SKIPPED_VERSION_KEY = "skipped_version";

export default function UpdateCheck() {
  const [updateUrl, setUpdateUrl] = useState("");
  const [isForced, setIsForced] = useState(false);
  const [latestVersion, setLatestVersion] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  // Get current app version
  const currentVersion = Application.nativeApplicationVersion || "dev";
  const applicationName = Application.applicationName;

  // Check once per launch - polling every 2 minutes wastes battery/network
  // and would re-alert a user who already dismissed the prompt.
  useEffect(() => {
    checkForUpdates();
  }, []);

  // Function to compare versions
  const isNewerVersion = (current, latest) => {
    const parseVersion = (ver) => ver.split(".").map(Number);
    const [cMajor, cMinor, cPatch] = parseVersion(current);
    const [lMajor, lMinor, lPatch] = parseVersion(latest);

    if (lMajor > cMajor) return true;
    if (lMajor === cMajor && lMinor > cMinor) return true;
    if (lMajor === cMajor && lMinor === cMinor && lPatch > cPatch) return true;
    return false;
  };

  const checkForUpdates = async () => {
    setIsChecking(true);
    try {
      const { isConnected } = await NetInfo.fetch();
      if (!isConnected) return;

      const response = await fetch(CHECK_UPDATE_URL);
      const data = await response.json();
      // console.log(heyy);

      if (applicationName === "Expo Go") {
        setIsForced(false);
        return;
      }
      // console.log(data.version);

      const newVersion = data.version;
      setLatestVersion(newVersion);

      const skippedVersion = await AsyncStorage.getItem(SKIPPED_VERSION_KEY);

      if (isNewerVersion(currentVersion, newVersion) && skippedVersion !== newVersion) {
        setUpdateUrl(
          data?.downloadUrl ||
            `https://github.com/vickkie/Medivana/releases/download/v${newVersion}/Promokings-v${newVersion}.apk`
        );
        setIsForced(data.forceUpdate);
        showUpdateAlert(data.forceUpdate, newVersion);
      }
    } catch (error) {
      // console.error("Error checking update:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const showUpdateAlert = (force, newVersion) => {
    const allowSkip = currentVersion === "dev" || !force; // Skip allowed in dev or if not forced

    Alert.alert(
      "Update Available",
      `A new version of the app is available.\n\nCurrent: ${currentVersion}\nLatest: ${newVersion}\n\nPlease update to continue.`,
      [
        { text: "Update Now", onPress: () => updateUrl && openStore(updateUrl) },
        ...(allowSkip ? [{ text: "Skip", onPress: skipUpdate }] : []),
      ],
      { cancelable: false }
    );
  };

  const skipUpdate = async () => {
    if (latestVersion) {
      await AsyncStorage.setItem(SKIPPED_VERSION_KEY, latestVersion);
    }
  };

  const openStore = async (url) => {
    if (!isTrustedUpdateUrl(url)) {
      Alert.alert("Error", "The update link is not a trusted source.");
      return;
    }
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert("Error", "Unable to open the update link.");
    }
  };

  return null;
}
