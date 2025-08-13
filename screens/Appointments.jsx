import React, { useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { COLORS, SIZES } from "../constants";
import Icon from "../constants/icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../components/auth/AuthContext";
import LottieView from "lottie-react-native";
import { BACKEND_PORT } from "@env";
import { StatusBar } from "expo-status-bar";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";
import AppointmentPage from "./AppointmentList";
import { FilterIcon, SearchIcon } from "lucide-react-native";

const Appointments = () => {
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  return (
    <>
      <SafeAreaView style={styles.containerx}>
        <>
          <View style={styles.wrapper}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, styles.buttonWrap]}>
              <Icon name="backbutton" size={26} />
            </TouchableOpacity>
            <View style={styles.upperRow}>
              <View style={styles.upperButtons}>
                <Text style={styles.heading}>My Appointments</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setIsSearching(!isSearching);
                }}
                style={styles.outWrap}
              >
                {isSearching ? (
                  <FilterIcon size={23} color={COLORS.themey} />
                ) : (
                  <SearchIcon size={23} color={COLORS.themey} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView>
            <View style={{ marginTop: 78 }}>
              {isSearching && (
                <View style={styles.searchBarContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search Appointments"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  <TouchableOpacity style={styles.searchButton}>
                    <Icon name="search" size={26} />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.detailsWrapper}>
                <AppointmentPage filterList={""} searchQuery1={searchQuery} isSearching={isSearching} />
              </View>
            </View>
          </ScrollView>
        </>
      </SafeAreaView>
    </>
  );
};

export default Appointments;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.themew,
  },
  wrapper: {
    flexDirection: "column",
    position: "absolute",
    top: 2,
  },
  backBtn: {
    left: 10,
  },
  buttonView: {
    backgroundColor: COLORS.themew,
    padding: 12,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    height: 30,
    transform: [{ rotate: "180deg" }],
  },
  buttonWrap: {
    backgroundColor: COLORS.themeg,
    padding: 12,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    zIndex: 9,
    top: 10,
    left: 10,
  },
  upperRow: {
    width: SIZES.width - 12,
    marginHorizontal: 6,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.large,
    top: SIZES.xxSmall,
    zIndex: 2,
    minHeight: 70,
  },
  upperButtons: {
    width: SIZES.width - 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SIZES.medium,
  },
  topprofileheading: {
    fontSize: SIZES.medium,
    textAlign: "center",
    color: COLORS.themeb,
    fontFamily: "semibold",
  },
  outWrap: {
    backgroundColor: COLORS.themeg,
    padding: 12,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 5,
    right: 10,
  },
  lowerheader: {
    flexDirection: "column",
    justifyContent: "flex-start",
    width: SIZES.width - 20,
    marginTop: 15,
    paddingTop: SIZES.xSmall,
    paddingBottom: 20,
  },
  heading: {
    fontFamily: "bold",
    textTransform: "uppercase",
    fontSize: SIZES.large,
    textAlign: "left",
    color: COLORS.themeb,
    marginStart: 20,
  },
  statement: {
    fontFamily: "regular",
    paddingLeft: 20,
    paddingVertical: 5,
    color: COLORS.gray2,
    textAlign: "center",
  },
  list: {
    paddingHorizontal: 10,
    gap: 10,
    marginVertical: 10,
  },
  cardContent: {
    flex: 1,
    justifyContent: "space-between",
    flexDirection: "column",
    padding: 15,
  },
  image: {
    position: "absolute",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.themeb,
    fontFamily: "semibold",
  },
  shippingId: {
    padding: 5,
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.medium,
    fontSize: 14,
    color: "#cccca0",
  },
  detailsWrapper: {
    width: SIZES.width - 12,
    marginHorizontal: 6,
    marginTop: SIZES.xSmall,
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.medium,
    minHeight: SIZES.height / 3,
    marginBottom: 60,
  },
  searchBarContainer: {
    flexDirection: "row",
    marginBottom: 16,
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    padding: 8,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 100,
  },
  searchButton: {
    position: "absolute",
    right: 17,
  },
  filterContainer: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    // backgroundColor: "red",
    height: 50,
  },
  filterButton: {
    marginHorizontal: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.themew,
    borderRadius: 16,
    height: 33,
  },
  selectedFilter: {
    backgroundColor: COLORS.themey,
    color: COLORS.themew,
  },
  searchResultCard: {
    padding: 10,
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.medium,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: "semibold",
    marginBottom: 8,
  },
  searchResultdetail: {
    fontSize: SIZES.small,
    fontWeight: "regular",
    color: COLORS.gray,
    marginBottom: 5,
  },
  searchResultStatus: {
    marginTop: 5,
    color: COLORS.gray,
    fontStyle: "italic",
  },
  flexEnd: {
    position: "absolute",
    right: 10,
  },
  checkmark: { position: "absolute", top: 17, left: 18, height: 20, zIndex: 111 },
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
    flex: 1,
    // paddingTop: 26,
  },
});
