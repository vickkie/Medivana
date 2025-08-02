import React, { useContext, useEffect, useState } from "react";
import { ScrollView, View, Text, Image, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { COLORS, SIZES } from "../constants";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../components/auth/AuthContext";
import Toast from "react-native-toast-message";
import Icon from "../constants/icons";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useDelete from "../hook/useDelete2";
import { VERSION_LONG, VERSION_SHORT, BACKEND_PORT } from "@env";
import { useCart } from "../contexts/CartContext";
import { useWish } from "../contexts/WishContext";
import WebView from "react-native-webview";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import LottieView from "lottie-react-native";
import {
  CalendarDays,
  Heart,
  UserRound,
  InfoIcon,
  RefreshCwOff,
  LogOutIcon,
  UserMinus,
  LogInIcon,
  MessageCircleMoreIcon,
  HeartPulseIcon,
  ChevronsRight,
} from "lucide-react-native";

const Profile = () => {
  const navigation = useNavigation();
  const { userData, userLogout, userLogin } = useContext(AuthContext);
  const [deleting, setDEleting] = useState(false);
  const { clearCart } = useCart();
  const { clearWishlist } = useWish();

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!userLogin) {
      setUserId(1);
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  // Function to clear cache
  const clearCache = async () => {
    try {
      //clear cart and wishCount
      clearWishlist();
      clearCart();

      // Clear AsyncStorage
      await AsyncStorage.clear();

      // Clear FileSystem cache
      const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
      await Promise.all(files.map((file) => FileSystem.deleteAsync(FileSystem.documentDirectory + file)));

      // Show success message
      Toast.show({
        type: "success",
        text1: "Cache Cleared",
        text2: "All cached data and local storage have been removed.",
      });
    } catch (error) {
      // Show error message
      Toast.show({
        type: "error",
        text1: "Error Clearing Cache",
        text2: "There was an issue clearing the cache. Please try again later.",
      });
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear cache",
      "Delete all our saved data on your device?",
      [
        {
          text: "Cancel",
          onPress: () => {
            // console.log("Cancelled clear cache");
          },
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: async () => {
            await clearCache(); // Clear the cache
          },
        },
      ],
      { cancelable: true }
    );
  };

  const deleteAccount = async () => {
    // return;
    setDEleting(false);
    try {
      const endpoint = `${BACKEND_PORT}/api/user/delete-account/${userData?._id}`;

      console.log(endpoint);

      const response = await axios.delete(endpoint);

      console.log(response);
      // Check response status and token first
      if (response.status === 200 && response.data.success) {
        console.log("here1");

        console.log("here2");
        await clearCache();
        console.log("here3");

        userLogout();

        // Reset the navigation stack
        navigation.reset({
          index: 0,
          routes: [{ name: "Bottom Navigation" }],
        });
        showToast("success", response?.data?.message, response?.data?.message2);
        setDEleting(false);
        return;
      } else {
        Alert.alert("Error Deleting", "Unexpected response. Please try again later.");
        setDEleting(false);
      }
    } catch (error) {
      console.log(error);
      showToast("error", "Sorry an error occured");
    } finally {
      setDEleting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete account",
      "Are you sure you want to delete your account?",
      [
        {
          text: "Cancel",
          onPress: () => {
            // console.log("Cancelled delete")
          },
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: () => {
            deleteAccount();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const logout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: () => {
            userLogout();
            showToast("success", "You have been logged out", "Thank you for being with us");
          },
        },
      ],
      { cancelable: true }
    );
  };
  const login = () => {
    navigation.navigate("Login");
  };

  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2 ? text2 : "",
      visibilityTime: 5000,
    });
  };

  const controlledNavigation = (route) => {
    console.log(userData, userLogin);
    if (!userData || !userLogin) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Bottom Navigation", params: { screen: "Profile" } }],
      });

      showToast("error", "Please login or create account.");
    } else {
      navigation.navigate(route);
    }
  };

  const renderProfilePicture = () => {
    const [loading, setLoading] = useState(true);

    if (!userLogin) {
      // User not logged in, show default image
      return <Image source={require("../assets/images/userDefault.webp")} style={styles.profile} />;
    }

    if (userData?.profilePicture) {
      return (
        <View style={{ position: "relative" }}>
          {loading && (
            <ActivityIndicator
              size="small"
              color="#000"
              style={{ position: "absolute", alignSelf: "center", top: "50%" }}
            />
          )}
          <Image
            source={{ uri: userData.profilePicture }}
            style={styles.profile}
            onLoadStart={() => setLoading(true)}
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)} // Hide loader if error occurs
          />
        </View>
      );
    }

    return <Image source={require("../assets/images/userDefault.webp")} style={styles.profile} />;
  };

  return (
    <ScrollView>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={COLORS.themey} />
        <View style={styles.mediTop}>
          <View style={styles.upperRow}>
            {/* <TouchableOpacity onPress={() => navigation.goBack()} style={styles.buttonWrap}>
              <Icon size={26} name="backbutton" />
            </TouchableOpacity> */}
            <Text style={styles.heading}>Profile</Text>
            <View style={styles.lovebuy}>
              <TouchableOpacity onPress={() => navigation.navigate("UserDetails")} style={styles.buttonWrap1}>
                <Icon size={26} name="pencil" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("Cart")} style={styles.buttonWrap1}>
                <Icon size={26} name="bellfilled" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.pictureCenter}>
            <TouchableOpacity onPress={() => navigation.navigate("UserDetails")} style={styles.pictureWrap2}>
              {renderProfilePicture()}
            </TouchableOpacity>
            {userData ? (
              <View style={styles.nameBtn}>
                <Text style={styles.email}>{userData.email}</Text>
              </View>
            ) : (
              <View style={styles.loginhere}>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                  <View style={styles.loginBtn}>
                    <Text style={styles.menuText}>LOGIN</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                  <Text style={styles.regText}>Don't have an account? Register</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.profileContainer}>
          <Text style={styles.names}>{userData ? userData.name : "Please login to account"}</Text>

          <View style={styles.menuWrapper}>
            <View style={styles.menuboxwrapin}>
              <TouchableOpacity onPress={() => controlledNavigation("UserDetails")}>
                <View style={styles.menuItem(0.5)}>
                  <View style={styles.menuItemInner}>
                    <TouchableOpacity style={styles.menuItemIcon}>
                      <UserRound name="person-circle-outline" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={styles.menuText}>Account Settings</Text>
                  </View>
                  <TouchableOpacity style={styles.flexCenter}>
                    <ChevronsRight name="doubleforward" size={26} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => controlledNavigation("Favourites")}>
                <View style={styles.menuItem(0.5)}>
                  <View style={styles.menuItemInner}>
                    <TouchableOpacity style={styles.menuItemIcon}>
                      <HeartPulseIcon name="heart-circle" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={styles.menuText}>Favourites</Text>
                  </View>
                  <TouchableOpacity style={styles.flexCenter}>
                    <ChevronsRight name="doubleforward" size={26} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => controlledNavigation("Orders")}>
                <View style={styles.menuItem(0.5)}>
                  <View style={styles.menuItemInner}>
                    <TouchableOpacity style={styles.menuItemIcon}>
                      <CalendarDays name="calendar-number" size={26} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={styles.menuText}>Appointments</Text>
                  </View>
                  <TouchableOpacity style={styles.flexCenter}>
                    <ChevronsRight name="doubleforward" size={26} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => () => controlledNavigation("Message")}>
                <View style={styles.menuItem(0.5)}>
                  <View style={styles.menuItemInner}>
                    <TouchableOpacity style={styles.menuItemIcon}>
                      <MessageCircleMoreIcon name="chatbubble-ellipses" size={26} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={styles.menuText}>Message Center</Text>
                  </View>
                  <TouchableOpacity style={styles.flexCenter}>
                    <ChevronsRight name="doubleforward" size={26} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.menuboxwrapin}>
              <TouchableOpacity onPress={() => navigation.navigate("AboutUs")}>
                <View style={styles.menuItem(0.5)}>
                  <View style={styles.menuItemInner}>
                    <TouchableOpacity style={styles.menuItemIcon}>
                      <InfoIcon name="information-circle" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={styles.menuText}>Information Center</Text>
                  </View>
                  <TouchableOpacity style={styles.flexCenter}>
                    <ChevronsRight name="doubleforward" size={26} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClearCache}>
                <View style={styles.menuItem(0.5)}>
                  <View style={styles.menuItemInner}>
                    <TouchableOpacity style={styles.menuItemIcon}>
                      <RefreshCwOff name="reload" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={styles.menuText}>Clear Cache</Text>
                  </View>
                  <TouchableOpacity style={styles.flexCenter}>
                    <ChevronsRight name="doubleforward" size={26} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
              {/* {userData && !deleting && ( */}
              {userLogin ? (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      handleDeleteAccount();
                    }}
                  >
                    <View style={styles.menuItem(0.5)}>
                      <View style={styles.menuItemInner}>
                        <TouchableOpacity style={styles.menuItemIcon}>
                          <UserMinus name="person-remove" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                        <Text style={styles.menuText}>Delete Account</Text>
                      </View>
                      <TouchableOpacity style={styles.flexCenter}>
                        <ChevronsRight name="doubleforward" size={26} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={logout}>
                    <View style={styles.menuItem(0.5)}>
                      <View style={styles.menuItemInner}>
                        <TouchableOpacity style={styles.menuItemIcon}>
                          <LogOutIcon name="log-out" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                        <Text style={styles.menuText}>Logout</Text>
                      </View>
                      <TouchableOpacity style={styles.flexCenter}>
                        <ChevronsRight name="doubleforward" size={26} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity onPress={login}>
                  <View style={styles.menuItem(0.5)}>
                    <LogInIcon name="login" size={24} color={COLORS.primary} />
                    <Text style={styles.menuText}>Login</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.versionWrapper}>
              <Text style={styles.versionText}>{VERSION_LONG}</Text>
            </View>
          </View>
          {/* )} */}
          {deleting && (
            <View style={styles.containerx}>
              <View style={styles.containLottie}>
                <View style={styles.animationWrapper}>
                  <LottieView source={require("../assets/data/loading.json")} autoPlay loop style={styles.animation} />
                </View>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingBottom: 60,
  },

  cover: {
    height: 250,
    width: "100%",
    resizeMode: "cover",
  },
  profileContainer: {
    flex: 1,
    alignItems: "center",
    minHeight: SIZES.height / 1.5 + 20,
    backgroundColor: COLORS.white,
    marginTop: 0,
    elevation: 1,
  },
  profile: {
    height: 100,
    width: 100,
    borderRadius: 200,
    borderWidth: 2,
    borderColor: COLORS.white,
    resizeMode: "cover",
  },
  name: {
    fontFamily: "bold",
    color: COLORS.white,
    marginVertical: 3,
  },
  loginhere: {
    paddingTop: SIZES.medium,
    justifyContent: "center",
    alignItems: "center",
    gap: SIZES.xLarge,
    flexDirection: "column",
  },
  regText: {
    color: "#000",
    fontSize: SIZES.medium,
    textDecorationStyle: "solid",
    textDecorationLine: "underline",
    fontFamily: "medium",
  },
  loginBtn: {
    backgroundColor: COLORS.themew,
    padding: 2,
    borderWidth: 0.4,
    borderColor: COLORS.primary,
    borderRadius: SIZES.xxLarge,
    width: SIZES.width / 4,
  },

  nameBtn: {
    backgroundColor: COLORS.themew,
    padding: 2,
    borderWidth: 4,
    borderColor: COLORS.primary,
    borderRadius: SIZES.xxLarge,
  },
  menuText: {
    fontFamily: "regular",
    color: COLORS.themeb,
    marginLeft: 20,
    marginRight: 20,
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 26,
  },
  menuWrapper: {
    width: SIZES.width - SIZES.large,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    gap: 6,
  },
  menuboxwrapin: {
    backgroundColor: COLORS.themeg,
    borderRadius: 25,
    paddingVertical: 7,
  },
  menuItem: (borderBottomWidth) => ({
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 30,
    borderColor: COLORS.gray,
    justifyContent: "space-between",
  }),
  menuItemInner: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  versionWrapper: {
    paddingTop: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  versionText: {
    fontFamily: "GtAlpine",
    color: COLORS.gray,
  },
  containLottie: {
    justifyContent: "center",
    alignItems: "center",
    width: SIZES.width - 20,
    flex: 1,
  },
  animationWrapper: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  animation: {
    width: "100%",
    height: "100%",
  },
  containerx: {
    minHeight: SIZES.height / 2 - 20,
    backgroundColor: COLORS.themeg,
    marginTop: 30,
    width: SIZES.width - 20,
    marginHorizontal: 10,
    borderRadius: SIZES.medium,
  },
  upperRow: {
    width: SIZES.width,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    borderRadius: SIZES.large,
    zIndex: 999,
  },
  mediTop: {
    backgroundColor: COLORS.themey,
    borderBottomLeftRadius: 27,
    borderBottomRightRadius: 27,
    display: "flex",
    flexDirection: "column",
    height: 120,
    width: "100%",
    minHeight: SIZES.height / 4,
    elevation: 7,
    zIndex: 4,
    // overflow: "hidden",
  },
  email: {
    color: COLORS.themeb,
    padding: 10,
  },
  flexCenter: {
    justifyContent: "center",
  },

  heading: {
    color: COLORS.themew,
    marginLeft: 30,
    alignSelf: "center",
    fontFamily: "lufgaMedium",
    fontSize: SIZES.large,
  },
  buttonWrap: {
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 10,
    marginStart: 10,
  },
  lovebuy: {
    flexDirection: "row",
  },
  buttonWrap1: {
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
    // maxHeight: 40,
  },

  pictureCenter: { marginTop: 70, justifyContent: "center", alignItems: "center" },
  menuItemIcon: {
    padding: 7,
    borderRadius: 30,
    borderColor: COLORS.themew,
    backgroundColor: COLORS.themew,
    borderWidth: 1,
  },
});
