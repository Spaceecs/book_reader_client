import { myApi } from "../../../../shared";

export const forgotPassword = async (data) => {
    const request = {
        email: data
    }
    const response = await myApi.post("/auth/forgot-password", request);
    return response.data;
}