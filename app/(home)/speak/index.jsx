import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import TextInputContainer from "../../../components/TextInputContainer";
import Button from "../../../components/Button";
import colors from "../../../constants/Colors";
import { getToken } from "../../../api/api";
import { router, Stack } from "expo-router";

export default function Viewer_Home() {
  const [name, setName] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [token, setToken] = useState("");

  React.useEffect(() => {
    (async () => {
      const token = await getToken();
      setToken(token);
    })();
  }, []);

  const naviagateToViewer = () => {
    router.push({
      pathname: "/ils",
      params: {
        name: name.trim(),
        token: token,
        meetingId: meetingId,
        mode: "RECV_ONLY",
      },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{
        flex: 1,
        backgroundColor: colors.primary["900"],
      }}
    >
      <Stack.Screen
        options={{
          title: "Join as a viewer",
        }}
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: colors.primary["900"],
            justifyContent: "center",
          }}
        >
          <View style={{ marginHorizontal: 32 }}>
            <TextInputContainer
              placeholder={"Enter meeting code"}
              value={meetingId}
              setValue={setMeetingId}
            />
            <TextInputContainer
              placeholder={"Enter your name"}
              value={name}
              setValue={setName}
            />
            <Button
              text={"Join as a viewer"}
              onPress={() => naviagateToViewer()}
            />
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
