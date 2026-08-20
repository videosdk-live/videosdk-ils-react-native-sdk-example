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

  try {
    const response = await fetch(url, options);
    const body = await response.json();
    if (!response.ok) return undefined;
    return body.roomId;
  } catch {
    return undefined;
  }
};
