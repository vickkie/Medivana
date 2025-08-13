"use client";

//@ts-nocheck
import { useMemo, useCallback, useRef, forwardRef, useContext, useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { COLORS, SIZES } from "../../constants";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../components/auth/AuthContext";
import Toast from "react-native-toast-message";
import { Star } from "lucide-react-native";
import axios from "axios";
import { BACKEND_PORT } from "@env";

const RatingBottomSheet = forwardRef((props, ref) => {
  const snapPoints = useMemo(() => [400, 450], []);
  const { appointment, onRatingSubmitted } = props;
  const navigation = useNavigation();
  const { userData, userLogout, userLogin } = useContext(AuthContext);

  const internalRef = useRef(null);
  const bottomSheetRef = ref || internalRef;

  const [userId, setUserId] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!userLogin) {
      setUserId(1);
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} opacity={0.3} />,
    []
  );

  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2 ? text2 : "",
      visibilityTime: 3000,
    });
  };

  const handleStarPress = (starRating) => {
    setRating(starRating);
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => handleStarPress(i)}>
          <Star size={32} color={i <= rating ? "#FFD700" : "#DDD"} fill={i <= rating ? "#FFD700" : "transparent"} />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      showToast("error", "Please select a rating", "Rating is required");
      return;
    }

    console.log(rating, comment);

    setIsSubmitting(true);
    try {
      const { data } = await axios.post(
        `${BACKEND_PORT}/api/v1/appointment/${appointment._id}/rate`,
        {
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${userData?.TOKEN}`,
          },
        }
      );

      showToast("success", "Rating submitted", "Thank you for your feedback!");
      setRating(0);
      setComment("");
      onRatingSubmitted?.(data); // so parent can refresh list
    } catch (error) {
      console.error("Error submitting rating:", error);
      const errMsg = error.response?.data?.message || "Failed to submit rating";
      showToast("error", "Failed to submit rating", errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setComment("");
  };

  useEffect(() => {
    // Reset form when appointment changes
    resetForm();
  }, [appointment]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      onChange={(index) => {
        if (index === -1) {
          resetForm();
        }
      }}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: COLORS.themeg, borderRadius: SIZES.medium }}
      backdropComponent={renderBackdrop}
      bottomInset={20}
      containerStyle={{ borderRadius: SIZES.large, marginHorizontal: 10 }}
      handleIndicatorStyle={styles.handlebar}
      handleHeight={10}
    >
      <View style={styles.container}>
        <View style={styles.menuHeader}>
          <Text style={styles.heading}>Rate Your Experience</Text>
        </View>

        {appointment && (
          <View style={styles.appointmentInfo}>
            <Text style={styles.doctorName}>Dr. {appointment.doctor?.fullName}</Text>
            <Text style={styles.appointmentDate}>
              {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
            </Text>
            <Text style={styles.bookingId}>Booking ID: {appointment.bookingId}</Text>
          </View>
        )}

        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>How was your experience?</Text>
          <View style={styles.starsContainer}>{renderStars()}</View>
          <Text style={styles.ratingText}>
            {rating === 0 ? "Tap to rate" : `${rating} star${rating !== 1 ? "s" : ""}`}
          </Text>
        </View>

        <View style={styles.commentSection}>
          <Text style={styles.commentLabel}>Additional Comments (Optional)</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Share your experience..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, (rating === 0 || isSubmitting) && styles.submitButtonDisabled]}
            onPress={handleSubmitRating}
            disabled={rating === 0 || isSubmitting}
          >
            <Text style={styles.submitButtonText}>{isSubmitting ? "Submitting..." : "Submit Rating"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheetModal>
  );
});

export default RatingBottomSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: SIZES.medium,
  },
  menuHeader: {
    alignItems: "center",
    width: SIZES.width - 35,
    paddingHorizontal: 30,
    justifyContent: "center",
    borderBottomColor: "#ccc",
    borderStyle: "solid",
    borderBottomWidth: SIZES.width * 0.00058,
    paddingVertical: SIZES.small / 2,
    marginTop: -10,
    marginBottom: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    fontFamily: "bold",
  },
  appointmentInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.themeb,
    fontFamily: "semibold",
  },
  appointmentDate: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  bookingId: {
    fontSize: 12,
    color: COLORS.gray2,
    marginTop: 2,
  },
  ratingSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.themeb,
    marginBottom: 15,
    fontFamily: "semibold",
  },
  starsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  commentSection: {
    width: "100%",
    marginBottom: 20,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.themeb,
    marginBottom: 8,
    fontFamily: "semibold",
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: COLORS.themew,
    minHeight: 80,
  },
  buttonContainer: {
    width: "100%",
  },
  submitButton: {
    backgroundColor: COLORS.themey,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "semibold",
  },
  handlebar: {
    width: SIZES.xxLarge * 2,
    backgroundColor: COLORS.themey,
  },
});
