"use client"

import React, { useState, useContext } from "react"
import { View, StyleSheet, ScrollView, Alert } from "react-native"
import { FAB, Text, Card, IconButton, Divider, Chip, useTheme, Menu } from "react-native-paper"
import { useFocusEffect } from "@react-navigation/native"
import { TimetableContext } from "../context/TimetableContext"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function HomeScreen({ navigation }) {
  const theme = useTheme()
  const { classes, deleteClass } = useContext(TimetableContext)
  const [selectedDay, setSelectedDay] = useState(getCurrentDay())

  // Add state for the menu
  const [menuVisible, setMenuVisible] = useState(false)

  // Add this function to handle menu press
  const handleMenuPress = () => setMenuVisible(true)
  const handleMenuDismiss = () => setMenuVisible(false)

  // Add this function to handle navigation to the ImportExport screen
  const navigateToImportExport = () => {
    setMenuVisible(false)
    navigation.navigate("ImportExport")
  }

  // Get current day of the week (0 = Monday, 6 = Sunday)
  function getCurrentDay() {
    const day = new Date().getDay()
    // Convert Sunday (0) to 6, and Monday (1) to 0, etc.
    return day === 0 ? 6 : day - 1
  }

  // Refresh the screen when it comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // No need to fetch data here as we're using context
      return () => {}
    }, []),
  )

  const handleDeleteClass = (id) => {
    Alert.alert("Delete Class", "Are you sure you want to delete this class?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => deleteClass(id),
        style: "destructive",
      },
    ])
  }

  const renderClassCards = () => {
    const dayClasses = classes
      .filter((c) => c.day === selectedDay)
      .sort((a, b) => {
        // Sort by start time
        const timeA = a.startTime.split(":").map(Number)
        const timeB = b.startTime.split(":").map(Number)

        if (timeA[0] !== timeB[0]) return timeA[0] - timeB[0]
        return timeA[1] - timeB[1]
      })

    if (dayClasses.length === 0) {
      return (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyCardContent}>
            <Text style={styles.emptyText}>No classes scheduled for {DAYS[selectedDay]}</Text>
          </Card.Content>
        </Card>
      )
    }

    return dayClasses.map((classItem) => (
      <Card key={classItem.id} style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.courseTitle}>{classItem.courseName}</Text>
            <View style={styles.actionButtons}>
              <IconButton icon="pencil" size={20} onPress={() => navigation.navigate("AddEditClass", { classItem })} />
              <IconButton icon="delete" size={20} onPress={() => handleDeleteClass(classItem.id)} />
            </View>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>
              {classItem.startTime} - {classItem.endTime}
            </Text>
            {classItem.location && (
              <Chip icon="map-marker" style={styles.locationChip}>
                {classItem.location}
              </Chip>
            )}
          </View>
          {classItem.notes && <Text style={styles.notes}>{classItem.notes}</Text>}
        </Card.Content>
      </Card>
    ))
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{DAYS[selectedDay]}</Text>
        <Menu
          visible={menuVisible}
          onDismiss={handleMenuDismiss}
          anchor={<IconButton icon="dots-vertical" size={24} onPress={handleMenuPress} />}
        >
          <Menu.Item onPress={navigateToImportExport} title="Import/Export Data" leadingIcon="database-import-export" />
        </Menu>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysContainer}>
        {DAYS.map((day, index) => (
          <Chip
            key={index}
            selected={selectedDay === index}
            onPress={() => setSelectedDay(index)}
            style={[styles.dayChip, selectedDay === index && { backgroundColor: theme.colors.primary }]}
            textStyle={[styles.dayChipText, selectedDay === index && { color: "white" }]}
          >
            {day}
          </Chip>
        ))}
      </ScrollView>

      <ScrollView style={styles.classesContainer}>{renderClassCards()}</ScrollView>

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => navigation.navigate("AddEditClass")}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "white",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  daysContainer: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "white",
  },
  dayChip: {
    marginRight: 8,
    paddingHorizontal: 8,
  },
  dayChipText: {
    fontSize: 14,
  },
  classesContainer: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  emptyCard: {
    marginTop: 20,
    height: 100,
    justifyContent: "center",
    elevation: 2,
  },
  emptyCardContent: {
    alignItems: "center",
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
  },
  divider: {
    marginVertical: 8,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    color: "#555",
  },
  locationChip: {
    height: 30,
  },
  notes: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    fontStyle: "italic",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
})
