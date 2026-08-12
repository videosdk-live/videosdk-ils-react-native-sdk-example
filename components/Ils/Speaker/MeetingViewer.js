import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Clipboard,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { useMeeting } from "@videosdk.live/react-native-sdk";
import RaiseHandListener from "../PubSub/RaiseHandListener";
import ChangeModeListener from "../PubSub/ChangeModeListener";
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
import RemoteParticipantPresenter from "./RemoteParticipantPresenter";
import VideosdkRPK from "../../../VideosdkRPK";
import Toast from "react-native-simple-toast";
import { MemoizedParticipantGrid } from "./ParticipantGrid";
import { useOrientation } from "../../../utils/useOrientation";
import ChatViewer from "../Components/ChatViewer";
import { convertRFValue } from "../../../constants/spacing";

export default function MeetingViewer({ onRequestLeave, onRequestEnd }) {
  const {
    localParticipant,
    participants,
    localWebcamOn,
    localMicOn,
    toggleWebcam,
    toggleMic,
    presenterId,
    localScreenShareOn,
    toggleScreenShare,
    meetingId,
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
    if (Platform.OS !== "ios") return;
    const subscription = VideosdkRPK.addListener(async (event) => {
      try {
        if (event === "START_BROADCAST") {
          await enableScreenShare();
        } else if (event === "STOP_BROADCAST") {
          await disableScreenShare();
        }
      } catch (err) {
        console.error("iOS screen share toggle failed", err);
      }
    });

    return () => {
      VideosdkRPK.removeListener(subscription);
    };
  }, [enableScreenShare, disableScreenShare]);

  const _handleILS = async () => {
    try {
      if (localParticipant.mode === "SEND_AND_RECV") {
        await changeMode("RECV_ONLY");
      } else {
        await changeMode("SEND_AND_RECV");
      }
    } catch (err) {
      console.error("changeMode failed", err);
    }
  };

  return (
    <>
      <RaiseHandListener />
      <ChangeModeListener
        localParticipantId={localParticipant.id}
        changeMode={changeMode}
      />
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
          flexDirection: orientation === "PORTRAIT" ? "column" : "row",
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
            [],
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
            leaveMenu.current?.close?.();
            onRequestLeave?.();
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
            leaveMenu.current?.close?.();
            onRequestEnd?.();
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
            onPress={async () => {
              try {
                await toggleMic();
              } catch (err) {
                console.error("toggleMic failed", err);
              }
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
            onPress={async () => {
              try {
                await toggleWebcam();
              } catch (err) {
                console.error("toggleWebcam failed", err);
              }
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
            onPress={async () => {
              if (presenterId != null && !localScreenShareOn) return;
              try {
                if (Platform.OS === "ios") {
                  if (localScreenShareOn) {
                    await toggleScreenShare();
                  } else {
                    VideosdkRPK.startBroadcast();
                  }
                } else {
                  await toggleScreenShare();
                }
              } catch (err) {
                console.error("toggleScreenShare failed", err);
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
