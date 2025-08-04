// index.tsx

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
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme, // <-- IMPORT useColorScheme
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- NEW: Define Theme Colors ---
const theme = {
  light: {
    background: '#F0F2F5',
    text: '#1C1E21',
    subtleText: '#65676B',
    placeholderText: '#8A8D91',
    primary: '#5A45FF',
    userBubble: '#E5E5EA',
    assistantBubble: '#FFFFFF',
    cardBackground: '#FFFFFF',
    cardBorder: '#CED0D4',
    statusBar: 'dark-content' as 'dark-content' | 'light-content',
  },
  dark: {
    background: '#121212',
    text: '#EAEAEA',
    subtleText: '#A9A9A9',
    placeholderText: '#777777',
    primary: '#5A45FF',
    userBubble: '#3A3B3C',
    assistantBubble: '#242526',
    cardBackground: '#2A2A2A',
    cardBorder: '#3A3A3A',
    statusBar: 'light-content' as 'dark-content' | 'light-content',
  },
};

// --- Type Definitions (Unchanged) ---
type Flight = {
  id: number;
  date: string;
  origin: string;
  destination: string;
  airline: string;
  price_inr: number;
  link: string;
};
type ConversationEntry = {
  role: 'user' | 'assistant';
  content: string;
  flights?: Flight[];
};


// --- Waveform Animation Component (Modified to use theme colors) ---
const WaveformAnimation = ({ isListening, volume, color }: { isListening: boolean; volume: number, color: string }) => {
  const waveAnims = useRef(Array(5).fill(null).map(() => new Animated.Value(5))).current;
  useEffect(() => {
    // ... (animation logic is the same)
    if (isListening) {
      const targetHeight = 5 + (volume * 45);
      const animations = waveAnims.map((anim) => Animated.timing(anim, { toValue: targetHeight + (Math.random() * 10 - 5), duration: 100, useNativeDriver: false }));
      Animated.parallel(animations).start();
    } else {
      const animations = waveAnims.map(anim => Animated.spring(anim, { toValue: 5, useNativeDriver: false }));
      Animated.parallel(animations).start();
    }
  }, [isListening, volume]);

  return (
    <View style={styles.waveformContainer}>
      {waveAnims.map((anim, index) => (
        <Animated.View key={index} style={[styles.waveformBar, { height: anim, backgroundColor: color }]} />
      ))}
    </View>
  );
};


// --- Flight Card Component (Modified to use theme colors) ---
const FlightCard = ({ flight, colors }: { flight: Flight, colors: typeof theme.light }) => {
  const handlePress = () => Linking.openURL(flight.link).catch(err => console.error("Couldn't load page", err));
  const formattedDate = new Date(flight.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <View style={[styles.flightCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
      <View style={styles.flightHeader}>
        <Text style={[styles.airlineText, { color: colors.text }]}>{flight.airline}</Text>
        <Text style={[styles.flightPrice, { color: colors.primary }]}>₹{flight.price_inr.toLocaleString('en-IN')}</Text>
      </View>
      <View style={styles.flightDetails}>
        <View style={styles.locationContainer}>
            <FontAwesome5 name="plane-departure" size={16} color={colors.subtleText} />
            <Text style={[styles.locationText, { color: colors.text }]}>{flight.origin}</Text>
        </View>
        <FontAwesome5 name="long-arrow-alt-right" size={20} color={colors.primary} style={{ marginHorizontal: 10 }}/>
        <View style={styles.locationContainer}>
            <FontAwesome5 name="plane-arrival" size={16} color={colors.subtleText} />
            <Text style={[styles.locationText, { color: colors.text }]}>{flight.destination}</Text>
        </View>
      </View>
      <View style={[styles.flightFooter, { borderTopColor: colors.cardBorder }]}>
        <View style={styles.dateContainer}>
            <FontAwesome5 name="calendar-alt" size={14} color={colors.subtleText} />
            <Text style={[styles.dateText, { color: colors.subtleText }]}>{formattedDate}</Text>
        </View>
        <TouchableOpacity style={[styles.bookButton, { backgroundColor: colors.primary }]} onPress={handlePress}>
          <Text style={styles.bookButtonText}>View Deal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


export default function RupeeTravelApp() {
  // --- NEW: Detect system theme ---
  const colorScheme = useColorScheme();
  const colors = theme[colorScheme || 'light']; // Default to light mode

  const [status, setStatus] = useState('idle');
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [micVolume, setMicVolume] = useState(0);
  
  const transcriptRef = useRef('');
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  // --- Backend Communication and Speech Logic (Unchanged) ---
  const sendTranscriptToBackend = async (text: string) => {
    const backendUrl = 'http://192.168.29.3:8000/transcript';
    try {
      const response = await fetch(backendUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: text }), });
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      const data = await response.json();
      let assistantMessage: ConversationEntry;
      if (data.query_type === 'flight_related' && Array.isArray(data.data) && data.data.length > 0) {
        assistantMessage = { role: 'assistant', content: 'Here are the best flights I found for your trip:', flights: data.data, };
      } else {
        assistantMessage = { role: 'assistant', content: typeof data.data === 'string' ? data.data : "Sorry, I couldn't find any results for that.", };
      }
      setConversation(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending transcript to backend:", error);
      const assistantMessage = { role: 'assistant' as const, content: "Sorry, I couldn't connect to the server." };
      setConversation(prev => [...prev, assistantMessage]);
    } finally {
      setStatus('done');
    }
  };
  const stopListeningAndProcess = async () => { /* ... unchanged ... */ if (status !== 'listening') return; setStatus('processing'); setMicVolume(0); try { await ExpoSpeechRecognitionModule.stop(); const finalTranscript = transcriptRef.current || "I couldn't hear that, please try again."; transcriptRef.current = ''; const userMessage = { role: 'user' as const, content: finalTranscript }; setConversation(prev => [...prev, userMessage]); await sendTranscriptToBackend(finalTranscript); } catch (error) { console.error('Failed to stop speech recognition', error); setStatus('idle'); } };
  const handleToggleListen = async () => { /* ... unchanged ... */ if (status === 'listening') { await stopListeningAndProcess(); return; } setConversation([]); transcriptRef.current = ''; setStatus('listening'); try { const permissions = await ExpoSpeechRecognitionModule.requestPermissionsAsync(); if (!permissions.granted) { setStatus('idle'); setConversation([{ role: 'assistant', content: 'Permission to use the microphone was denied.' }]); return; } await ExpoSpeechRecognitionModule.start({ lang: 'en-IN', continuous: true, volumeChangeEventOptions: { enabled: true, intervalMillis: 100, }, }); resetSilenceTimer(); } catch (error) { console.error("Error starting speech recognition:", error); setStatus('idle'); } };
  const resetSilenceTimer = () => { if (silenceTimer.current) clearTimeout(silenceTimer.current); silenceTimer.current = setTimeout(stopListeningAndProcess, 2000); };
  useSpeechRecognitionEvent('volumechange', (event) => { const normalizedVolume = Math.min(Math.max(event.value / 10, 0), 1); setMicVolume(normalizedVolume); });
  useSpeechRecognitionEvent('result', (event) => { if (event.results && event.results.length > 0) { transcriptRef.current = event.results[0]?.transcript || ''; resetSilenceTimer(); } });
  useSpeechRecognitionEvent('end', () => { if (status === 'listening') { setStatus('idle'); setMicVolume(0); } });
  useSpeechRecognitionEvent('error', (event) => { console.error('Speech recognition error:', event.error, event.message); setStatus('idle'); setMicVolume(0); });
  useEffect(() => { scrollViewRef.current?.scrollToEnd({ animated: true }); }, [conversation]);
  // --- End of Unchanged Logic ---

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* --- MODIFIED: Dynamic status bar --- */}
      <StatusBar barStyle={colors.statusBar} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>RupeeTravel</Text>
            <Text style={[styles.subtitle, { color: colors.subtleText }]}>Your AI Assistant for India-Vietnam Flights</Text>
        </View>

        <ScrollView 
            ref={scrollViewRef}
            style={styles.conversationArea} 
            contentContainerStyle={styles.conversationContent}
        >
          {conversation.length === 0 && status !== 'listening' && status !== 'processing' && (
            <Text style={[styles.placeholderText, { color: colors.placeholderText }]}>Press the mic and ask me to find flights!</Text>
          )}

          {/* --- MODIFIED: Render loop to pass theme colors --- */}
          {conversation.map((entry, index) => {
            if (entry.role === 'user') {
              return (
                <View key={index} style={[styles.userBubble, { backgroundColor: colors.userBubble }]}>
                  <Text style={[styles.userText, { color: colors.text }]}>{entry.content}</Text>
                </View>
              );
            }
            return (
              <View key={index} style={styles.assistantMessageContainer}>
                <View style={[styles.assistantBubble, { backgroundColor: colors.assistantBubble }]}>
                  <Text style={[styles.assistantText, { color: colors.text }]}>{entry.content}</Text>
                </View>
                {entry.flights && entry.flights.map(flight => (
                  <FlightCard key={flight.id} flight={flight} colors={colors} />
                ))}
              </View>
            );
          })}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom || 20, borderTopColor: colors.cardBorder }]}>
            {status === 'listening' && <WaveformAnimation isListening={true} volume={micVolume} color={colors.primary} />}
            {status === 'processing' && <ActivityIndicator size="large" color={colors.primary} style={{height: 50}}/>}
            {status !== 'listening' && status !== 'processing' && <View style={{height: 50}} />}
            
            <TouchableOpacity onPress={handleToggleListen} disabled={status === 'processing'}>
                <View style={[styles.micButton, { backgroundColor: colors.primary }]}>
                    <FontAwesome5 name="microphone-alt" size={30} color="white" />
                </View>
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- MODIFIED: Stylesheet with colors removed ---
// Colors are now applied dynamically in the component's JSX
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
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
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
  userBubble: {
    padding: 15,
    borderRadius: 20,
    alignSelf: 'flex-end',
    maxWidth: '80%',
    marginBottom: 10,
  },
  assistantBubble: {
    padding: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
    maxWidth: '90%',
  },
  userText: {
    fontSize: 16,
  },
  assistantText: {
    fontSize: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  micButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
    marginHorizontal: 4,
  },
  assistantMessageContainer: {
    alignSelf: 'flex-start',
    width: '100%',
    marginBottom: 10,
  },
  flightCard: {
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  airlineText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  flightPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  flightDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 16,
  },
  flightFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    paddingTop: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
  },
  bookButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});