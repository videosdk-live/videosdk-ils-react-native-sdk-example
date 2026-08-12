import { NativeModules, NativeEventEmitter, Platform } from "react-native";

const { VideosdkRPK } = NativeModules;

const emitter =
  Platform.OS === "ios" && VideosdkRPK
    ? new NativeEventEmitter(VideosdkRPK)
    : null;

const VideosdkBridge = {
  startBroadcast: () =>
    Platform.OS === "ios" ? VideosdkRPK?.startBroadcast() : undefined,
  addListener: (callback) =>
    emitter ? emitter.addListener("onScreenShare", callback) : null,
  removeListener: (subscription) => subscription?.remove?.(),
};

export default VideosdkBridge;
