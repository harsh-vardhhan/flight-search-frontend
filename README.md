# Flight Search Frontend

<img width="1334" height="816" alt="screens" src="https://github.com/user-attachments/assets/d9553737-2ab9-4088-8549-74dae07a1ead" />

This is a React Native app built with [Expo](https://expo.dev) for searching flights. It provides a user-friendly interface to search, view, and filter flight options.

## Features

- Search for flights by origin, destination, and date
- View flight details including airline, price, and duration
- Filter and sort results
- Responsive design for mobile devices

## Technologies Used

- **Expo**: For rapid React Native development
- **React Native**: UI framework
- **React Navigation**: Routing and navigation
- **Axios**: For API requests

## API Details

This app connects to a backend flight search API using an IP address and port (see `index.tsx` for configuration).  
**Example Base URL:** `http://<YOUR_IP_ADDRESS>:<PORT>/flights`  
**Endpoints:**
- `GET /flights?origin=XXX&destination=YYY&date=YYYY-MM-DD`  
  Returns a list of available flights matching the search criteria.

**Note:** Update the API URL in your environment configuration as needed.  
**Backend Repository:**  
[https://github.com/harsh-vardhhan/flight-search-backend](https://github.com/harsh-vardhhan/flight-search-backend)

## Important Notes

- **Device and Backend Connectivity:**  
  Your mobile device and the backend server (localhost) must be connected to the same WiFi network for API requests to work.
- **Emulators/Simulators:**  
  You cannot use Android emulators or iOS simulators for this setup. Please use a real device with the Expo Go app.
- **expo-speech-recognition:**  
  To use [expo-speech-recognition](https://github.com/jamsch/expo-speech-recognition), you must create an `android` folder in your project.  
  For setup instructions, refer to the [expo-speech-recognition repository](https://github.com/jamsch/expo-speech-recognition).

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the app**
   ```bash
   npx expo start
   ```

3. **Run on device**
   - Use the Expo Go app on your physical mobile device.
   - Scan the QR code displayed in the terminal or Expo Dev Tools.

## Project Structure

- `app/` — Main application code
- `components/` — Reusable UI components
- `services/` — API service logic

## Development

Start editing files in the `app` directory.  
This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Learn More

- [Expo documentation](https://docs.expo.dev/)
- [React Native docs](https://reactnative.dev/)
- [API docs](https://api.example.com/docs) *(replace with your actual API docs)*

## Community

- [Expo on GitHub](https://github.com/expo/expo)
- [Expo Discord](https://chat.expo.dev)