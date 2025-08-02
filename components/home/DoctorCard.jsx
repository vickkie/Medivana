import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { COLORS, SIZES, FONTS } from "../../constants";
import { MessageCircle, Phone, Star } from "lucide-react-native";
import styles from "./styles/doctorCard.js";
import { useNavigation } from "@react-navigation/native";

const DoctorCard = ({ doctor, showBook }) => {
  const navigation = useNavigation();
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
      <Star
        key={index}
        size={14}
        color={COLORS.themey}
        fill={index < Math.floor(rating) ? COLORS.themey : "transparent"}
      />
    ));
  };

  return (
    <View style={styles.card}>
      {/* <TouchableOpacity onPress={() => navigation.navigate("DoctorDetails", { doctor })}> */}
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

        {showBook ? (
          <TouchableOpacity style={styles.bookButton} onPress={() => navigation.navigate("DoctorDetails", { doctor })}>
            {console.log("doctor", doctor)}
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
      {/* </TouchableOpacity> */}
    </View>
  );
};

export default React.memo(DoctorCard);
