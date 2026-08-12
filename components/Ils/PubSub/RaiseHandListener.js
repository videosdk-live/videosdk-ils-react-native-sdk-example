import { usePubSub } from "@videosdk.live/react-native-sdk";
import Toast from "react-native-simple-toast";

export default function RaiseHandListener() {
  usePubSub("RAISE_HAND", {
    onMessageReceived: (data) => {
      Toast.show(`${data?.senderName ?? "Someone"} raised hand 🖐🏼`);
    },
  });
  return null;
}
