import {myApi} from "../../../../shared";

export const resetPassword = async (data) => {
    const response = await myApi.post("/auth/reset-password", data);
    return response.data;
}