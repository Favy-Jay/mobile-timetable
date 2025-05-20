"use client"

import { useContext, useState } from "react"
import { View, StyleSheet, ScrollView, Alert, Platform } from "react-native"
import { Button, Text, Card, Divider, ActivityIndicator, HelperText } from "react-native-paper"
import * as FileSystem from "expo-file-system"
import * as DocumentPicker from "expo-document-picker"
import * as Sharing from "expo-sharing"
import { TimetableContext } from "../context/TimetableContext"

export default function ImportExportScreen({ navigation }) {
  const { classes, importClasses } = useContext(TimetableContext)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const exportData = async () => {
    try {
      setLoading(true)
      setError("")

      // Create a JSON string from the classes data
      const jsonData = JSON.stringify(classes, null, 2)
      const fileName = `timetable_export_${new Date().toISOString().split("T")[0]}.json`
      const filePath = `${FileSystem.documentDirectory}${fileName}`

      // Write the data to a file
      await FileSystem.writeAsStringAsync(filePath, jsonData)

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync()

      if (isAvailable) {
        // Share the file
        await Sharing.shareAsync(filePath, {
          mimeType: "application/json",
          dialogTitle: "Export Timetable Data",
          UTI: "public.json",
        })
      } else {
        // Fallback for web or platforms where sharing isn't available
        if (Platform.OS === "web") {
          // For web, create a download link
          const blob = new Blob([jsonData], { type: "application/json" })
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = fileName
          link.click()
        } else {
          Alert.alert(
            "Sharing not available",
            "Sharing is not available on this device. The file has been saved to your documents directory.",
          )
        }
      }
    } catch (error) {
      console.error("Export error:", error)
      setError("Failed to export data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const importData = async () => {
    try {
      setLoading(true)
      setError("")

      // Pick a JSON file
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      })

      if (result.canceled) {
        setLoading(false)
        return
      }

      // Read the file content
      const fileUri = result.assets[0].uri
      const fileContent = await FileSystem.readAsStringAsync(fileUri)

      try {
        // Parse the JSON data
        const importedData = JSON.parse(fileContent)

        // Validate the imported data
        if (!Array.isArray(importedData)) {
          throw new Error("Invalid data format. Expected an array of classes.")
        }

        // Confirm import
        Alert.alert(
          "Import Data",
          `Found ${importedData.length} classes. Do you want to replace your current timetable with this data?`,
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => setLoading(false),
            },
            {
              text: "Import",
              onPress: () => {
                // Import the data
                importClasses(importedData)
                setLoading(false)
                Alert.alert("Success", "Timetable data imported successfully!")
                navigation.goBack()
              },
            },
          ],
        )
      } catch (parseError) {
        console.error("Parse error:", parseError)
        setError("Invalid file format. Please select a valid timetable export file.")
        setLoading(false)
      }
    } catch (error) {
      console.error("Import error:", error)
      setError("Failed to import data. Please try again.")
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Export Timetable Data</Text>
          <Text style={styles.description}>
            Export your timetable data to a file that you can use for backup or transfer to another device.
          </Text>
          <Button
            mode="contained"
            onPress={exportData}
            style={styles.button}
            disabled={loading || classes.length === 0}
          >
            {loading ? "Exporting..." : "Export Data"}
          </Button>
          {classes.length === 0 && <HelperText type="info">You don't have any classes to export yet.</HelperText>}
        </Card.Content>
      </Card>

      <Divider style={styles.divider} />

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Import Timetable Data</Text>
          <Text style={styles.description}>
            Import timetable data from a previously exported file. This will replace your current timetable.
          </Text>
          <Button mode="contained" onPress={importData} style={styles.button} disabled={loading}>
            {loading ? "Importing..." : "Import Data"}
          </Button>
          {error ? <HelperText type="error">{error}</HelperText> : null}
        </Card.Content>
      </Card>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.backButton}>
          Back to Timetable
        </Button>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
    color: "#666",
  },
  button: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
  backButton: {
    paddingVertical: 6,
  },
})
