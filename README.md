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

This app connects to a backend flight search API.  
**Base URL:** `https://api.example.com/flights`  
**Endpoints:**
- `GET /flights?origin=XXX&destination=YYY&date=YYYY-MM-DD`  
  Returns a list of available flights matching the search criteria.

**Note:** Update the API URL in your environment configuration as needed.

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the app**
   ```bash
   npx expo start
   ```

3. **Run on device or simulator**
   - Android emulator
   - iOS simulator
   - Expo Go app

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