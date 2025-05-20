"use client"

import { createContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const TimetableContext = createContext()

const STORAGE_KEY = "@student_timetable_classes"

export const TimetableProvider = ({ children }) => {
  const [classes, setClasses] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Load classes from AsyncStorage on mount
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const storedClasses = await AsyncStorage.getItem(STORAGE_KEY)
        if (storedClasses) {
          setClasses(JSON.parse(storedClasses))
        }
      } catch (error) {
        console.error("Failed to load classes from storage", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadClasses()
  }, [])

  // Save classes to AsyncStorage whenever they change
  useEffect(() => {
    const saveClasses = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(classes))
      } catch (error) {
        console.error("Failed to save classes to storage", error)
      }
    }

    if (!isLoading) {
      saveClasses()
    }
  }, [classes, isLoading])

  // Add a new class
  const addClass = (newClass) => {
    setClasses((prevClasses) => [...prevClasses, newClass])
  }

  // Update an existing class
  const updateClass = (updatedClass) => {
    setClasses((prevClasses) => prevClasses.map((c) => (c.id === updatedClass.id ? updatedClass : c)))
  }

  // Delete a class
  const deleteClass = (id) => {
    setClasses((prevClasses) => prevClasses.filter((c) => c.id !== id))
  }

  // Import classes from an external source
  const importClasses = (importedClasses) => {
    // Validate and process imported classes
    const validClasses = importedClasses.filter(
      (c) => c.id && c.courseName && c.day !== undefined && c.startTime && c.endTime,
    )

    // Replace current classes with imported ones
    setClasses(validClasses)
  }

  return (
    <TimetableContext.Provider
      value={{
        classes,
        isLoading,
        addClass,
        updateClass,
        deleteClass,
        importClasses,
      }}
    >
      {children}
    </TimetableContext.Provider>
  )
}
