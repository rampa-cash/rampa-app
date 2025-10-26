import { Stack } from 'expo-router';

export default function ModalLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="add-money"
                options={{
                    title: 'Add Money',
                    presentation: 'modal',
                }}
            />
            <Stack.Screen
                name="receive-money"
                options={{
                    title: 'Receive Money',
                    presentation: 'modal',
                }}
            />
            <Stack.Screen
                name="cash-out"
                options={{
                    title: 'Cash Out',
                    presentation: 'modal',
                }}
            />
            <Stack.Screen
                name="user-details"
                options={{
                    title: 'User Details',
                    presentation: 'modal',
                }}
            />
        </Stack>
    );
}
