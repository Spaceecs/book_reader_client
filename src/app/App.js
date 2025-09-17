import React from 'react';
import {Provider} from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './index';
import {MainNavigator} from './index';
import '../shared/config/i18n';

export default function App() {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <MainNavigator />
            </PersistGate>
        </Provider>
    );
}
