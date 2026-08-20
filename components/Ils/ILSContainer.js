import { useMeeting } from "@videosdk.live/react-native-sdk";
import { useEffect, useRef, useState } from "react";
import MeetingViewer from "./Speaker/MeetingViewer";
import WaitingToJoinView from "./Components/WaitingToJoinView";
import React from "react";

const safePin = async (participant) => {
  try {
    await participant?.pin?.("CAM");
  } catch (err) {
    console.error("pin() failed", err);
  }
};

const safeUnpin = async (participant) => {
  try {
    await participant?.unpin?.("CAM");
  } catch (err) {
    console.error("unpin() failed", err);
  }
};

export default function ILSContainer() {
  const [isJoined, setJoined] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const mMeeting = useMeeting({});

  const mMeetingRef = useRef();
  const hasLeftRef = useRef(false);

  useEffect(() => {
    mMeetingRef.current = mMeeting;
  }, [mMeeting]);

  const { join, leave, end } = useMeeting({
    onParticipantModeChanged: ({ mode, participantId }) => {
      const localParticipant = mMeetingRef.current?.localParticipant;
      if (participantId !== localParticipant?.id) return;
      if (mode === "SEND_AND_RECV") {
        safePin(localParticipant);
      } else {
        safeUnpin(localParticipant);
      }
    },
    onMeetingJoined: () => {
      const localParticipant = mMeetingRef.current?.localParticipant;
      if (localParticipant?.mode === "SEND_AND_RECV") {
        safePin(localParticipant);
      }
      setTimeout(() => {
        setJoined(true);
      }, 500);
    },
    onMeetingLeft: () => {
      hasLeftRef.current = true;
      setJoined(false);
    },
  });

  useEffect(() => {
    const joinTimeout = setTimeout(() => {
      (async () => {
        if (isJoined) return;
        try {
          await join();
        } catch (err) {
          console.error("join() failed", err);
        }
      })();
    }, 1000);

    return () => {
      clearTimeout(joinTimeout);
      if (hasLeftRef.current) return;
      (async () => {
        try {
          await leave();
        } catch (err) {
          console.error("leave() failed", err);
        }
      })();
    };
  }, []);

  // Phase 2: after MeetingViewer has unmounted (isJoined flipped to false),
  // fire the SDK leave/end call.
  useEffect(() => {
    if (!pendingAction || isJoined) return;
    (async () => {
      try {
        if (pendingAction === "end") {
          await end();
        } else {
          await leave();
        }
      } catch (err) {
        console.error(`${pendingAction}() failed`, err);
      }
    })();
  }, [pendingAction, isJoined, leave, end]);

  const handleRequestLeave = () => {
    setPendingAction("leave");
    setJoined(false);
  };

  const handleRequestEnd = () => {
    setPendingAction("end");
    setJoined(false);
  };

  return isJoined ? (
    <MeetingViewer
      onRequestLeave={handleRequestLeave}
      onRequestEnd={handleRequestEnd}
    />
  ) : (
    <WaitingToJoinView />
  );
}
