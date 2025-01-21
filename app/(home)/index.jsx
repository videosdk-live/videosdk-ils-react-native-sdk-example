import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import React from "react";
import Colors from "../../constants/Colors";
import Button from "../../components/Button";
import { router, Stack } from "expo-router";
export default function HomeScreen() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.primary["900"],
      }}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View
        style={{
          flex: 1,
          marginHorizontal: 22,
          justifyContent: "center",
        }}
      >
        <Button
          text={"Create live stream"}
          onPress={() => {
            router.push({
              pathname: "/(home)/speaker",
              params: {
                isCreator: true,
              },
            });
          }}
        />

        <View
          style={{
            alignSelf: "center",
            flexDirection: "row",
            marginVertical: 16,
          }}
        >
          <Text
            style={{
              color: "#202427",
              fontWeight: "bold",
            }}
          >
            ──────────
          </Text>
          <Text
            style={{
              color: "#ffff",
              fontWeight: "bold",
              marginHorizontal: 6,
            }}
          >
            OR
          </Text>
          <Text
            style={{
              color: "#202427",
              fontWeight: "bold",
            }}
          >
            ──────────
          </Text>
        </View>
        <Button
          text={"Join as a speaker"}
          onPress={() => {
            router.push({
              pathname: "/(home)/speaker",
              params: {
                isCreator: false,
              },
            });
          }}
        />
        <Button
          text={"Join as a viewer"}
          onPress={() => {
            router.push({
              pathname: "/(home)/viewer",
              params: {
                meetingId: "lv95-q3kl-p544",
                name: "Bhavesh",
                token: "123456",
              },
            });
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
