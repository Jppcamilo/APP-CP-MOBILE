import { StyleSheet } from "react-native";

export const colors = {
  background: "#F2F1ED",
  white: "#FFFFFF",
  text: "#191B18",
  muted: "#7B7E75",
  dark: "#20241F",
  purple: "#6957FF",
  lilac: "#EEEAFF",
  border: "#E6E5DF",
  green: "#20835B",
  red: "#CF5148",
};

export const shared = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 18,
  },
  title: {
    fontSize: 21,
    fontWeight: "700",
    color: colors.text,
  },
  muted: {
    color: colors.muted,
    fontSize: 14,
  },
  link: {
    color: colors.purple,
    fontSize: 15,
    fontWeight: "600",
  },
});