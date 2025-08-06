import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Shield, Calendar, Eye, Lock, Users, FileText } from "lucide-react-native";
import Icon from "../../constants/icons";
import { COLORS, SIZES } from "../../constants";
import privacyData from "../../assets/data/privacyPolicy.json";
import { BACKEND_PORT } from "@env";

console.log(privacyData);

const PrivacyPolicy = () => {
  const navigation = useNavigation();
  const [policyData, setPolicyData] = useState(privacyData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrivacyPolicy();
  }, []);

  const loadPrivacyPolicy = async () => {
    try {
      // In real app, this would be an API call or file read
      const response = await fetch(`${BACKEND_PORT}/api/privacy-policy`);

      const data = await response.json();

      // Simulate loading delay
      setTimeout(() => {
        setPolicyData(data);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Failed to load privacy policy:", error);
      setLoading(false);
    }
  };

  const getIconComponent = (iconName) => {
    const iconProps = { size: 20, color: COLORS.themey };
    switch (iconName) {
      case "eye":
        return <Eye {...iconProps} />;
      case "users":
        return <Users {...iconProps} />;
      case "lock":
        return <Lock {...iconProps} />;
      case "shield":
        return <Shield {...iconProps} />;
      case "filetext":
        return <FileText {...iconProps} />;
      default:
        return <Shield {...iconProps} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.upperRow}>
          <View style={styles.topButts}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, styles.buttonWrap]}>
              <Icon name="backbutton" size={26} />
            </TouchableOpacity>
            <Text style={styles.heading}>Privacy Policy</Text>
            <View style={styles.outWrap} />
          </View>
          <View style={styles.lowerheader}>
            <Text style={styles.statement}>Your privacy is important to us. Learn how we protect your data.</Text>
            {policyData && (
              <View style={styles.versionInfo}>
                <Text style={styles.versionText}>
                  Last updated: {formatDate(policyData?.lastUpdated)} • Version {policyData?.version}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {loading ? (
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.themey} />
            <Text style={styles.loadingText}>Loading Privacy Policy...</Text>
          </View>
        </SafeAreaView>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.detailsWrapper}>
            {policyData?.sections.map((section) => (
              <View key={section.id} style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  {getIconComponent(section.icon)}
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>

                {section.content.map((item, index) => (
                  <View key={index} style={styles.contentItem}>
                    <Text style={styles.contentSubtitle}>{item.subtitle}</Text>
                    <Text style={styles.contentText}>{item.text}</Text>
                  </View>
                ))}
              </View>
            ))}

            <View style={styles.footerSection}>
              <Text style={styles.footerText}>
                This privacy policy is effective as of the date listed above and may be updated from time to time. We
                will notify you of any material changes through the app or via email.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
  },
  wrapper: {
    backgroundColor: COLORS.themey,
    paddingBottom: 20,
  },
  upperRow: {
    marginHorizontal: 20,
    paddingTop: 10,
  },
  topButts: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  backBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: 40,
    height: 40,
  },
  buttonWrap: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  heading: {
    fontSize: SIZES.large,
    color: COLORS.white,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 20,
  },
  outWrap: {
    width: 40,
    height: 40,
  },
  lowerheader: {
    marginTop: 10,
  },
  statement: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 22,
  },
  versionInfo: {
    marginTop: 10,
    alignItems: "center",
  },
  versionText: {
    fontSize: SIZES.small,
    color: COLORS.white,
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  detailsWrapper: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray2,
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontWeight: "bold",
    color: COLORS.primary,
    marginLeft: 12,
    flex: 1,
  },
  contentItem: {
    marginBottom: 16,
  },
  contentSubtitle: {
    fontSize: SIZES.medium,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 8,
  },
  contentText: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    lineHeight: 20,
    textAlign: "justify",
  },
  footerSection: {
    backgroundColor: COLORS.gray2,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  footerText: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    textAlign: "center",
    lineHeight: 18,
    fontStyle: "italic",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: SIZES.medium,
    color: COLORS.gray,
  },
});

export default PrivacyPolicy;
