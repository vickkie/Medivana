import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { COLORS, SIZES, FONTS } from "../../constants";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles/doctorCard.js";

const DoctorCard = ({ doctor }) => {
  const name = doctor?.fullName || doctor?.email?.split("@")[0];
  const fee = doctor?.consultationFee;

  const rating = doctor?.ratings?.length
    ? (doctor?.ratings?.reduce((a, b) => a + b, 0) / doctor?.ratings?.length).toFixed(1)
    : "—";

  const FALLBACK_AVATAR = require("../../assets/images/doctor1.png");

  const DoctorAvatar = ({ uri }) => {
    const [error, setError] = useState(false);
    console.log("uri", uri);

    return (
      <Image
        source={error || !uri ? FALLBACK_AVATAR : { uri }}
        style={styles.avatarImage}
        onError={() => setError(true)}
      />
    );
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < Math.floor(rating) ? "star" : "star-outline"}
        size={14}
        color={COLORS.themey}
      />
    ));
  };

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <DoctorAvatar uri={doctor?.profilePicture} />
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>Dr. {name}</Text>
        <Text style={styles.speciality}>{doctor?.specialization?.name || "doctor"}</Text>

        <Text style={styles.fee}>Ksh {fee}</Text>
        <View style={styles.ratingContainer}>
          {renderStars(doctor?.ratings?.length ? rating : 3)}
          <Text style={styles.ratingText}>{doctor?.ratings?.length ? rating : ""}</Text>
        </View>

        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Book</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default React.memo(DoctorCard);
