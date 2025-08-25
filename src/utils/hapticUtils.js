import { Haptics, ImpactStyle } from "@capacitor/haptics";

export const hapticFeedback = async () => {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (error) {
    // Haptics not available on this platform
    console.log("Haptics not available:", error);
  }
};
