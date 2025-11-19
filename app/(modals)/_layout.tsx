import { Stack } from 'expo-router';

export default function ModalLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="add-funds"
                options={{
                    title: 'Add Funds',
                    presentation: 'modal',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="add-funds-details"
                options={{
                    title: 'Add Funds Details',
                    presentation: 'modal',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="fund-card"
                options={{
                    title: 'Fund Card',
                    presentation: 'modal',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="fund-card-success"
                options={{
                    title: 'Fund Card Success',
                    presentation: 'modal',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="receive-money"
                options={{
                    title: 'Receive Money',
                    presentation: 'modal',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="cash-out"
                options={{
                    title: 'Cash Out',
                    presentation: 'modal',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="user-details"
                options={{
                    title: 'User Details',
                    presentation: 'modal',
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
