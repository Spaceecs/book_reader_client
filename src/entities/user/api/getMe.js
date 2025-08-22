// entities/user/api/getMe.ts
import { myApi } from "../../../shared";
import { setUser } from "../model/userSlice";

export const getMe = async (dispatch) => {
    try {
        const response = await myApi.get('/auth/me');
        console.log(response.data);
        dispatch(setUser(response.data));
    } catch (error) {
        console.error('Помилка при отриманні користувача:', error);
        throw error;
    }
};
