import { View, TouchableOpacity, TextInput } from "react-native";
import React from "react";
import styles from "./welcome.style";

import { useNavigation } from "@react-navigation/native";
import Icon from "../../constants/icons";
import { COLORS, SIZES } from "../../constants";

const Welcome = ({ setSearchQuery, searchQuery }) => {
  const navigation = useNavigation();

  return (
    <View>
      <View style={styles.searchContainer}>
        <TouchableOpacity>
          <Icon name="search" size={24} style={styles.searchIcon} />
        </TouchableOpacity>
        <View style={styles.searchWrapper}>
          <TextInput
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
            onPressIn={() => navigation.navigate("Search")}
            style={styles.searchInput}
            placeholder="Search doctor by name"
          />
        </View>
        <View style={styles.searchBtn}>
          <TouchableOpacity style={styles.tuning}>
            <Icon name="tuning" size={24} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Welcome;
