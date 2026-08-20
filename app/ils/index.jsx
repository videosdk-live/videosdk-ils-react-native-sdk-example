import React, { useEffect, useState } from "react";
import {
  Linking,
  Platform,
  PermissionsAndroid,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../constants/Colors";
import {
  MeetingProvider,
  MeetingConsumer,
} from "@videosdk.live/react-native-sdk";
import ILSContainer from "../../components/Ils/ILSContainer";
import { router, Stack, useLocalSearchParams } from "expo-router";

const requestPermissions = async () => {
  if (Platform.OS !== "android") return true;
  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    ]);
    // MeetingProvider only truly needs RECORD_AUDIO + CAMERA to unblock
    // InCallManager.getDeviceInfo(). POST_NOTIFICATIONS is nice-to-have.
    return (
      granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      granted[PermissionsAndroid.PERMISSIONS.CAMERA] ===
        PermissionsAndroid.RESULTS.GRANTED
    );
  } catch {
    return false;
  }
};

export default function Meeting() {
  const params = useLocalSearchParams();

  const token = params.token;
  const meetingId = params.meetingId;
  // useLocalSearchParams returns everything as strings; coerce booleans.
  const micEnabled = params.micEnabled === "true";
  const webcamEnabled = params.webcamEnabled === "true";
  const name = params.name ? params.name : "Test User";
  const mode = params.mode ? params.mode : "SEND_AND_RECV";

  const [permissionsGranted, setPermissionsGranted] = useState(
    Platform.OS === "android" ? null : true,
  );

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const granted = await requestPermissions();
      if (isMounted) setPermissionsGranted(granted);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  if (Platform.OS === "android" && permissionsGranted === null) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.primary[900] }}
      >
        <Stack.Screen options={{ headerShown: false }} />
      </SafeAreaView>
    );
  }

  // Wait for Android runtime permissions before mounting MeetingProvider.
  // Without RECORD_AUDIO granted, InCallManager.getDeviceInfo() (called inside
  // MeetingProvider) never resolves and the provider renders <> forever.
  if (Platform.OS === "android" && !permissionsGranted) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.primary[900],
          padding: 24,
          justifyContent: "center",
        }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <Text
          style={{
            color: colors.primary[100],
            fontSize: 18,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Camera & Microphone permission required
        </Text>
        <Text
          style={{
            color: colors.primary[300] ?? "#9A9FA5",
            fontSize: 14,
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Tap Retry and grant both when the system dialog appears. If nothing
          appears, open Settings → Apps → this app → Permissions and enable
          Camera and Microphone.
        </Text>
        <TouchableOpacity
          onPress={async () => {
            const granted = await requestPermissions();
            setPermissionsGranted(granted);
          }}
          style={{
            backgroundColor: "#5568FE",
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            alignSelf: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
            Retry
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            Linking.openSettings();
          }}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 24,
            alignSelf: "center",
            marginTop: 12,
          }}
        >
          <Text style={{ color: "#5568FE", fontSize: 14 }}>Open Settings</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.primary[900], padding: 12 }}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <MeetingProvider
        config={{
          meetingId,
          micEnabled: micEnabled,
          webcamEnabled: webcamEnabled,
          name,
          mode, // "SEND_AND_RECV" || "RECV_ONLY"
          notification: {
            title: "Video SDK Live Stream",
            message: "Live stream is running.",
          },
          defaultCamera:"front"
        }}
        token={token}
      >
        <MeetingConsumer
          {...{
            onMeetingLeft: () => {
              router.dismissAll();
            },
          }}
        >
          {() => <ILSContainer webcamEnabled={webcamEnabled} />}
        </MeetingConsumer>
      </MeetingProvider>
    </SafeAreaView>
  );
}
