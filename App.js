import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { Provider as PaperProvider } from "react-native-paper"
import { StatusBar } from "expo-status-bar"
import * as Notifications from "expo-notifications"

import HomeScreen from "./screens/HomeScreen"
import AddEditClassScreen from "./screens/AddEditClassScreen"
import { NotificationProvider } from "./context/NotificationContext"
import { TimetableProvider } from "./context/TimetableContext"

// Add the import for the ImportExportScreen
import ImportExportScreen from "./screens/ImportExportScreen"

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

const Stack = createStackNavigator()

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <TimetableProvider>
          <NotificationProvider>
            <StatusBar style="auto" />
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerStyle: {
                  backgroundColor: "#6200ee",
                },
                headerTintColor: "#fff",
                headerTitleStyle: {
                  fontWeight: "bold",
                },
              }}
            >
              <Stack.Screen name="Home" component={HomeScreen} options={{ title: "My Timetable" }} />
              <Stack.Screen
                name="AddEditClass"
                component={AddEditClassScreen}
                options={({ route }) => ({
                  title: route.params?.classItem ? "Edit Class" : "Add New Class",
                })}
              />
              {/* Inside the Stack.Navigator, add the new screen: */}
              <Stack.Screen
                name="ImportExport"
                component={ImportExportScreen}
                options={{ title: "Import/Export Data" }}
              />
            </Stack.Navigator>
          </NotificationProvider>
        </TimetableProvider>
      </NavigationContainer>
    </PaperProvider>
  )
}
