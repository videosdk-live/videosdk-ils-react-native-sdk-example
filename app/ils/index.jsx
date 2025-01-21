import React from "react";
import { SafeAreaView } from "react-native";
import colors from "../../constants/Colors";
import {
  MeetingProvider,
  MeetingConsumer,
} from "@videosdk.live/react-native-sdk";
import ILSContainer from "../../components/Ils/ILSContainer";
import { router, Stack, useLocalSearchParams } from "expo-router";

export default function Meeting() {
  const params = useLocalSearchParams();

  const token = params.token;
  const meetingId = params.meetingId;
  const micEnabled = params.micEnabled ? params.webcamEnabled : false;
  const webcamEnabled = params.webcamEnabled ? params.webcamEnabled : false;
  const name = params.name ? params.name : "Test User";
  const mode = params.mode ? params.mode : "SEND_AND_RECV";

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
          {() => {
            return <ILSContainer webcamEnabled={webcamEnabled} />;
          }}
        </MeetingConsumer>
      </MeetingProvider>
    </SafeAreaView>
  );
}
