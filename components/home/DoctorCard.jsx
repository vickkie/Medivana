import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { COLORS } from "../../constants";
import { MessageCircle, Phone, Star } from "lucide-react-native";
import styles from "./styles/doctorCard.js";
import { useNavigation } from "@react-navigation/native";

const DoctorCard = ({ doctor, showBook }) => {
  const navigation = useNavigation();
  const name = doctor?.fullName || `${doctor?.firstname} ${doctor?.lastname}` || doctor?.email?.split("@")[0];
  const fee = doctor?.consultationFee;

  // Use backend-provided averageRating directly
  const rating = doctor?.averageRating ? doctor.averageRating.toFixed(1) : "—";

  const FALLBACK_AVATAR = require("../../assets/images/doctor1.png");

  const DoctorAvatar = ({ uri }) => {
    const [error, setError] = useState(false);

    return (
      <Image
        source={error || !uri || typeof uri !== "string" || uri.trim() === "" ? FALLBACK_AVATAR : { uri }}
        style={styles.avatarImage}
        onError={() => setError(true)}
      />
    );
  };

  const renderStars = (value) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={14}
        color={COLORS.themey}
        fill={index < Math.floor(value) ? COLORS.themey : "transparent"}
      />
    ));
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("DoctorDetails", { doctor })}>
      <View style={styles.avatar}>
        <DoctorAvatar uri={doctor?.profilePicture} />
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>
          {doctor?.title} {name}
        </Text>
        <Text style={styles.speciality}>{doctor?.specialization?.name || "doctor"}</Text>

        <Text style={styles.fee}>Ksh {fee}</Text>
        <View style={styles.ratingContainer}>
          {renderStars(doctor?.averageRating || 0)}
          <Text style={styles.ratingText}>{rating !== "—" ? rating : ""}</Text>
        </View>

        {showBook ? (
          <TouchableOpacity style={styles.bookButton} onPress={() => navigation.navigate("DoctorDetails", { doctor })}>
            <Text style={styles.bookButtonText}>Book</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionButtons}>
            <View style={styles.flexEnd}>
              <TouchableOpacity style={styles.actionButton}>
                <MessageCircle size={16} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Phone size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(DoctorCard);
