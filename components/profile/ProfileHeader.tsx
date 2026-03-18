import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/themed-text";
import { CachedProfile } from "@/src/lib/appStorage";

interface ProfileHeaderProps {
  profile: CachedProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/deermic.webp")}
        style={styles.image}
      />
      <View style={styles.info}>
        <ThemedText type="defaultSemiBold" style={styles.name}>
          {profile.firstName} {profile.lastName}
        </ThemedText>
        <ThemedText style={styles.username}>@{profile.username}</ThemedText>
        <ThemedText style={styles.email}>{profile.email}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 20,
  },
  image: {
    height: 110,
    width: 110,
    borderRadius: 55,
    backgroundColor: "#eee",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
  },
  username: {
    fontSize: 18,
    color: "gray",
    marginTop: 2,
  },
  email: {
    fontSize: 14,
    color: "gray",
    marginTop: 2,
  },
});
