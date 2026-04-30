import axiosInstance from "./axiosInstance";

export const authApi = {
  sendOTP: async (phone_number: string) => { const res = await axiosInstance.post("/auth/send-otp", { phone_number }); return res.data; },

  signup: async (payload: any) => {
    const res = await axiosInstance.post("/auth/signup", payload);
    return res.data;
  },

  signin: async (payload: any) => {
    const res = await axiosInstance.post("/auth/signin", payload);
    return res.data;
  },

  refreshToken: async (refresh_token: string) => {
    const res = await axiosInstance.post("/auth/refresh-token", {
      refresh_token,
    });
    return res.data;
  },

  logout: async (refresh_token: string) => {
    const res = await axiosInstance.post("/auth/logout", { refresh_token });
    return res.data;
  },

  getUserDetails: async () => {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  },
};
