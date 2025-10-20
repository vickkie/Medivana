// ReceiptScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, Platform, ScrollView, TouchableOpacity } from "react-native";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import { WebView } from "react-native-webview";
import { shareAsync } from "expo-sharing";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../constants/icons";
import { SIZES, COLORS } from "../constants";
import Toast from "react-native-toast-message";

const LOGO = "https://res.cloudinary.com/drsuclnkw/image/upload/v1760445395/medivana-splash-light_gqzjqa.png";

const ReceiptScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const transaction = route.params?.appointment;

  if (!transaction) {
    return <Text>No appointment details</Text>;
  }

  const [pdfUri, setPdfUri] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // auto-generate preview PDF uri on mount (non-blocking)
    generatePDFPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };
  const formatDateTime = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const generateReceiptHTML = (tx) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      tx.bookingId || tx.transaction || tx._id || ""
    )}`;

    const userFull = tx.user?.fullname || tx.user?.username || "Valued Customer";
    const doctorFull =
      (tx.doctor?.title2 ?? tx.doctor?.title ?? "") +
      " " +
      (tx.doctor?.fullName ?? `${tx.doctor?.firstname ?? ""} ${tx.doctor?.lastname ?? ""}`.trim());

    return `
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Receipt</title>
      <style>
        * { box-sizing: border-box; font-family: -apple-system, Roboto, 'Segoe UI', Helvetica, Arial; }
        body { margin:0; padding:24px; background:#f3f7fb; color:#0f172a; }
        .card { max-width:760px; margin:0 auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 6px 24px rgba(15,23,42,0.08); }
        .header { background:#0f766e; padding:28px; color:#fff; display:flex; align-items:center; justify-content:space-between; }
        .brand { display:flex; align-items:center; gap:14px; }
        .brand img { width:56px; height:56px; border-radius:8px; background:#fff; padding:6px; }
        .brand h1 { margin:0; font-size:20px; letter-spacing:0.4px; }
        .brand small { display:block; font-size:10px; color:rgba(255,255,255,0.9); margin-top:4px; }
        .title { text-align:right; }
        .title h2 { margin:0; text-transform:uppercase; font-size:12px; letter-spacing:1.2px; }
        .title p { margin:6px 0 0; font-size:11px; color:#d1fae5; }
        .accent { height:4px; background:#14b8a6; }
        .body { padding:28px; }
        .statusRow { display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #f1f5f9; padding-bottom:18px; margin-bottom:18px; }
        .badge { padding:8px 14px; border-radius:20px; background:#d1fae5; border:1px solid #14b8a6; display:inline-block; font-weight:700; color:#064e47; text-transform:uppercase; font-size:10px; letter-spacing:0.6px; }
        .txid { font-family:monospace; color:#64748b; font-size:11px; }
        .grid { display:flex; gap:24px; margin-top:18px; }
        .col { flex:1; }
        .col.right { width:220px; flex:unset; }
        .sectionTitle { font-size:11px; font-weight:800; color:#0f172a; text-transform:uppercase; margin-bottom:12px; padding-bottom:8px; border-bottom:2px solid #14b8a6; }
        .info { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #f1f5f9; }
        .label { font-size:9px; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; }
        .value { font-size:11px; color:#0f172a; font-weight:600; }
        .amountBox { background:#f0fdfa; padding:14px; border-radius:8px; margin-top:10px; border:1px solid #99f6e4; }
        .amountBox .lbl { font-size:10px; color:#0f766e; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; }
        .amountBox .amt { font-size:26px; font-weight:900; color:#0f766e; margin-top:6px; }
        .customerCard { background:#f8fafc; padding:14px; border-radius:8px; border:1px solid #e2e8f0; text-align:left; }
        .customerCard h3 { margin:0 0 6px 0; font-size:13px; }
        .small { font-size:10px; color:#64748b; margin-top:6px; word-break:break-word; }
        .appointment { background:#fefce8; padding:18px; border-radius:8px; border:1px solid #fde047; margin-top:18px; }
        .appointment h4 { margin:0 0 8px 0; font-size:12px; color:#854d0e; text-transform:uppercase; }
        .footer { margin-top:26px; padding-top:20px; border-top:2px solid #f1f5f9; text-align:center; color:#94a3b8; font-size:11px; line-height:1.6; }
        .contact { margin-top:6px; font-size:10px; color:#64748b; }
        .qr { width:100px; height:100px; margin-top:8px; border-radius:6px; }
        @media (max-width: 700px) { .grid{flex-direction:column;} .title{text-align:right;} }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="brand">
            <img src="${LOGO}" alt="logo" />
            <div>
              <h1>Medivana</h1>
              <small>Healthcare Excellence</small>
            </div>
          </div>
          <div class="title">
            <h2>Payment Receipt</h2>
            <p>${formatDateTime(tx.createdAt)}</p>
          </div>
        </div>
        <div class="accent"></div>
        <div class="body">
          <div class="statusRow">
            <div class="badge">${tx.status || "Completed"}</div>
            <div class="txid">REF: ${tx.bookingId || "-"}</div>
          </div>

          <div class="grid">
            <div class="col">
              <div class="sectionTitle">Transaction Details</div>

              <div class="info">
                <div class="label">Payment Method</div>
                <div class="value">M-Pesa</div>
              </div>

              <div class="info">
                <div class="label">Transaction Date</div>
                <div class="value">${formatDate(tx.createdAt)}</div>
              </div>

              <div class="info">
                <div class="label">Transaction Time</div>
                <div class="value">${new Date(tx.createdAt).toLocaleTimeString("en-GB")}</div>
              </div>

              <div class="amountBox">
                <div class="lbl">Total Amount Paid</div>
                <div class="amt">KSh ${Number.parseFloat(tx.amount || tx.doctor?.consultationFee).toLocaleString(
                  "en-KE",
                  {
                    minimumFractionDigits: 2,
                  }
                )}</div>
              </div>
              
            </div>

            <div class="col right">
              <div class="sectionTitle">Patient</div>
              <div class="customerCard">
                <h3>${userFull}</h3>
                <div class="small">Username: ${tx.user?.username || "-"}</div>
                <div class="small">${(tx.userNotes && tx.userNotes.replace(/\n/g, "<br/>")) || ""}</div>
                <img src="${qrUrl}" class="qr" />
              </div>
            </div>
          </div>

          <div class="appointment">
            <h4>Appointment Information</h4>
            <div style="display:flex;justify-content:space-between;padding:6px 0;">
              <div class="label">Booking ID</div>
              <div class="value">${tx.bookingId || "-"}</div>
            </div>

            <div style="display:flex;justify-content:space-between;padding:6px 0;">
              <div class="label">Medic Name</div>
              <div class="value">${doctorFull}</div>
            </div>

            <div style="display:flex;justify-content:space-between;padding:6px 0;">
              <div class="label">Appointment Date</div>
              <div class="value">${formatDate(tx.appointmentDate)}</div>
            </div>

            <div style="display:flex;justify-content:space-between;padding:6px 0;">
              <div class="label">Appointment Time</div>
              <div class="value">${tx.appointmentTime || "-"}</div>
            </div>
          </div>

          <div class="footer">
            Thank you for choosing Medivana. This is an electronically generated receipt and is valid without a signature.
            <div class="contact">+254 706 676 569 • www.medivana.com • support@medivana.com</div>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  };

  const generatePDFPreview = async () => {
    try {
      setIsGenerating(true);
      const html = generateReceiptHTML(transaction);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      const dest = `${FileSystem.documentDirectory}receipt_preview.pdf`;
      await FileSystem.moveAsync({ from: uri, to: dest }).catch(() => {}); // ignore if move fails
      if (Platform.OS === "android") {
        const base64Data = await FileSystem.readAsStringAsync(dest, { encoding: FileSystem.EncodingType.Base64 });
        setPdfUri(`data:application/pdf;base64,${base64Data}`);
      } else {
        setPdfUri(dest);
      }
    } catch (err) {
      console.warn("Preview generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      const html = generateReceiptHTML(transaction);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      const newUri = `${FileSystem.documentDirectory}medivana_receipt_${Date.now()}.pdf`;
      await FileSystem.moveAsync({ from: uri, to: newUri });
      if (Platform.OS === "android") {
        const base64Data = await FileSystem.readAsStringAsync(newUri, { encoding: FileSystem.EncodingType.Base64 });
        setPdfUri(`data:application/pdf;base64,${base64Data}`);
      } else {
        setPdfUri(newUri);
      }
      Alert.alert("Success", "PDF generated and saved to app storage.");
    } catch (error) {
      console.error("generatePDF error", error);
      Alert.alert("Error", "Could not generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const pickDirectory = async () => {
    try {
      const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permission.granted) {
        return permission.directoryUri;
      } else {
        console.warn("Permission not granted for directory access.");
      }
    } catch (error) {
      console.warn("Error picking directory:", error);
    }
    return null;
  };

  const savePDF = async () => {
    if (!pdfUri) {
      Alert.alert("No PDF", "Please generate a PDF first (tap the download icon).");
      return;
    }
    try {
      const folderUri = await pickDirectory();
      if (!folderUri) {
        Alert.alert("Cancelled", "No folder selected");
        return;
      }
      const fileName = `Receipt-${transaction.bookingId || transaction._id || Date.now()}.pdf`;
      const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        folderUri,
        fileName,
        "application/pdf"
      );
      if (Platform.OS === "android" && pdfUri.startsWith("data:")) {
        const base64Str = pdfUri.split(",")[1];
        await FileSystem.writeAsStringAsync(newFileUri, base64Str, { encoding: FileSystem.EncodingType.Base64 });
      } else {
        await FileSystem.copyAsync({ from: pdfUri, to: newFileUri });
      }
      Toast.show({ type: "success", text1: "Saved Successfully!" });
    } catch (error) {
      console.error("savePDF error", error);
      Alert.alert("Error", "Could not save file");
    }
  };

  const sharePDF = async () => {
    if (!pdfUri) {
      Alert.alert("No PDF", "Please generate a PDF first (tap the download icon).");
      return;
    }
    try {
      if (Platform.OS === "android" && pdfUri.startsWith("data:")) {
        const tempFile = `${FileSystem.cacheDirectory}receipt_shared.pdf`;
        const base64Str = pdfUri.split(",")[1];
        await FileSystem.writeAsStringAsync(tempFile, base64Str, { encoding: FileSystem.EncodingType.Base64 });
        await shareAsync(tempFile);
      } else {
        await shareAsync(pdfUri);
      }
    } catch (error) {
      console.error("sharePDF error", error);
      Alert.alert("Error", "Could not share file");
    }
  };

  return (
    <SafeAreaView style={localStyles.safe}>
      <View style={localStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={localStyles.iconWrap}>
          <Icon name="backbutton" size={26} />
        </TouchableOpacity>
        <Text style={localStyles.title}>Receipt</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={localStyles.actionsRow}>
        <TouchableOpacity onPress={generatePDF} style={localStyles.actionBtn}>
          <Icon name="download" size={22} />
          <Text style={localStyles.actionText}>Generate</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={savePDF} style={localStyles.actionBtn}>
          <Icon name="download" size={22} />
          <Text style={localStyles.actionText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={sharePDF} style={localStyles.actionBtn}>
          <Icon name="share" size={22} />
          <Text style={localStyles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 12 }}>
        <View style={localStyles.preview}>
          <WebView
            originWhitelist={["*"]}
            source={{ html: generateReceiptHTML(transaction) }}
            style={{ height: 980, borderRadius: 10, overflow: "hidden" }}
            scalesPageToFit
            javaScriptEnabled
            useWebKit
          />
        </View>
      </ScrollView>

      <Toast />
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.themeg },
  header: {
    width: SIZES.width - 20,
    marginHorizontal: SIZES.xSmall,
    marginTop: 8,
    padding: 10,
    borderRadius: SIZES.large,
    backgroundColor: COLORS.themew,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconWrap: {
    backgroundColor: COLORS.themeg,
    padding: 10,
    borderRadius: 999,
  },
  title: { fontSize: SIZES.large, fontWeight: "700" },
  actionsRow: {
    width: SIZES.width - 20,
    marginHorizontal: SIZES.xSmall,
    marginTop: 10,
    padding: 10,
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.themew,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  actionBtn: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 12,
  },
  preview: {
    marginTop: 12,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
  },
});

export default ReceiptScreen;
