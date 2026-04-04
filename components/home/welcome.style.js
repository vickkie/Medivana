import { StyleSheet, Text, View } from "react-native";
import { COLORS, SIZES } from "../../constants";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  welcomeTxt: (color) => ({
    fontFamily: "bold",
    fontSize: SIZES.xxLarge - 14,
    marginTop: SIZES.xSmall,
    color: color,
    textAlign: "center",
  }),
  searchContainer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.xxLarge,
    marginVertical: SIZES.small - 6,
    marginHorizontal: 4,
    height: 56,
  },
  searchIcon: {
    marginHorizontal: 10,
    color: COLORS.gray,
  },
  searchWrapper: {
    flex: 1,
    backgroundColor: COLORS.themeg,
    marginRight: 10,
    borderRadius: SIZES.medium,
  },
  searchInput: {
    fontFamily: "regular",
    width: "100%",
  },
  searchBtn: {
    width: 50,
    height: "100%",
    borderRadius: SIZES.medium,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: COLORS.primary,
  },
  tuning: { backgroundColor: COLORS.themew, padding: 7, borderRadius: SIZES.xxLarge },
});

export default styles;
