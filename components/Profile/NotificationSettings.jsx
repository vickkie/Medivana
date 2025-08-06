import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { Bell, BellOff } from "lucide-react-native";
import Icon from "../../constants/icons";
import { COLORS, SIZES } from "../../constants";

const NotificationSettings = () => {
  const navigation = useNavigation();
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [medicalReminders, setMedicalReminders] = useState(false);
  const [appointmentReminders, setAppointmentReminders] = useState(false);
  const [emergencyAlerts, setEmergencyAlerts] = useState(false);

  useEffect(() => {
    checkNotificationPermissions();
    loadNotificationSettings();
  }, []);

  const checkNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationPermission(status === "granted");
  };

  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === "granted") {
      setNotificationPermission(true);
      showToast("success", "Permission Granted", "Notifications enabled successfully");
      return true;
    } else {
      showToast("error", "Permission Denied", "Please enable notifications in settings");
      return false;
    }
  };

  const loadNotificationSettings = () => {
    // TODO: load from API or async storage
    setPushNotifications(true);
    setEmailNotifications(false);
    setSmsNotifications(false);
    setMedicalReminders(true);
    setAppointmentReminders(true);
    setEmergencyAlerts(true);
  };

  const saveSettingToAPI = async (settingName, value) => {
    try {
      // TODO: Replace with actual API call
      const settings = {
        [settingName]: value,
        updatedAt: new Date().toISOString(),
      };
      // await api.updateNotificationSetting(settings);
      console.log(`Saved ${settingName}: ${value}`);
    } catch (error) {
      showToast("error", "Save Failed", "Setting could not be saved");
      console.error("Failed to save setting:", error);
    }
  };

  const handleNotificationToggle = async (value) => {
    if (value && !notificationPermission) {
      const granted = await requestNotificationPermission();
      if (!granted) return;
    }

    if (!value) {
      Alert.alert(
        "Disable Notifications",
        "This will disable all notification types. You can re-enable them anytime.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Disable",
            style: "destructive",
            onPress: () => {
              setNotificationPermission(false);
              setPushNotifications(false);
              setMedicalReminders(false);
              setAppointmentReminders(false);
              setEmergencyAlerts(false);
              saveSettingToAPI("allNotifications", false);
              showToast("info", "Notifications Disabled", "All notifications have been turned off");
            },
          },
        ]
      );
    } else {
      setNotificationPermission(value);
      saveSettingToAPI("notificationPermission", value);
    }
  };

  const handlePushNotificationsChange = (value) => {
    setPushNotifications(value);
    saveSettingToAPI("pushNotifications", value);
    if (value) {
      showToast("success", "Push Notifications", "Enabled successfully");
    }
  };

  const handleEmailNotificationsChange = (value) => {
    setEmailNotifications(value);
    saveSettingToAPI("emailNotifications", value);
    if (value) {
      showToast("success", "Email Notifications", "Enabled successfully");
    }
  };

  const handleSmsNotificationsChange = (value) => {
    setSmsNotifications(value);
    saveSettingToAPI("smsNotifications", value);
    if (value) {
      showToast("success", "SMS Notifications", "Enabled successfully");
    }
  };

  const handleMedicalRemindersChange = (value) => {
    setMedicalReminders(value);
    saveSettingToAPI("medicalReminders", value);
    if (value) {
      showToast("success", "Medication Reminders", "Enabled successfully");
    }
  };

  const handleAppointmentRemindersChange = (value) => {
    setAppointmentReminders(value);
    saveSettingToAPI("appointmentReminders", value);
    if (value) {
      showToast("success", "Appointment Reminders", "Enabled successfully");
    }
  };

  const handleEmergencyAlertsChange = (value) => {
    setEmergencyAlerts(value);
    saveSettingToAPI("emergencyAlerts", value);
    if (value) {
      showToast("success", "Emergency Alerts", "Enabled successfully");
    }
  };

  const showToast = (type, text1, text2) => {
    Toast.show({ type, text1, text2, visibilityTime: 3000 });
  };

  const ToggleSwitch = ({ value, onValueChange, disabled, label, description }) => (
    <View style={styles.toggleContainer}>
      <View style={styles.toggleTextContainer}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {description && <Text style={styles.toggleDescription}>{description}</Text>}
      </View>
      <TouchableOpacity
        style={[styles.toggleSwitch, value && styles.toggleSwitchActive, disabled && styles.toggleSwitchDisabled]}
        onPress={() => !disabled && onValueChange(!value)}
        disabled={disabled}
      >
        <View style={[styles.toggleThumb, value && styles.toggleThumbActive, disabled && styles.toggleThumbDisabled]} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.upperRow}>
          <View style={styles.topButts}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, styles.buttonWrap]}>
              <Icon name="backbutton" size={26} />
            </TouchableOpacity>
            <Text style={styles.heading}>Notification Settings</Text>
            <View style={styles.outWrap}>
              <TouchableOpacity>
                <Icon name="bellfilled" size={22} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.lowerheader}>
            <Text style={styles.statement}>Manage how you receive notifications.</Text>
          </View>
        </View>
      </View>

      <ScrollView>
        <View style={styles.detailsWrapper}>
          {/* Permission */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              {notificationPermission ? (
                <Bell size={20} color={COLORS.themey} />
              ) : (
                <BellOff size={20} color={COLORS.gray} />
              )}
              <Text style={styles.sectionTitle}>Notification Permission</Text>
            </View>
            <ToggleSwitch
              value={notificationPermission}
              onValueChange={handleNotificationToggle}
              label="Enable Notifications"
              description="Allow this app to send you notifications"
            />
          </View>

          {/* Push */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Push Notifications</Text>
            <ToggleSwitch
              value={pushNotifications}
              onValueChange={handlePushNotificationsChange}
              disabled={!notificationPermission}
              label="Push Notifications"
              description="Receive notifications on your device"
            />
          </View>

          {/* Communication */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Communication Preferences</Text>
            <ToggleSwitch
              value={emailNotifications}
              onValueChange={handleEmailNotificationsChange}
              label="Email Notifications"
              description="Receive notifications via email"
            />
            <ToggleSwitch
              value={smsNotifications}
              onValueChange={handleSmsNotificationsChange}
              label="SMS Notifications"
              description="Receive notifications via text message"
            />
          </View>

          {/* Medical */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Medical Notifications</Text>
            <ToggleSwitch
              value={medicalReminders}
              onValueChange={handleMedicalRemindersChange}
              disabled={!notificationPermission}
              label="Medication Reminders"
              description="Get reminded to take your medications"
            />
            <ToggleSwitch
              value={appointmentReminders}
              onValueChange={handleAppointmentRemindersChange}
              disabled={!notificationPermission}
              label="Appointment Reminders"
              description="Get reminded about upcoming appointments"
            />
            <ToggleSwitch
              value={emergencyAlerts}
              onValueChange={handleEmergencyAlertsChange}
              disabled={!notificationPermission}
              label="Emergency Alerts"
              description="Receive critical health alerts"
            />
          </View>
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
};

export default NotificationSettings;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.themeg },
  wrapper: { flexDirection: "column" },
  upperRow: {
    width: SIZES.width - 12,
    marginHorizontal: 6,
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.large,
    top: SIZES.xxSmall,
    zIndex: 2,
    minHeight: 90,
  },
  topButts: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  backBtn: { left: 10 },
  buttonWrap: {
    backgroundColor: COLORS.themeg,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  outWrap: {
    backgroundColor: COLORS.themey,
    padding: 15,
    borderRadius: 100,
  },
  lowerheader: {
    flexDirection: "column",
    width: SIZES.width - 20,
    paddingVertical: 20,
  },
  heading: {
    fontFamily: "bold",
    fontSize: SIZES.large + 3,
    color: COLORS.themey,
    // marginStart: 20,
  },
  statement: {
    fontSize: SIZES.small + 3,
    fontFamily: "regular",
    paddingLeft: 20,
    textAlign: "center",
    color: COLORS.gray2,
  },
  detailsWrapper: {
    width: SIZES.width - 12,
    marginHorizontal: 6,
    marginTop: SIZES.xSmall,
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.medium,
    minHeight: SIZES.height - 200,
  },
  sectionContainer: {
    marginBottom: SIZES.medium,
    paddingBottom: SIZES.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray2 + "30",
    padding: SIZES.medium,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: SIZES.medium },
  sectionTitle: { fontSize: SIZES.medium, fontFamily: "bold", color: COLORS.themey, marginBottom: 5 },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.small,
  },
  toggleTextContainer: { flex: 1, marginRight: SIZES.medium },
  toggleLabel: { fontSize: SIZES.small + 3, fontFamily: "lufgaMedium", color: COLORS.gray },
  toggleDescription: { fontSize: SIZES.small + 3, fontFamily: "regular", color: COLORS.gray2 },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gray,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleSwitchActive: { backgroundColor: COLORS.themey },
  toggleSwitchDisabled: { backgroundColor: COLORS.gray2, opacity: 0.6 },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toggleThumbActive: { alignSelf: "flex-end" },
  toggleThumbDisabled: { backgroundColor: COLORS.gray2 },
  saveButton: {
    backgroundColor: COLORS.themey,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: SIZES.medium,
    alignItems: "center",
    marginTop: SIZES.medium,
    marginBottom: 20,
  },
  saveButtonDisabled: { backgroundColor: COLORS.gray2, opacity: 0.6 },
  saveButtonText: { color: COLORS.white, fontSize: SIZES.medium, fontFamily: "bold" },
});
