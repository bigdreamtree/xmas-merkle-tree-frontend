import { axiosClient } from "./axios-client";

export const request = async () => {
  await axiosClient.get("/");
};
