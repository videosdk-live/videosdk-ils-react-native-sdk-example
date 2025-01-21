const API_BASE_URL = "https://api.videosdk.live/v2";

export const getToken = async () => {
  return process.env.EXPO_PUBLIC_VIDEOSDK_TOKEN;
};

export const createMeeting = async ({ token }) => {
  const url = `${API_BASE_URL}/rooms`;
  const options = {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
  };

  const { roomId } = await fetch(url, options)
    .then((response) => response.json())
    .catch((error) => console.error("error", error));

  console.log("room", roomId);
  return roomId;
};
