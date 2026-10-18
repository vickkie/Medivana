import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { COLORS, SIZES } from "../constants";

const PAGE_SIZE = 5;

const getReviewDate = (review) => {
  const raw = review?.date || review?.createdAt;
  if (!raw) return "";
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString();
};

const getReviewName = (review) =>
  review?.anonymous ? "Anonymous" : review?.userId?.username || review?.userId?.fullName || "Patient";

export default function DoctorReviews() {
  const navigation = useNavigation();
  const route = useRoute();
  const { ratings = [], doctorName = "Doctor" } = route.params || {};

  const [page, setPage] = useState(1);

  const sorted = useMemo(
    () =>
      [...ratings].sort((a, b) => {
        const aDate = new Date(a?.date || a?.createdAt || 0);
        const bDate = new Date(b?.date || b?.createdAt || 0);
        return bDate - aDate;
      }),
    [ratings],
  );

  const stats = useMemo(() => {
    const total = sorted.length;
    if (!total) return { average: "0.0", total: 0, breakdown: [0, 0, 0, 0, 0] };
    const breakdown = [0, 0, 0, 0, 0];
    let sum = 0;
    sorted.forEach((r) => {
      const score = Math.round(r?.rating ?? r?.rating?.score ?? 0);
      sum += score;
      if (score >= 1 && score <= 5) breakdown[score - 1] += 1;
    });
    return { average: (sum / total).toFixed(1), total, breakdown };
  }, [sorted]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const StarRow = ({ count, size = 15 }) => (
    <View style={{ flexDirection: "row", gap: 1 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Text key={i} style={{ color: i < count ? "#FEA900" : "#DDD", fontSize: size }}>
          ★
        </Text>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.circleButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={20} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ratings &amp; Reviews</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.overviewCard}>
        <Text style={styles.overviewTitle}>Patient feedback for {doctorName}</Text>
        <View style={styles.overviewRow}>
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreValue}>{stats.average}</Text>
            <StarRow count={Math.round(Number(stats.average))} />
            <Text style={styles.scoreCount}>{stats.total} reviews</Text>
          </View>
          <View style={styles.barsBlock}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.breakdown[star - 1];
              const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
              return (
                <View key={star} style={styles.barRow}>
                  <Text style={styles.barLabel}>{star}</Text>
                  <Text style={styles.barStar}>★</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.barPct}>{pct}%</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <ScrollView style={styles.listWrap} contentContainerStyle={{ paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
        {pageItems.length === 0 ? (
          <Text style={styles.emptyText}>No reviews yet</Text>
        ) : (
          pageItems.map((review, idx) => (
            <View key={idx} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewName}>{getReviewName(review)}</Text>
                <StarRow count={review?.rating ?? review?.rating?.score ?? 0} size={14} />
                {getReviewDate(review) ? <Text style={styles.reviewDate}>{getReviewDate(review)}</Text> : null}
              </View>
              <Text style={styles.reviewComment}>{review?.comment}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.pagination}>
        <TouchableOpacity
          style={styles.pageArrow}
          disabled={currentPage <= 1}
          onPress={() => setPage((p) => Math.max(1, p - 1))}
          accessibilityRole="button"
          accessibilityLabel="Previous page"
        >
          <ChevronLeft size={18} color={currentPage <= 1 ? "#CBD5E1" : "#334155"} />
        </TouchableOpacity>

        <View style={styles.pageNumbers}>
          {Array.from({ length: pageCount }).map((_, i) => {
            const n = i + 1;
            const active = n === currentPage;
            return (
              <TouchableOpacity
                key={n}
                onPress={() => setPage(n)}
                style={[styles.pageNumber, active && styles.pageNumberActive]}
                accessibilityRole="button"
                accessibilityLabel={`Page ${n}`}
              >
                <Text style={[styles.pageNumberText, active && styles.pageNumberTextActive]}>{n}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.pageArrow}
          disabled={currentPage >= pageCount}
          onPress={() => setPage((p) => Math.min(pageCount, p + 1))}
          accessibilityRole="button"
          accessibilityLabel="Next page"
        >
          <ChevronRight size={18} color={currentPage >= pageCount ? "#CBD5E1" : "#334155"} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: SIZES.medium,
    fontFamily: "bold",
    letterSpacing: 1,
    color: "#0F172A",
  },
  circleButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.themew,
    justifyContent: "center",
    alignItems: "center",
  },
  overviewCard: {
    backgroundColor: COLORS.themew,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 14,
    marginTop: 8,
    elevation: 2,
    shadowColor: "#213145",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  overviewTitle: {
    fontFamily: "semibold",
    fontSize: 14,
    color: "#0F172A",
    marginBottom: 12,
  },
  overviewRow: { flexDirection: "row", alignItems: "center" },
  scoreBlock: { width: 110 },
  scoreValue: { fontSize: 40, fontFamily: "bold", color: "#0F172A" },
  scoreCount: { fontSize: 12, color: "#64748B", fontFamily: "regular", marginTop: 4 },
  barsBlock: { flex: 1, marginLeft: 12 },
  barRow: { flexDirection: "row", alignItems: "center", marginVertical: 3 },
  barLabel: { width: 12, fontSize: 12, fontFamily: "medium", color: "#475569" },
  barStar: { fontSize: 12, color: "#FEA900", marginRight: 8 },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EEF2F7",
    overflow: "hidden",
  },
  barFill: { height: 6, borderRadius: 3, backgroundColor: COLORS.themey },
  barPct: { width: 34, fontSize: 11, fontFamily: "medium", color: "#64748B", textAlign: "right", marginLeft: 6 },
  listWrap: { flex: 1, paddingHorizontal: 14, marginTop: 12 },
  reviewCard: {
    backgroundColor: "#F2F5FA",
    borderRadius: 10,
    padding: 12,
    marginBottom: 9,
  },
  reviewHeader: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  reviewName: {
    fontFamily: "semibold",
    fontSize: 15,
    color: "#242D3B",
    marginRight: 10,
  },
  reviewDate: { marginLeft: 12, fontSize: 12, color: "#8995A2" },
  reviewComment: { color: "#3F485B", fontFamily: "medium", fontSize: 15 },
  emptyText: {
    textAlign: "center",
    color: "#94A3B8",
    marginTop: 50,
    fontFamily: "regular",
    fontSize: SIZES.medium,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 14,
  },
  pageArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.themew,
    justifyContent: "center",
    alignItems: "center",
  },
  pageNumbers: { flexDirection: "row", gap: 6 },
  pageNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  pageNumberActive: { backgroundColor: COLORS.themey },
  pageNumberText: { fontSize: 14, fontFamily: "medium", color: "#475569" },
  pageNumberTextActive: { color: COLORS.themew, fontFamily: "semibold" },
});
