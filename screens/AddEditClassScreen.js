"use client"

import { useState, useContext } from "react"
import { View, StyleSheet, ScrollView, Platform } from "react-native"
import { TextInput, Button, Text, HelperText, Divider, useTheme } from "react-native-paper"
import DateTimePicker from "@react-native-community/datetimepicker"
import DropDown from "react-native-paper-dropdown"
import { TimetableContext } from "../context/TimetableContext"
import { NotificationContext } from "../context/NotificationContext"

const DAYS = [
  { label: "Monday", value: 0 },
  { label: "Tuesday", value: 1 },
  { label: "Wednesday", value: 2 },
  { label: "Thursday", value: 3 },
  { label: "Friday", value: 4 },
  { label: "Saturday", value: 5 },
  { label: "Sunday", value: 6 },
]

export default function AddEditClassScreen({ route, navigation }) {
  const theme = useTheme()
  const { addClass, updateClass } = useContext(TimetableContext)
  const { scheduleNotification, cancelNotification } = useContext(NotificationContext)

  const classToEdit = route.params?.classItem
  const isEditing = !!classToEdit

  // Form state
  const [courseName, setCourseName] = useState(classToEdit?.courseName || "")
  const [day, setDay] = useState(classToEdit?.day !== undefined ? classToEdit.day : 0)
  const [startTime, setStartTime] = useState(classToEdit?.startTime || "09:00")
  const [endTime, setEndTime] = useState(classToEdit?.endTime || "10:00")
  const [location, setLocation] = useState(classToEdit?.location || "")
  const [notes, setNotes] = useState(classToEdit?.notes || "")

  // UI state
  const [showStartTimePicker, setShowStartTimePicker] = useState(false)
  const [showEndTimePicker, setShowEndTimePicker] = useState(false)
  const [showDayDropdown, setShowDayDropdown] = useState(false)
  const [errors, setErrors] = useState({})

  // Convert time string to Date object
  const timeStringToDate = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  // Convert Date object to time string
  const dateToTimeString = (date) => {
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    return `${hours}:${minutes}`
  }

  const validateForm = () => {
    const newErrors = {}

    if (!courseName.trim()) {
      newErrors.courseName = "Course name is required"
    }

    // Check if end time is after start time
    const startDate = timeStringToDate(startTime)
    const endDate = timeStringToDate(endTime)

    if (endDate <= startDate) {
      newErrors.endTime = "End time must be after start time"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) return

    const classData = {
      id: classToEdit?.id || Date.now().toString(),
      courseName,
      day,
      startTime,
      endTime,
      location,
      notes,
    }

    if (isEditing) {
      // Cancel the old notification before updating
      if (classToEdit.notificationId) {
        cancelNotification(classToEdit.notificationId)
      }
      updateClass(classData)
    } else {
      addClass(classData)
    }

    // Schedule notification for this class
    scheduleNotification(classData)

    navigation.goBack()
  }

  const onChangeStartTime = (event, selectedDate) => {
    setShowStartTimePicker(Platform.OS === "ios")
    if (selectedDate) {
      setStartTime(dateToTimeString(selectedDate))
    }
  }

  const onChangeEndTime = (event, selectedDate) => {
    setShowEndTimePicker(Platform.OS === "ios")
    if (selectedDate) {
      setEndTime(dateToTimeString(selectedDate))
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <TextInput
          label="Course Name"
          value={courseName}
          onChangeText={setCourseName}
          mode="outlined"
          error={!!errors.courseName}
          style={styles.input}
        />
        {errors.courseName && <HelperText type="error">{errors.courseName}</HelperText>}

        <View style={styles.dropdownContainer}>
          <DropDown
            label="Day of Week"
            mode="outlined"
            visible={showDayDropdown}
            showDropDown={() => setShowDayDropdown(true)}
            onDismiss={() => setShowDayDropdown(false)}
            value={day}
            setValue={setDay}
            list={DAYS}
          />
        </View>

        <View style={styles.timeContainer}>
          <View style={styles.timeInput}>
            <Text style={styles.label}>Start Time</Text>
            <Button mode="outlined" onPress={() => setShowStartTimePicker(true)} style={styles.timeButton}>
              {startTime}
            </Button>
          </View>

          <View style={styles.timeInput}>
            <Text style={styles.label}>End Time</Text>
            <Button
              mode="outlined"
              onPress={() => setShowEndTimePicker(true)}
              style={styles.timeButton}
              error={!!errors.endTime}
            >
              {endTime}
            </Button>
          </View>
        </View>

        {errors.endTime && <HelperText type="error">{errors.endTime}</HelperText>}

        {showStartTimePicker && (
          <DateTimePicker
            value={timeStringToDate(startTime)}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={onChangeStartTime}
          />
        )}

        {showEndTimePicker && (
          <DateTimePicker
            value={timeStringToDate(endTime)}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={onChangeEndTime}
          />
        )}

        <Divider style={styles.divider} />

        <TextInput
          label="Location (Optional)"
          value={location}
          onChangeText={setLocation}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Notes (Optional)"
          value={notes}
          onChangeText={setNotes}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        <View style={styles.buttonContainer}>
          <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
            {isEditing ? "Update Class" : "Add Class"}
          </Button>

          <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.cancelButton}>
            Cancel
          </Button>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  form: {
    padding: 16,
  },
  input: {
    marginBottom: 12,
  },
  dropdownContainer: {
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  timeInput: {
    width: "48%",
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
    color: "#666",
  },
  timeButton: {
    width: "100%",
  },
  divider: {
    marginVertical: 16,
  },
  buttonContainer: {
    marginTop: 24,
  },
  saveButton: {
    marginBottom: 12,
    paddingVertical: 6,
  },
  cancelButton: {
    paddingVertical: 6,
  },
})
