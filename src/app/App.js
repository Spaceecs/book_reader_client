import React, {useEffect, useState} from 'react';
import {Provider} from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './index';
import { MainNavigator } from './index';
import '../shared/config/i18n';
import {initDatabase} from "../shared";
import { View, ActivityIndicator } from 'react-native';

export default function App() {
    const [dbReady, setDbReady] = useState(false);
    useEffect(() => {
        (async () => {
            try {
                await initDatabase();
            } finally {
                setDbReady(true);
            }
        })();
    }, []);
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                {dbReady ? (
                    <MainNavigator />
                ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" />
                    </View>
                )}
            </PersistGate>
        </Provider>
    );
}
