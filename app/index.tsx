import { FontAwesome5 } from '@expo/vector-icons';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Waveform Animation Component ---
const WaveformAnimation = ({ isListening, volume }: { isListening: boolean; volume: number }) => {
  const waveAnims = useRef(Array(5).fill(null).map(() => new Animated.Value(5))).current;

  useEffect(() => {
    if (isListening) {
      const targetHeight = 5 + (volume * 45);
      const animations = waveAnims.map((anim) => {
        return Animated.timing(anim, {
          toValue: targetHeight + (Math.random() * 10 - 5),
          duration: 100,
          useNativeDriver: false,
        });
      });
      Animated.parallel(animations).start();
    } else {
      const animations = waveAnims.map(anim => 
        Animated.spring(anim, { toValue: 5, useNativeDriver: false })
      );
      Animated.parallel(animations).start();
    }
  }, [isListening, volume]);

  return (
    <View style={styles.waveformContainer}>
      {waveAnims.map((anim, index) => (
        <Animated.View key={index} style={[styles.waveformBar, { height: anim }]} />
      ))}
    </View>
  );
};


export default function RupeeTravelApp() {
  const [status, setStatus] = useState('idle');
  const [conversation, setConversation] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [micVolume, setMicVolume] = useState(0);
  
  const transcriptRef = useRef('');
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  // --- Backend Communication ---
  const sendTranscriptToBackend = async (text: string) => {
    // !!! IMPORTANT !!!
    // Replace this with your computer's local IP address.
    // Your phone and computer must be on the same Wi-Fi network.
    const backendUrl = 'http://192.168.29.3:8000/transcript'; // Example: 'http://192.168.1.10:8000/transcript'

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Backend response:', data);
      // Display the backend's reply in the conversation
      const assistantMessage = { role: 'assistant' as const, content: data.reply || "Received!" };
      setConversation(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Error sending transcript to backend:", error);
      const assistantMessage = { role: 'assistant' as const, content: "Sorry, I couldn't connect to the server." };
      setConversation(prev => [...prev, assistantMessage]);
    } finally {
      setStatus('done');
    }
  };

  // --- Speech Recognition Logic ---
  const stopListeningAndProcess = async () => {
    if (status !== 'listening') return;

    setStatus('processing');
    setMicVolume(0);
    try {
      await ExpoSpeechRecognitionModule.stop();
      
      const finalTranscript = transcriptRef.current || "I couldn't hear that, please try again.";
      transcriptRef.current = ''; 
      
      const userMessage = { role: 'user' as const, content: finalTranscript };
      setConversation(prev => [...prev, userMessage]);
      
      // Send the transcript to the backend instead of the timeout
      await sendTranscriptToBackend(finalTranscript);

    } catch (error) {
      console.error('Failed to stop speech recognition', error);
      setStatus('idle');
    }
  };

  const handleToggleListen = async () => {
    if (status === 'listening') {
      await stopListeningAndProcess();
      return;
    }

    setConversation([]);
    transcriptRef.current = '';
    setStatus('listening');

    try {
      const permissions = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permissions.granted) {
        setStatus('idle');
        setConversation([{ role: 'assistant', content: 'Permission to use the microphone was denied.' }]);
        return;
      }

      await ExpoSpeechRecognitionModule.start({
        lang: 'en-IN',
        continuous: true,
        volumeChangeEventOptions: {
          enabled: true,
          intervalMillis: 100,
        },
      });
      resetSilenceTimer();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      setStatus('idle');
    }
  };
  
  const resetSilenceTimer = () => {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    silenceTimer.current = setTimeout(stopListeningAndProcess, 2000);
  };

  // --- Speech Recognition Event Hooks ---
  useSpeechRecognitionEvent('volumechange', (event) => {
    const normalizedVolume = Math.min(Math.max(event.value / 10, 0), 1);
    setMicVolume(normalizedVolume);
  });

  useSpeechRecognitionEvent('result', (event) => {
    if (event.results && event.results.length > 0) {
      transcriptRef.current = event.results[0]?.transcript || '';
      resetSilenceTimer();
    }
  });
  
  useSpeechRecognitionEvent('end', () => {
    if (status === 'listening') {
      setStatus('idle');
      setMicVolume(0);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech recognition error:', event.error, event.message);
    setStatus('idle');
    setMicVolume(0);
  });

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [conversation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
            <Text style={styles.title}>RupeeTravel</Text>
            <Text style={styles.subtitle}>Your AI Assistant for India-Vietnam Flights</Text>
        </View>

        <ScrollView 
            ref={scrollViewRef}
            style={styles.conversationArea} 
            contentContainerStyle={styles.conversationContent}
        >
          {conversation.length === 0 && status !== 'listening' && status !== 'processing' && (
            <Text style={styles.placeholderText}>Press the mic and ask me to find flights!</Text>
          )}
          {conversation.map((entry, index) => (
            <View key={index} style={entry.role === 'user' ? styles.userBubble : styles.assistantBubble}>
              <Text style={entry.role === 'user' ? styles.userText : styles.assistantText}>{entry.content}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom || 20 }]}>
            {status === 'listening' && <WaveformAnimation isListening={true} volume={micVolume} />}
            {status === 'processing' && <ActivityIndicator size="large" color="#5A45FF" style={{height: 50}}/>}
            {status !== 'listening' && status !== 'processing' && <View style={{height: 50}} />}
            
            <TouchableOpacity onPress={handleToggleListen} disabled={status === 'processing'}>
                <View style={styles.micButton}>
                    <FontAwesome5 name="microphone-alt" size={30} color="white" />
                </View>
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#A9A9A9',
    textAlign: 'center',
    marginTop: 4,
  },
  conversationArea: {
    flex: 1,
    width: '100%',
    marginTop: 10,
  },
  conversationContent: {
      paddingHorizontal: 20,
      paddingBottom: 10,
      flexGrow: 1,
      justifyContent: 'flex-end',
  },
  placeholderText: {
    color: '#777',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
  userBubble: {
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 20,
    alignSelf: 'flex-end',
    maxWidth: '80%',
    marginBottom: 10,
  },
  assistantBubble: {
    backgroundColor: '#222222',
    padding: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
    maxWidth: '90%',
    marginBottom: 10,
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  assistantText: {
    color: '#EAEAEA',
    fontSize: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#222'
  },
  micButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#5A45FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  waveformContainer: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveformBar: {
    width: 8,
    borderRadius: 4,
    backgroundColor: '#5A45FF',
    marginHorizontal: 4,
  },
});
