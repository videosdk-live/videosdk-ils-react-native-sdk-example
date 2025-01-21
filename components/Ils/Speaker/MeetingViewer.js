import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Text,
  Clipboard,
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert,
} from "react-native";
import { useMeeting, usePubSub } from "@videosdk.live/react-native-sdk";
import {
  CallEnd,
  Chat,
  Copy,
  EndForAll,
  Leave,
  MicOff,
  MicOn,
  Participants,
  ScreenShare,
  VideoOff,
  VideoOn,
} from "../../../assets/icons";
import colors from "../../../constants/Colors";
import IconContainer from "../../../components/IconContainer";
import LocalParticipantPresenter from "../Components/LocalParticipantPresenter";
import Menu from "../../../components/Menu";
import MenuItem from "../Components/MenuItem";
import BottomSheet from "../../../components/BottomSheet";
import ParticipantListViewer from "../Components/ParticipantListViewer";
import ParticipantView from "./ParticipantView";
import RemoteParticipantPresenter from "./RemoteParticipantPresenter";
// import VideosdkRPK from "../../../VideosdkRPK";
import Toast from "react-native-simple-toast";

const MemoizedParticipant = React.memo(
  ParticipantView,
  ({ participantId }, { participantId: oldParticipantId }) =>
    participantId === oldParticipantId
);
import { MemoizedParticipantGrid } from "./ParticipantGrid";
import { useOrientation } from "../../../utils/useOrientation";
import ChatViewer from "../Components/ChatViewer";
import { convertRFValue } from "../../../constants/spacing";

export default function MeetingViewer() {
  const {
    localParticipant,
    participants,
    pinnedParticipants,
    localWebcamOn,
    localMicOn,
    leave,
    end,
    toggleWebcam,
    toggleMic,
    presenterId,
    localScreenShareOn,
    toggleScreenShare,
    meetingId,
    activeSpeakerId,
    changeMode,
    enableScreenShare,
    disableScreenShare,
  } = useMeeting({
    onError: (data) => {
      const { code, message } = data;
      Toast.show(`Error: ${code}: ${message}`);
    },
  });

  const leaveMenu = useRef();
  const bottomSheetRef = useRef();

  const orientation = useOrientation();

  const [bottomSheetView, setBottomSheetView] = useState("");

  useEffect(() => {
    console.log("participants 12", participants.keys());
  }, [participants]);

  // const participantIds = useMemo(() => {
  //   const participantMap = new Map(participants);

  //   const IDS = new Set();

  //   for (const [key, value] of participantMap.entries()) {
  //     if (value.mode === "SEND_AND_RECV") {
  //       IDS.add(key);
  //     }
  //   }
  //   const ids = participantMap.entries().reduce((acc, [key, value]) => {
  //     if (value.mode === "SEND_AND_RECV") {
  //       acc.add(key);
  //     }
  //     return acc;
  //   }, new Set());

  //   const IDSArray = Array.from(ids);
  //   return IDSArray;
  // }, [participants, activeSpeakerId, presenterId]);

  usePubSub("RAISE_HAND", {
    onMessageReceived: (data) => {
      const { senderName } = data;
      Toast.show(`${senderName} raised hand 🖐🏼`);
    },
  });

  // useEffect(() => {
  //   if (Platform.OS == "ios") {
  //     VideosdkRPK.addListener("onScreenShare", (event) => {
  //       if (event === "START_BROADCAST") {
  //         enableScreenShare();
  //       } else if (event === "STOP_BROADCAST") {
  //         disableScreenShare();
  //       }
  //     });

  //     return () => {
  //       VideosdkRPK.removeAllListeners("onScreenShare");
  //     };
  //   }
  // }, []);

  const _handleILS = () => {
    if (localParticipant.mode === "SEND_AND_RECV") {
      changeMode("RECV_ONLY");
    } else {
      changeMode("SEND_AND_RECV");
    }
  };

  usePubSub(`CHANGE_MODE_${localParticipant.id}`, {
    onMessageReceived: (data) => {
      const { message } = data;
      if (message.mode === "RECV_ONLY") {
        changeMode("RECV_ONLY");
      } else if (message.mode === "SEND_AND_RECV") {
        // changeMode("SEND_AND_RECV");
        Alert.alert(
          "Change Mode",
          "Host has requested to become co-host. Do you want to accept?",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel",
            },
            {
              text: "OK",
              onPress: () => changeMode("SEND_AND_RECV"),
            },
          ],
          { cancelable: false }
        );
      }
    },
  });

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <Text
              style={{
                fontSize: 16,
                color: colors.primary[100],
              }}
            >
              {meetingId ? meetingId : "xxx - xxx - xxx"}
              {presenterId}
            </Text>

            <TouchableOpacity
              style={{
                justifyContent: "center",
                marginLeft: 10,
              }}
              onPress={() => {
                Clipboard.setString(meetingId);
                Toast.show("Meeting Id copied Successfully");
              }}
            >
              <Copy fill={colors.primary[100]} width={18} height={18} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={() => {
              _handleILS();
            }}
            activeOpacity={1}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginHorizontal: 8,
              padding: 10,
              borderRadius: 8,
              borderWidth: 1.5,
              borderColor: "#eee",
            }}
          >
            <Text
              style={{
                fontSize: convertRFValue(12),
                color: colors.primary[100],
              }}
            >
              {localParticipant.mode === "SEND_AND_RECV"
                ? "Switch as Audience"
                : "Switch as Host"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setBottomSheetView("PARTICIPANT_LIST");
              bottomSheetRef.current.show();
            }}
            activeOpacity={1}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8,
              width: 60,
              borderRadius: 8,
              borderWidth: 1.5,
              borderColor: "#2B3034",
            }}
          >
            <Participants height={20} width={20} fill={colors.primary[100]} />
            <Text
              style={{
                fontSize: convertRFValue(12),
                color: colors.primary[100],
                marginLeft: 4,
              }}
            >
              {participants ? [...participants.keys()].length : 1}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Center */}
      <View
        style={{
          flex: 1,
          flexDirection: orientation == "PORTRAIT" ? "column" : "row",
          marginVertical: 12,
        }}
      >
        {presenterId && !localScreenShareOn ? (
          <RemoteParticipantPresenter presenterId={presenterId} />
        ) : presenterId && localScreenShareOn ? (
          <LocalParticipantPresenter />
        ) : null}
        <MemoizedParticipantGrid
          participantIds={[...participants.values()].reduce(
            (acc, participant) => {
              if (participant.mode === "SEND_AND_RECV") {
                acc.push(participant.id);
              }
              return acc;
            },
            []
          )}
          isPresenting={presenterId != null}
        />
      </View>
      <Menu
        ref={leaveMenu}
        menuBackgroundColor={colors.primary[700]}
        placement="left"
      >
        <MenuItem
          title={"Leave"}
          description={"Only you will leave the call"}
          icon={<Leave width={22} height={22} />}
          onPress={() => {
            leave();
          }}
        />
        <View
          style={{
            height: 1,
            backgroundColor: colors.primary["600"],
          }}
        />
        <MenuItem
          title={"End"}
          description={"End call for all participants"}
          icon={<EndForAll />}
          onPress={() => {
            end();
          }}
        />
      </Menu>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
        }}
      >
        <IconContainer
          backgroundColor={"red"}
          Icon={() => {
            return <CallEnd height={26} width={26} fill="#FFF" />;
          }}
          onPress={() => {
            leaveMenu.current.show();
          }}
        />
        {localParticipant.mode === "SEND_AND_RECV" && (
          <IconContainer
            style={{
              borderWidth: 1.5,
              borderColor: "#2B3034",
            }}
            backgroundColor={!localMicOn ? colors.primary[100] : "transparent"}
            onPress={() => {
              toggleMic();
            }}
            Icon={() => {
              return localMicOn ? (
                <MicOn height={24} width={24} fill="#FFF" />
              ) : (
                <MicOff height={28} width={28} fill="#1D2939" />
              );
            }}
          />
        )}
        {localParticipant.mode === "SEND_AND_RECV" && (
          <IconContainer
            style={{
              borderWidth: 1.5,
              borderColor: "#2B3034",
            }}
            backgroundColor={
              !localWebcamOn ? colors.primary[100] : "transparent"
            }
            onPress={() => {
              toggleWebcam();
            }}
            Icon={() => {
              return localWebcamOn ? (
                <VideoOn height={24} width={24} fill="#FFF" />
              ) : (
                <VideoOff height={36} width={36} fill="#1D2939" />
              );
            }}
          />
        )}
        <IconContainer
          onPress={() => {
            setBottomSheetView("CHAT");
            bottomSheetRef.current.show();
          }}
          style={{
            borderWidth: 1.5,
            borderColor: "#2B3034",
          }}
          Icon={() => {
            return <Chat height={22} width={22} fill="#FFF" />;
          }}
        />
        {localParticipant.mode === "SEND_AND_RECV" && (
          <IconContainer
            style={{
              borderWidth: 1.5,
              borderColor: "#2B3034",
            }}
            onPress={() => {
              if (presenterId == null || localScreenShareOn) {
                // Platform.OS === "android"
                toggleScreenShare();
                // : VideosdkRPK.startBroadcast();
              }
            }}
            Icon={() => {
              return <ScreenShare height={22} width={22} fill="#FFF" />;
            }}
          />
        )}
      </View>
      <BottomSheet
        sheetBackgroundColor={"#2B3034"}
        draggable={false}
        radius={12}
        hasDraggableIcon
        closeFunction={() => {
          setBottomSheetView("");
        }}
        ref={bottomSheetRef}
        height={Dimensions.get("window").height * 0.5}
      >
        {bottomSheetView === "CHAT" ? (
          <ChatViewer raiseHandVisible={false} />
        ) : bottomSheetView === "PARTICIPANT_LIST" ? (
          <ParticipantListViewer participantIds={[...participants.keys()]} />
        ) : null}
      </BottomSheet>
    </>
  );
}
