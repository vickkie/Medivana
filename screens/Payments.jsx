import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";
import { useFormik } from "formik";
import * as Yup from "yup";
import { COLORS, SIZES } from "../constants";
import Icon from "../constants/icons";

const paymentMethods = {
  Mpesa: { label: "M-Pesa", imagePath: require("../assets/images/logos/Mpesa.png") },
  Airtel: { label: "Airtel Money", imagePath: require("../assets/images/logos/airtel-money-w.png") },
  PesaLink: { label: "PesaLink", imagePath: require("../assets/images/logos/pesalink-logo.png") },
  Paystack: { label: "Card/M-Pesa", imagePath: require("../assets/images/logos/crediit-card.png") },
};

const CheckoutStep3 = ({ phoneNumber, email, totalAmount, handleSubmitOrder, isLoading = false }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Paystack");
  const [selectedLabel, setSelectedLabel] = useState("Card/M-Pesa");

  const paymentValidationSchema = Yup.object().shape({
    selectedPaymentMethod: Yup.string().required("Select a payment method"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phoneNumber: Yup.string().when("selectedPaymentMethod", {
      is: (val) => val === "Mpesa" || val === "Airtel",
      then: (schema) => schema.matches(/^\+?\d{10,15}$/, "Invalid phone number").required("Phone number is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const formik = useFormik({
    initialValues: {
      phoneNumber: phoneNumber || "",
      email: email || "",
      selectedPaymentMethod,
    },
    validationSchema: paymentValidationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      await handleSubmitOrder(values);
    },
  });

  const handlePaymentMethodChange = (method, label) => {
    setSelectedPaymentMethod(method);
    setSelectedLabel(label);
    formik.setFieldValue("selectedPaymentMethod", method);
    formik.validateForm();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Payment Method - {selectedLabel}</Text>

      <View style={styles.paymentMethods}>
        {Object.entries(paymentMethods).map(([method, { label, imagePath }]) => (
          <TouchableOpacity
            key={method}
            style={[styles.paymentMethodButton, selectedPaymentMethod === method && styles.selectedPaymentMethod]}
            onPress={() => handlePaymentMethodChange(method, label)}
          >
            <View style={styles.paymentImageWrapper}>
              <Image source={imagePath} style={styles.paymentImage} resizeMode="contain" />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {selectedPaymentMethod === "Mpesa" || selectedPaymentMethod === "Airtel" ? (
        <>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            keyboardType="numeric"
            value={formik.values.phoneNumber}
            onChangeText={(text) => formik.setFieldValue("phoneNumber", text)}
            onBlur={formik.handleBlur("phoneNumber")}
          />
          {formik.touched.phoneNumber && formik.errors.phoneNumber && (
            <Text style={styles.error}>{formik.errors.phoneNumber}</Text>
          )}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={formik.values.email}
            onChangeText={formik.handleChange("email")}
            onBlur={formik.handleBlur("email")}
          />
          {formik.touched.email && formik.errors.email && <Text style={styles.error}>{formik.errors.email}</Text>}
        </>
      ) : (
        <>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={formik.values.email}
            onChangeText={formik.handleChange("email")}
            onBlur={formik.handleBlur("email")}
          />
          {formik.touched.email && formik.errors.email && <Text style={styles.error}>{formik.errors.email}</Text>}
        </>
      )}

      <View style={styles.navRow}>
        <View style={styles.totalsRow}>
          <Text style={styles.totalhead}>Total Price</Text>
          <Text style={styles.totalAmount}>
            {`Ksh ${new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "KES",
            })
              .format(totalAmount)
              .replace("KES", "")
              .trim()}`}
          </Text>
        </View>

        <View style={styles.navigationButtons}>
          <TouchableOpacity
            onPress={formik.handleSubmit}
            style={[styles.submitOrder, { backgroundColor: isLoading ? COLORS.deepblue : COLORS.themey }]}
            disabled={isLoading}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {isLoading ? (
                <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 20 }}>
                  <ActivityIndicator size={27} color="#fff" />
                  <Text style={styles.submitinText}> Processing Payment...</Text>
                </View>
              ) : (
                <Text style={styles.submitText}>Checkout Payment</Text>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.submitIconWrapper}>
            <Icon name="cartcheck" size={24} />
          </View>
        </View>

        <View style={styles.paystackBadge}>
          <View style={styles.paystackDot} />
          <Text style={styles.paystackText}>Secured by Paystack</Text>
        </View>
      </View>
    </View>
  );
};

export default CheckoutStep3;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: SIZES.medium,
  },
  label: {
    fontSize: SIZES.small + 2,
    marginBottom: 23,
    fontFamily: "semibold",
  },
  paymentMethods: {
    flexDirection: "row",
    marginBottom: 16,
    marginRight: 20,
  },
  paymentMethodButton: {
    padding: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedPaymentMethod: {
    borderColor: "#000",
  },
  paymentImageWrapper: {
    width: 60,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  paymentImage: {
    width: "100%",
    height: "100%",
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.themeg,
    padding: 10,
    borderRadius: SIZES.medium,
    marginBottom: 10,
    width: SIZES.width - 50,
  },
  row: {
    flexDirection: "row",
  },
  halfInput: {
    flex: 1,
    marginRight: 8,
  },
  error: {
    color: "red",
    marginBottom: 8,
    marginStart: 5,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navRow: {
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 30,
  },
  totalsRow: {
    gap: 6,
    flexDirection: "row",
    width: SIZES.width - 50,
    justifyContent: "space-between",
    marginBottom: SIZES.medium,
  },
  totalhead: {
    fontFamily: "medium",
    fontSize: SIZES.medium,
  },
  totalAmount: {
    fontFamily: "medium",
    fontSize: SIZES.xLarge,
  },
  submitOrder: {
    height: 65,
    justifyContent: "center",
    alignItems: "flex-start",
    width: SIZES.width - 50,
    borderRadius: SIZES.medium,
  },
  submitText: {
    fontFamily: "medium",
    fontSize: SIZES.large,
    color: COLORS.white,
    paddingLeft: 30,
    textAlign: "center",
  },
  submitinText: {
    fontFamily: "medium",
    fontSize: SIZES.large,
    color: COLORS.white,
    paddingLeft: 10,
    textAlign: "center",
  },
  submitIconWrapper: {
    height: 50,
    width: 50,
    marginRight: 6,
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.themew,
    justifyContent: "center",
    position: "absolute",
    right: 1,
    alignItems: "center",
  },
  paystackBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f0f9f6",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#0BAB7B",
  },
  paystackDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0BAB7B",
    marginRight: 8,
  },
  paystackText: {
    fontSize: SIZES.small + 1,
    fontFamily: "semibold",
    color: "#0BAB7B",
  },
});
