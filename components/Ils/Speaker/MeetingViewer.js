import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Clipboard,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  Constants,
  createScreenShareVideoTrack,
  useMediaDevice,
  useRoom,
} from "@videosdk.live/react-native-sdk";
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
import Toast from "react-native-simple-toast";
import { MemoizedParticipantGrid } from "./ParticipantGrid";
import { useOrientation } from "../../../utils/useOrientation";
import ChatViewer from "../Components/ChatViewer";
import { convertRFValue } from "../../../constants/spacing";

export default function MeetingViewer({ onRequestLeave, onRequestEnd }) {
  const {
    localParticipant,
    participants,
    isCamEnabled,
    isMicEnabled,
    toggleCam,
    toggleMic,
    presenterId,
    isScreenSharing,
    roomId,
    changeMode,
    enableScreenShare,
    disableScreenShare,
  } = useRoom({
    onError: (data) => {
      const { code, message } = data;
      Toast.show(`Error: ${code}: ${message}`);
    },
  });

  const { requestPermission } = useMediaDevice();

  const leaveMenu = useRef();
  const bottomSheetRef = useRef();

  const orientation = useOrientation();

  const [bottomSheetView, setBottomSheetView] = useState("");

  const _handleILS = async () => {
    try {
      if (localParticipant.mode === "SEND_AND_RECV") {
        await changeMode("RECV_ONLY");
      } else {
        // A host publishes camera and mic, so ask before switching mode
        await requestPermission(Constants.permission.AUDIO_AND_VIDEO);
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
              {roomId ? roomId : "xxx - xxx - xxx"}
            </Text>

            <TouchableOpacity
              style={{
                justifyContent: "center",
                marginLeft: 10,
              }}
              onPress={() => {
                Clipboard.setString(roomId);
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
        {presenterId && !isScreenSharing ? (
          <RemoteParticipantPresenter presenterId={presenterId} />
        ) : presenterId && isScreenSharing ? (
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
            backgroundColor={!isMicEnabled ? colors.primary[100] : "transparent"}
            onPress={async () => {
              try {
                await toggleMic();
              } catch (err) {
                console.error("toggleMic failed", err);
              }
            }}
            Icon={() => {
              return isMicEnabled ? (
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
              !isCamEnabled ? colors.primary[100] : "transparent"
            }
            onPress={async () => {
              try {
                await toggleCam();
              } catch (err) {
                console.error("toggleCam failed", err);
              }
            }}
            Icon={() => {
              return isCamEnabled ? (
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
              if (presenterId != null && !isScreenSharing) return;
              try {
                if (isScreenSharing) {
                  await disableScreenShare();
                } else {
                  // iOS shows the broadcast picker, Android asks for screen-capture consent
                  await enableScreenShare(await createScreenShareVideoTrack());
                }
              } catch (err) {
                console.error("screen share toggle failed", err);
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
