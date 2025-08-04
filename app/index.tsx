import { useState } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

export default function App() {
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");

  // --- Event Hooks ---
  useSpeechRecognitionEvent("start", () => {
    console.log("Recognition has started.");
    setRecognizing(true);
    setTranscript(""); // Clear previous transcript
  });

  useSpeechRecognitionEvent("end", () => {
    console.log("Recognition has ended.");
    setRecognizing(false);
  });

  useSpeechRecognitionEvent("result", (event) => {
    // The result event provides the transcription
    if (event.results && event.results.length > 0) {
      setTranscript(event.results[0]?.transcript);
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.error("Recognition error:", {
      error: event.error,
      message: event.message,
    });
    setRecognizing(false); // Ensure we reset state on error
  });

  // --- Action Handlers ---
  const handleStart = async () => {
    try {
      // 1. Request permissions
      const permissions = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permissions.granted) {
        console.warn("Speech recognition permissions were not granted.");
        // Here you might want to show an alert to the user
        return;
      }

      // 2. Start recognition
      await ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: false,
        continuous: true,
      });
    } catch (error) { // CORRECTED: Removed the underscore from the catch block
      console.error("An error occurred while starting speech recognition:", error);
    }
  };

  const handleStop = async () => {
    try {
      await ExpoSpeechRecognitionModule.stop();
    } catch (error) {
      console.error("An error occurred while stopping speech recognition:", error);
    }
  };

  // The error `Invalid prop 'style' supplied to React.Fragment` often happens
  // when a parent navigator (like from expo-router) tries to apply styles.
  // A syntax error, like the one corrected above, can cause the component
  // to fail to render, triggering this misleading error from the parent.
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Expo Speech Recognition</Text>
        <Text style={styles.status}>
          {recognizing ? "Listening..." : "Press Start to Begin"}
        </Text>

        <View style={styles.buttonContainer}>
          {!recognizing ? (
            <Button title="Start Listening" onPress={handleStart} />
          ) : (
            <Button title="Stop Listening" onPress={handleStop} color="#d9534f" />
          )}
        </View>

        <Text style={styles.header}>Transcript:</Text>
        <ScrollView style={styles.transcriptContainer}>
          <Text style={styles.transcriptText}>
            {transcript || "Waiting for speech..."}
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  status: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '60%',
    marginBottom: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    alignSelf: 'flex-start',
    width: '100%',
  },
  transcriptContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#dddddd',
    marginTop: 10,
  },
  transcriptText: {
    fontSize: 16,
    color: '#333',
  },
});
