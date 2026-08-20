import { usePubSub } from "@videosdk.live/react-native-sdk";
import { Alert } from "react-native";

export default function ChangeModeListener({ localParticipantId, changeMode }) {
  usePubSub(`CHANGE_MODE_${localParticipantId}`, {
    onMessageReceived: (data) => {
      const requestedMode = data?.payload?.mode;
      if (requestedMode === "RECV_ONLY") {
        (async () => {
          try {
            await changeMode("RECV_ONLY");
          } catch (err) {
            console.error("changeMode failed", err);
          }
        })();
      } else if (requestedMode === "SEND_AND_RECV") {
        Alert.alert(
          "Change Mode",
          "Host has requested to become co-host. Do you want to accept?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "OK",
              onPress: async () => {
                try {
                  await changeMode("SEND_AND_RECV");
                } catch (err) {
                  console.error("changeMode failed", err);
                }
              },
            },
          ],
          { cancelable: false },
        );
      }
    },
  });
  return null;
}
