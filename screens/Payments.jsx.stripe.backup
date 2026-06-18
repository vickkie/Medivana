import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Linking } from "react-native";
import { useFormik } from "formik";
import * as Yup from "yup";
import { COLORS, SIZES } from "../constants";
import Icon from "../constants/icons";
const safeIMg = require("../assets/images/logos/safe-ensure.png");

const paymentMethods = {
  Mpesa: { label: "Mpesa", imagePath: require("../assets/images/logos/Mpesa.png") },
  Card: { label: "Card", imagePath: require("../assets/images/logos/crediit-card.png") },
  Stripe: { label: "Stripe", imagePath: require("../assets/images/logos/link.png") },
  CashApp: { label: "CashApp", imagePath: require("../assets/images/logos/Cash_App.png") },
  amazon_pay: { label: "Amazon Pay", imagePath: require("../assets/images/logos/Amazon_Pay.png") },
};

const CheckoutStep3 = ({ phoneNumber, email, totalAmount, handleSubmitOrder, isLoading = false }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Card");
  const [selectedLabel, setSelectedLabel] = useState("Card");

  // ✅ Validation Schema
  const paymentValidationSchema = Yup.object().shape({
    selectedPaymentMethod: Yup.string().required("Select a payment method"),

    email: Yup.string().email("Invalid email").required("Email is required"),

    phoneNumber: Yup.string().when("selectedPaymentMethod", {
      is: "Mpesa",
      then: (schema) => schema.matches(/^\+?\d{10,15}$/, "Invalid phone number").required("Phone number is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  // ✅ Formik Setup
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
      console.log("Submitting:", values);
      await handleSubmitOrder(values);
    },
  });

  // ✅ Update method & revalidate when changing method
  const handlePaymentMethodChange = (method, label) => {
    setSelectedPaymentMethod(method);
    setSelectedLabel(label);
    formik.setFieldValue("selectedPaymentMethod", method);
    formik.validateForm();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Payment Method - {selectedLabel}</Text>

      {/* Payment Method Selector */}
      <View style={styles.paymentMethods}>
        {Object.entries(paymentMethods).map(([method, { label, imagePath }]) => (
          <TouchableOpacity
            key={method}
            style={[styles.paymentMethodButton, selectedPaymentMethod === method && styles.selectedPaymentMethod]}
            onPress={() => handlePaymentMethodChange(method, label)}
          >
            <Image source={imagePath} style={{ height: 34, width: 48 }} />
          </TouchableOpacity>
        ))}
      </View>

      {/* === Conditional Form Fields === */}
      {selectedPaymentMethod === "Mpesa" ? (
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

      {/* === Footer Section === */}
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
        <View style={{ marginTop: 50 }}>
          <TouchableOpacity
            onPress={() => {
              Linking.openURL("https://stripe.com/");
            }}
          >
            <Image source={safeIMg} style={{ height: SIZES.width / 4, width: SIZES.width - 40 }} />
          </TouchableOpacity>
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
    // color: COLORS.themey,
  },
  paymentMethods: {
    flexDirection: "row",
    marginBottom: 16,
    marginRight: 20,
  },
  paymentMethodButton: {
    padding: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    marginRight: 8,
  },
  selectedPaymentMethod: {
    borderColor: "#000",
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
    // flexDirection: "row",
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
    // backgroundColor: COLORS.primary,
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
});
