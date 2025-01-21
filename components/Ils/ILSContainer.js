import {
  useMeeting,
  ReactNativeForegroundService,
} from "@videosdk.live/react-native-sdk";
import { useEffect, useRef, useState } from "react";
import MeetingViewer from "./Speaker/MeetingViewer";
import WaitingToJoinView from "./Components/WaitingToJoinView";
import React from "react";
import Orientation from "react-native-orientation-locker";

export default function ILSContainer({ webcamEnabled }) {
  const [isJoined, setJoined] = useState(false);

  const mMeeting = useMeeting({});

  const mMeetingRef = useRef();

  useEffect(() => {
    mMeetingRef.current = mMeeting;
  }, [mMeeting]);

  const { join, changeWebcam, leave } = useMeeting({
    onParticipantModeChanged: ({ mode, participantId }) => {
      const localParticipant = mMeetingRef.current?.localParticipant;
      if (participantId === localParticipant.id) {
        if (mode === "SEND_AND_RECV") {
          localParticipant.pin();
        } else {
          localParticipant.unpin();
        }
      }
    },
    onMeetingJoined: () => {
      const localParticipant = mMeetingRef.current?.localParticipant;
      const meetingMode = localParticipant.mode;
      if (meetingMode === "SEND_AND_RECV") {
        localParticipant.pin();
      }
      setTimeout(() => {
        setJoined(true);
      }, 500);
    },
  });

  useEffect(() => {
    setTimeout(() => {
      if (!isJoined) {
        join();
        if (webcamEnabled) {
          changeWebcam();
        }
      }
    }, 1000);

    return () => {
      leave();
      ReactNativeForegroundService.stopAll();
    };
  }, []);

  return isJoined ? <MeetingViewer /> : <WaitingToJoinView />;
}
