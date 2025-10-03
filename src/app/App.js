import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './index';
import { MainNavigator } from './index';
import '../shared/config/i18n';
import {cleanupExpiredLocalBooks, cleanupExpiredOnlineBooks, initDatabase} from "../shared";
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
    const [dbReady, setDbReady] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                await initDatabase();
                await cleanupExpiredLocalBooks();
                await cleanupExpiredOnlineBooks();
            } finally {
                setDbReady(true);
            }
        })();
    }, []);

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <SafeAreaView style={{ flex: 1 }}>
                    {dbReady ? (
                        <MainNavigator />
                    ) : (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" />
                        </View>
                    )}
                </SafeAreaView>
            </PersistGate>
        </Provider>
    );
}
