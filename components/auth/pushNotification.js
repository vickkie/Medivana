import { useEffect, useContext, useRef, useState } from "react";
import { Animated, View, Text, TouchableOpacity, Image, Vibration, Platform, StatusBar } from "react-native";
import { BlurView } from "expo-blur";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";
import { registerForPushNotificationsAsync } from "./registerPushNotification";
import { AuthContext } from "./AuthContext";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES } from "../../constants";

// --- Notification Handler ---
// Foreground: Custom banner only, Background: OS notification
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false, // Hide system alert in foreground
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function PushNotification() {
  const { userData } = useContext(AuthContext);
  const navigation = useNavigation();

  const notificationListenerRef = useRef(null);
  const responseListenerRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const lastNotificationIdRef = useRef(null);

  const [notification, setNotification] = useState(null);
  const slideAnim = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    if (!userData?._id) return;

    registerForPushNotificationsAsync(userData._id);

    // --- Foreground Notification Listener ---
    if (!notificationListenerRef.current) {
      notificationListenerRef.current = Notifications.addNotificationReceivedListener((notif) => {
        if (lastNotificationIdRef.current === notif.request.identifier) return;
        lastNotificationIdRef.current = notif.request.identifier;

        setNotification(notif.request.content);

        // Feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Vibration.vibrate(50);

        // Delay banner to avoid clashing with OS alert
        setTimeout(() => {
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }, 800);

        // Auto-hide after 6s
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = setTimeout(() => {
          Animated.timing(slideAnim, {
            toValue: -150,
            duration: 300,
            useNativeDriver: true,
          }).start(() => setNotification(null));
        }, 6000);
      });
    }

    // --- Background/Clicked Notification Listener ---
    if (!responseListenerRef.current) {
      responseListenerRef.current = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data?.conversationId) {
          navigation.navigate("ChatScreen", {
            conversationId: data.conversationId,
            chatWith: data?.chatWith,
          });
        }
        setNotification(null);
      });
    }

    return () => {
      if (notificationListenerRef.current) {
        Notifications.removeNotificationSubscription(notificationListenerRef.current);
        notificationListenerRef.current = null;
      }
      if (responseListenerRef.current) {
        Notifications.removeNotificationSubscription(responseListenerRef.current);
        responseListenerRef.current = null;
      }
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [userData?._id]);

  return (
    <>
      {notification && (
        <Animated.View
          style={{
            position: "absolute",
            top: 10,
            left: 8,
            right: 8,
            borderWidth: 1,
            borderColor: COLORS.themey + "50",
            borderRadius: SIZES.large,
            marginTop: Platform.OS === "android" ? StatusBar.currentHeight : SIZES.medium,
            overflow: "hidden", // IMPORTANT for rounded blur
            zIndex: 1000,
            transform: [{ translateY: slideAnim }],
            // shadowColor: "#000",
            // shadowOpacity: 0.2,
            // shadowRadius: 6,
            // shadowOffset: { width: 0, height: 4 },
            // elevation: 5,
          }}
        >
          <BlurView
            intensity={95}
            tint="systemChromeMaterialLight"
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 14,
              paddingHorizontal: 14,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                const data = notification.data;
                if (data?.conversationId) {
                  navigation.navigate("ChatScreen", {
                    conversationId: data.conversationId,
                    chatWith: data?.chatWith,
                  });
                }
                setNotification(null);
              }}
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <Image
                source={
                  notification.data?.avatar
                    ? { uri: notification.data.avatar }
                    : require("../../assets/images/userDefault.webp")
                }
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  marginRight: 12,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: COLORS.themey,
                    fontWeight: "bold",
                    fontSize: 15,
                    marginBottom: 2,
                  }}
                  numberOfLines={1}
                >
                  {notification.title}
                </Text>
                <Text
                  style={{
                    color: COLORS.themeb,
                    fontSize: 13,
                  }}
                  numberOfLines={2}
                >
                  {notification.body}
                </Text>
              </View>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      )}
    </>
  );
}
