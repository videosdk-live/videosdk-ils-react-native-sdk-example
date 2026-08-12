// Disable RN/Expo autolinking for @videosdk.live/react-native-webrtc on Android.
// The @videosdk.live/expo-config-plugin already adds it manually as `:rnwebrtc` in
// android/settings.gradle for Expo SDK < 54. Without this override, autolinking
// registers the same package a second time as `:videosdk.live_react-native-webrtc`,
// causing colliding resource-generation tasks and Gradle's implicit-dependency
// validation error.
module.exports = {
  dependencies: {
    "@videosdk.live/react-native-webrtc": {
      platforms: {
        android: null,
      },
    },
  },
};
