import { Dimensions } from "react-native";
const { height, width } = Dimensions.get("window");

const COLORS = {
  primary: "#0bab7c",
  secondary: "#e6d270",
  tertiary: "#FF7754",

  warning: "rgba(252, 18, 52, 0.3)",
  info: "rgba(14, 0, 255, 0.3)",
  success: "rgba(42, 77, 80, 0.6)",

  gray: "#83829A",
  gray2: "#C1C0C8",

  offwhite: "#F3F4F8",
  white: "#FFFFFF",
  black: "#000000",
  red: "#e81e4d",
  green: "#00C135",
  lightWhite: "#FAFAFC",

  themey: "#0BAB7D",
  themek: "#0bab7c",
  themeg: "#F0F5F9",
  themeb: "#000",
  themew: "#fff",
  themel: "#BABDB6",
  hyperlight: "#F0F5F9",
};

const SIZES = {
  xxSmall: 6,
  xSmall: 10,
  small: 12,
  medium: 16,
  large: 20,
  xLarge: 24,
  xxLarge: 44,
  height,
  width,
};

const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5.84,
    elevation: 5,
  },
};

export { COLORS, SIZES, SHADOWS };
