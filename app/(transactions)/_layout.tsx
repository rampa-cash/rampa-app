import { Stack } from 'expo-router';

export default function TransactionsLayout() {
    return (
        <Stack
            initialRouteName="index"
            screenOptions={{ headerShown: false }}
        />
    );
}