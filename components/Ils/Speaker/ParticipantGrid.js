import React, { useRef, useState } from "react";
import { View, Dimensions, ActivityIndicator, Text } from "react-native";
import BottomSheet from "../../../components/BottomSheet";
import { useOrientation } from "../../../utils/useOrientation";
import ParticipantView from "./ParticipantView";
import PauseInvisibleParticipants from "./PauseInvisibleParticipant";

const MemoizedParticipant = React.memo(
  ParticipantView,
  (
    { participantId, quality, key, openStatsBottomSheet },
    {
      participantId: oldParticipantId,
      quality: oldQuality,
      key: oldkey,
      openStatsBottomSheet: oldopenStatsBottomSheet,
    }
  ) =>
    participantId === oldParticipantId &&
    quality === oldQuality &&
    key === oldkey &&
    openStatsBottomSheet === oldopenStatsBottomSheet
);

function ParticipantGrid({ participantIds, isPresenting }) {
  const orientation = useOrientation();
  const participantCount = participantIds.length;
  const perRow = isPresenting ? 2 : participantCount >= 3 ? 2 : 1;
  const quality =
    participantCount > 4 ? "low" : participantCount > 2 ? "med" : "high";
  const bottomSheetRef = useRef();
  const [participantId, setParticipantId] = useState("");

  const openStatsBottomSheet = ({ pId }) => {
    setParticipantId(pId);
    bottomSheetRef.current.show();
  };

  return (
    <>
      {/* <PauseInvisibleParticipants visibleParticipantIds={participantIds} /> */}
      {participantIds.length > 0 ? (
        Array.from({ length: Math.ceil(participantCount / perRow) }, (_, i) => {
          return (
            <View
              key={i}
              style={{
                flex: 1,
                flexDirection: orientation == "PORTRAIT" ? "row" : "column",
              }}
            >
              {participantIds
                .slice(i * perRow, (i + 1) * perRow)
                .map((participantId) => {
                  return (
                    <MemoizedParticipant
                      key={participantId}
                      participantId={participantId}
                      quality={quality}
                      openStatsBottomSheet={openStatsBottomSheet}
                    />
                  );
                })}
            </View>
          );
        })
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "white", fontSize: 20 }}>
            Waiting for the Host to join.
          </Text>
        </View>
      )}
    </>
  );
}

export const MemoizedParticipantGrid = React.memo(
  ParticipantGrid,
  (
    { participantIds, isPresenting },
    { participantIds: oldParticipantIds, isPresenting: oldIsPresenting }
  ) =>
    JSON.stringify(participantIds) === JSON.stringify(oldParticipantIds) &&
    isPresenting === oldIsPresenting
);
