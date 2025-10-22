import React from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "../../constants/icons";
import { COLORS, SIZES } from "../../constants";
import { useWish } from "../../contexts/WishContext";
import { useNavigation } from "@react-navigation/native";
import { Heart } from "lucide-react-native";

const FavouritesList = ({ wishlist }) => {
  const { removeFromWishlist } = useWish();
  const navigation = useNavigation();

  const renderItem = ({ item: doctor }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() => navigation.navigate("DoctorDetails", { doctor: doctor })}
    >
      <Image source={{ uri: doctor.profilePicture }} style={styles.doctorImage} />
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>{doctor.fullName}</Text>
        <Text style={styles.doctorSpecialization}>{doctor.specialization?.name}</Text>
        <Text style={styles.doctorLocation}>{doctor.location}</Text>
        <Text style={styles.doctorFee}>Kshs {doctor.consultationFee}</Text>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => removeFromWishlist(doctor)}>
        <Icon name="delete" size={24} color={COLORS.red} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (wishlist.length === 0) {
    return (
      <View style={styles.emptyListContainer}>
        <Heart name="heart-outline" size={30} color={COLORS.gray} />
        <Text style={styles.emptyListText}>Your Favourites is empty.</Text>
        <Text style={styles.emptyListSubText}>Start adding doctors you like!</Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate("Bottom Navigation", { screen: "Categories" })}
        >
          <Text style={styles.browseButtonText}>Browse Doctors</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={wishlist}
      renderItem={renderItem}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.listContentContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContentContainer: {
    paddingHorizontal: SIZES.small,
    paddingBottom: SIZES.xxLarge * 2,
  },
  doctorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    padding: SIZES.small,
    marginBottom: SIZES.small,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: SIZES.small,
    marginRight: SIZES.small,
    resizeMode: "contain",
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontFamily: "bold",
    fontSize: SIZES.medium,
    color: COLORS.themeb,
  },
  doctorSpecialization: {
    fontFamily: "regular",
    fontSize: SIZES.small + 4,
    color: COLORS.gray,
  },
  doctorLocation: {
    fontFamily: "regular",
    fontSize: SIZES.small + 3,
    color: COLORS.gray,
  },
  doctorFee: {
    fontFamily: "semibold",
    fontSize: SIZES.medium,
    color: COLORS.primary,
    marginTop: SIZES.xSmall,
  },
  removeButton: {
    padding: SIZES.xSmall,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: SIZES.xxLarge * 2,
    paddingHorizontal: SIZES.medium,
  },
  emptyListText: {
    fontFamily: "bold",
    fontSize: SIZES.large,
    color: COLORS.themeb,
    marginTop: SIZES.medium,
  },
  emptyListSubText: {
    fontFamily: "regular",
    fontSize: SIZES.medium,
    color: COLORS.gray,
    textAlign: "center",
    marginTop: SIZES.xSmall,
  },
  browseButton: {
    backgroundColor: COLORS.primary, // Use a suitable color from your constants
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.medium,
    borderRadius: SIZES.medium,
    marginTop: SIZES.large,
  },
  browseButtonText: {
    color: COLORS.white,
    fontFamily: "semibold",
    fontSize: SIZES.medium,
  },
});

export default FavouritesList;
