"use client"

import { createContext, useEffect, useRef } from "react"
import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const NotificationContext = createContext()

const NOTIFICATION_STORAGE_KEY = "@student_timetable_notifications"

export const NotificationProvider = ({ children }) => {
  const notificationsMap = useRef({})

  // Load scheduled notifications from storage on mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const storedNotifications = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY)
        if (storedNotifications) {
          notificationsMap.current = JSON.parse(storedNotifications)
        }
      } catch (error) {
        console.error("Failed to load notifications from storage", error)
      }
    }

    loadNotifications()
    registerForPushNotificationsAsync()
  }, [])

  // Save notifications to storage
  const saveNotificationsToStorage = async () => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notificationsMap.current))
    } catch (error) {
      console.error("Failed to save notifications to storage", error)
    }
  }

  // Register for push notifications
  const registerForPushNotificationsAsync = async () => {
    if (!Device.isDevice) {
      alert("Push Notifications require a physical device")
      return
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push token for notifications!")
      return
    }
  }

  // Schedule a notification for a class
  const scheduleNotification = async (classItem) => {
    try {
      // Calculate when to send the notification (10 minutes before class)
      const [hours, minutes] = classItem.startTime.split(":").map(Number)

      // Create a trigger for each occurrence of this class
      const trigger = {
        hour: hours,
        minute: Math.max(0, minutes - 10), // 10 minutes before class, minimum 0
        repeats: true,
        weekday: classItem.day + 1, // Expo uses 1-7 for weekdays (1 = Monday)
      }

      // Create the notification content
      const content = {
        title: `Class Reminder: ${classItem.courseName}`,
        body: `Your class starts in 10 minutes${classItem.location ? ` at ${classItem.location}` : ""}`,
        data: { classId: classItem.id },
      }

      // Schedule the notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content,
        trigger,
      })

      // Store the notification ID with the class ID
      notificationsMap.current[classItem.id] = notificationId
      await saveNotificationsToStorage()

      return notificationId
    } catch (error) {
      console.error("Failed to schedule notification", error)
      return null
    }
  }

  // Cancel a notification
  const cancelNotification = async (classId) => {
    try {
      const notificationId = notificationsMap.current[classId]
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId)
        delete notificationsMap.current[classId]
        await saveNotificationsToStorage()
      }
    } catch (error) {
      console.error("Failed to cancel notification", error)
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        scheduleNotification,
        cancelNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
