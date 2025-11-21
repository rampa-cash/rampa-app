import { Stack } from 'expo-router';

export default function TransactionsLayout() {
    return (
        <Stack
            initialRouteName="transaction-list"
            screenOptions={{ headerShown: false }}
        />
    );
}
