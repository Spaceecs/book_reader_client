import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './index';
import { MainNavigator } from './index';
import '../shared/config/i18n';
import { initDatabase } from "../shared";
import { ActivityIndicator, View } from "react-native";

export default function App() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                await initDatabase();
            } catch (err) {
                console.error("DB init error:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <MainNavigator />
            </PersistGate>
        </Provider>
    );
}
