import {View} from "react-native";
import {Button, Label} from "../shared";
import {useDispatch} from "react-redux";
import {useEffect, useState} from "react";
import {selectLogin} from "../entities";

export default function SettingsScreen() {
    const dispatch = useDispatch();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const user =  dispatch(selectLogin())
        setUser(user);
    })
    return(
        <View>
            <Label>{user}</Label>

            <Button onPress={() => logout()}></Button>
        </View>
    )
}