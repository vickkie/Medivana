import { Text, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import * as FileSystem from "expo-file-system";
import styles from "./categorycardview.style";

import { Star } from "lucide-react-native";

// Function to generate a unique file name based on the image URL
const generateFileName = (uri) => {
  // Use base64 encoding of the URL for file name safety
  return encodeURIComponent(uri).replace(/%/g, "_") + ".jpg";
};

// Function to cache image
const cacheImage = async (uri) => {
  try {
    const fileName = generateFileName(uri);
    const fileUri = FileSystem.documentDirectory + fileName;
    const { exists } = await FileSystem.getInfoAsync(fileUri);

    if (!exists) {
      // console.log(`Downloading image to ${fileUri}`);
      await FileSystem.downloadAsync(uri, fileUri);
    } else {
      // console.log(`Image already cached at ${fileUri}`);
    }
    return fileUri;
  } catch (error) {
    // console.error(`Failed to cache image from ${uri}`, error);
    return uri; // Fallback to direct URL if caching fails
  }
};

const CategoryCardView = ({ item }) => {
  const [imageUri, setImageUri] = React.useState(null);

  React.useEffect(() => {
    const loadImage = async () => {
      const cachedUri = await cacheImage(item.imageUrl);
      setImageUri(cachedUri);
    };
    loadImage();
  }, [item.imageUrl]);

  return (
    <TouchableOpacity activeOpacity={1}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={
              imageUri || item.imageUrl
                ? { uri: imageUri || item.imageUrl }
                : require("../../assets/images/no-found.png")
            }
            style={styles.image}
          />
        </View>
        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => {}}>
          <Star name="asterisk" size={24} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default CategoryCardView;
