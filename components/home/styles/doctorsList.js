import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "../../../constants";

export default StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: SIZES.large,
    backgroundColor: COLORS.themew,
  },
  listContent: {
    padding: 6,
    paddingBottom: SIZES.large,
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messageText: {
    fontSize: SIZES.large,
    color: COLORS.text,
    fontFamily: "medium",
    marginBottom: SIZES.small,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    gap: 4,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
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
});
