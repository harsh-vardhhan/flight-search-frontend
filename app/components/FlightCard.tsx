import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

export type Flight = {
  id: number;
  date: string;
  origin: string;
  destination: string;
  airline: string;
  price_inr: number;
  link: string;
};

interface FlightCardProps {
  flight: Flight;
  colors: {
    text: string;
    primary: string;
    subtleText: string;
    cardBackground: string;
    cardBorder: string;
  };
}

const FlightCard: React.FC<FlightCardProps> = ({ flight, colors }) => {
  const handlePress = () =>
    Linking.openURL(flight.link).catch((err) =>
      console.error("Couldn't load page", err),
    );

  const formattedDate = new Date(flight.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <View
      style={[
        styles.flightCard,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View style={styles.flightHeader}>
        <Text style={[styles.airlineText, { color: colors.text }]}>
          {flight.airline}
        </Text>
        <Text style={[styles.flightPrice, { color: colors.primary }]}>
          ₹{flight.price_inr.toLocaleString("en-IN")}
        </Text>
      </View>
      <View style={styles.flightDetails}>
        <View style={styles.locationContainer}>
          <FontAwesome5
            name="plane-departure"
            size={16}
            color={colors.subtleText}
          />
          <Text style={[styles.locationText, { color: colors.text }]}>
            {flight.origin}
          </Text>
        </View>
        <FontAwesome5
          name="long-arrow-alt-right"
          size={20}
          color={colors.primary}
          style={{ marginHorizontal: 10 }}
        />
        <View style={styles.locationContainer}>
          <FontAwesome5
            name="plane-arrival"
            size={16}
            color={colors.subtleText}
          />
          <Text style={[styles.locationText, { color: colors.text }]}>
            {flight.destination}
          </Text>
        </View>
      </View>
      <View
        style={[styles.flightFooter, { borderTopColor: colors.cardBorder }]}
      >
        <View style={styles.dateContainer}>
          <FontAwesome5
            name="calendar-alt"
            size={14}
            color={colors.subtleText}
          />
          <Text style={[styles.dateText, { color: colors.subtleText }]}>
            {formattedDate}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.bookButton, { backgroundColor: colors.primary }]}
          onPress={handlePress}
        >
          <Text style={styles.bookButtonText}>View Deal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flightCard: {
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
  },
  flightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  airlineText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  flightPrice: {
    fontSize: 20,
    fontWeight: "bold",
  },
  flightDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 16,
  },
  flightFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    borderTopWidth: 1,
    paddingTop: 12,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default FlightCard;
