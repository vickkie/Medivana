import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";
import { useFormik } from "formik";
import * as Yup from "yup";
import { COLORS, SIZES } from "../constants";
import Icon from "../constants/icons";

const paymentMethods = {
  Mpesa: { label: "Mpesa", imagePath: require("../assets/images/logos/Mpesa.png") },
  Visa: { label: "Visa", imagePath: require("../assets/images/logos/visa.png") },
  MasterCard: { label: "MasterCard", imagePath: require("../assets/images/logos/mastercard.png") },
  PayPal: { label: "PayPal", imagePath: require("../assets/images/logos/paypal.png") },
};

const CheckoutStep3 = ({ phoneNumber, email, totalAmount, handleSubmitOrder, isLoading = false }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("MasterCard");

  // ✅ Validation Schema
  const paymentValidationSchema = Yup.object().shape({
    selectedPaymentMethod: Yup.string().required("Select a payment method"),

    email: Yup.string().email("Invalid email").required("Email is required"),

    nameOnCard: Yup.string().when("selectedPaymentMethod", {
      is: (val) => ["Visa", "MasterCard"].includes(val),
      then: (schema) => schema.required("Name on card is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

    customer: Yup.string().when("selectedPaymentMethod", {
      is: (val) => ["Visa", "MasterCard"].includes(val),
      then: (schema) => schema.required("Customer name is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

    cardNumber: Yup.string().when("selectedPaymentMethod", {
      is: (val) => ["Visa", "MasterCard"].includes(val),
      then: (schema) =>
        schema.matches(/^\d{12,17}$/, "Card number must be between 12–16 digits").required("Card number is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

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
      customer: "",
      nameOnCard: selectedPaymentMethod.toLowerCase(),
      cardNumber: "",
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
  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
    formik.setFieldValue("selectedPaymentMethod", method);
    formik.validateForm();
  };

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Payment Method</Text>

      {/* Payment Method Selector */}
      <View style={styles.paymentMethods}>
        {Object.entries(paymentMethods).map(([method, { label, imagePath }]) => (
          <TouchableOpacity
            key={method}
            style={[styles.paymentMethodButton, selectedPaymentMethod === method && styles.selectedPaymentMethod]}
            onPress={() => handlePaymentMethodChange(method)}
          >
            <Image source={imagePath} style={{ height: 24, width: 48 }} />
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

          {["Visa", "MasterCard"].includes(selectedPaymentMethod) && (
            <>
              <Text style={styles.label}>Name on Card</Text>
              <TextInput
                style={styles.input}
                placeholder="Full name on card"
                value={formik.values.customer}
                onChangeText={formik.handleChange("customer")}
                onBlur={formik.handleBlur("customer")}
              />
              {formik.touched.customer && formik.errors.customer && (
                <Text style={styles.error}>{formik.errors.customer}</Text>
              )}

              <Text style={styles.label}>Card Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Card Number"
                keyboardType="numeric"
                value={formatCardNumber(formik.values.cardNumber)}
                onChangeText={(text) => formik.setFieldValue("cardNumber", text.replace(/\D/g, ""))}
                onBlur={formik.handleBlur("cardNumber")}
                maxLength={19}
              />
              {formik.touched.cardNumber && formik.errors.cardNumber && (
                <Text style={styles.error}>{formik.errors.cardNumber}</Text>
              )}
            </>
          )}
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
                <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 30 }}>
                  <ActivityIndicator size={27} color="#fff" />
                  <Text style={styles.submitText}> Processing ...</Text>
                </View>
              ) : (
                <Text style={styles.submitText}>Submit Order</Text>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.submitIconWrapper}>
            <Icon name="cartcheck" size={29} />
          </View>
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
    marginBottom: 8,
    fontFamily: "semibold",
  },
  paymentMethods: {
    flexDirection: "row",
    marginBottom: 16,
  },
  paymentMethodButton: {
    padding: 8,
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
  submitIconWrapper: {
    height: 50,
    width: 50,
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.themew,
    justifyContent: "center",

    position: "absolute",
    right: 1,
    alignItems: "center",
  },
});
