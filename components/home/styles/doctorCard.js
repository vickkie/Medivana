import { StyleSheet } from "react-native";
import { COLORS, SIZES, FONTS } from "../../../constants";

export default StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.radius,
    padding: SIZES.xSmall - 5,
    marginBottom: SIZES.medium,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.lightWhite,
    borderRadius: SIZES.medium,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: SIZES.small,
    overflow: "hidden",
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 50,
    resizeMode: "contain",
    borderRadius: SIZES.small,
    backgroundColor: COLORS.themew,
  },
  info: {
    flex: 1,
    marginLeft: SIZES.medium,
  },
  name: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  speciality: {
    ...FONTS.body4,
    color: COLORS.gray,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  fee: {
    ...FONTS.h5,
    color: COLORS.primary,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: SIZES.small,
  },
  ratingText: {
    marginLeft: 4,
    color: COLORS.text,
    ...FONTS.body5,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: SIZES.radius,
  },
  bookButtonText: {
    color: COLORS.white,
    ...FONTS.button,
  },
});
