import { StyleSheet, Text, View } from "react-native";
import { COLORS, SIZES } from "../../../constants";

const styles = StyleSheet.create({
  container: {
    marginTop: SIZES.small,
    marginHorizontal: 6,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
  },
  errorMessage: {
    fontFamily: "bold",
  },

  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
    height: SIZES.height,
  },
  iconContainer: {
    backgroundColor: COLORS.themeg,
    padding: 10,
    borderRadius: 100,
    width: 70,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    color: COLORS.white,
    fontSize: 20,
  },
  title: {
    fontSize: 16,
    fontFamily: "light",
    fontWeight: "600",
  },
});

export default styles;
