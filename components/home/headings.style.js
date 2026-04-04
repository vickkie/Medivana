import { StyleSheet, Text, View } from "react-native";
import { COLORS, SIZES } from "../../constants";

const styles = StyleSheet.create({
  container: {
    marginTop: SIZES.medium,
    marginBottom: SIZES.small,
    marginHorizontal: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontFamily: "regular",
    fontSize: SIZES.medium + 4,
    color: COLORS.black,
  },
  seeAll: {
    fontFamily: "bold",
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
});

export default styles;
