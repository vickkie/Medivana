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
    minHeight: 170,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: SIZES.small,
    overflow: "hidden",
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  speciality: {
    fontFamily: "light",
    color: COLORS.gray,
  },
  avatarImage: {
    width: 160,
    height: 160,
    resizeMode: "contain",
    borderRadius: SIZES.small,
    backgroundColor: COLORS.themew,
  },
  info: {
    flex: 1,
    gap: SIZES.xSmall - 5,
    marginLeft: SIZES.medium,
  },
  name: {
    ...FONTS.h3,
    fontFamily: "bold",
    textTransform: "capitalize",
    color: COLORS.text,
  },
  speciality: {
    ...FONTS.body4,
    color: COLORS.gray,
  },

  fee: {
    ...FONTS.h5,
    fontWeight: "bold",
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
    backgroundColor: COLORS.themeg,
    paddingVertical: 6,
    marginStart: -SIZES.xSmall,
    paddingHorizontal: 10,
    borderRadius: SIZES.xxLarge,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  bookButtonText: {
    color: COLORS.themey,
    fontFamily: "bold",
    textTransform: "capitalize",
    textAlign: "center",
    fontSize: SIZES.large,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.xSmall - 5,
  },
});
