import { View } from "react-native";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BookListWidget, LOBookWidget } from "../widgets";
import { getMe } from "../entities";
import Header from "../shared/ui/Header";

export default function HomeScreen() {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                await getMe(dispatch);
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
        };

        fetchUser();
    }, [dispatch]);

    return (
        <View>
            <Header/>
            <LOBookWidget />
            <BookListWidget />
        </View>
    );
}
