import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import React, { useState } from "react";
import { Pressable, StyleSheet, Switch, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const TEAM_MEMBERS = [
  {
    id: "1",
    name: "Alice Johnson",
    role: "Manager",
    email: "alice@agrimed.com",
    avatar: "👩‍💼",
    status: "Online",
  },
  {
    id: "2",
    name: "Bob Smith",
    role: "Sales",
    email: "bob@agrimed.com",
    avatar: "👨‍💼",
    status: "Online",
  },
  {
    id: "3",
    name: "Charlie Brown",
    role: "Inventory",
    email: "charlie@agrimed.com",
    avatar: "👨‍🔬",
    status: "Offline",
  },
];

const BUSINESS_INFO = {
  name: "AgriMed Solutions",
  address: "123 Farm Road, Agri City",
  phone: "+91 98765 43210",
  email: "info@agrimed.com",
  gst: "GST123456789",
};

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#43cea2", dark: "#232526" }}
      headerImage={
        <Animated.View
          entering={FadeInDown.duration(800)}
          style={styles.headerImageWrap}
        >
          <IconSymbol
            name="person.crop.circle.fill"
            size={120}
            color="#fff"
            style={{ opacity: 0.9 }}
          />
          <ThemedText type="title" style={styles.headerTitle}>
            Settings & Profile
          </ThemedText>
        </Animated.View>
      }
    >
      {/* Business Profile Section */}
      <Animated.View
        entering={FadeInUp.delay(100).duration(600)}
        style={styles.section}
      >
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          🏢 Business Profile
        </ThemedText>
        <View style={styles.card}>
          <View style={styles.businessHeader}>
            <ThemedText type="title" style={styles.businessName}>
              {BUSINESS_INFO.name}
            </ThemedText>
            <Pressable style={styles.editButton}>
              <ThemedText style={styles.editButtonText}>✏️ Edit</ThemedText>
            </Pressable>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>📍 Address:</ThemedText>
            <ThemedText style={styles.infoValue}>
              {BUSINESS_INFO.address}
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>📞 Phone:</ThemedText>
            <ThemedText style={styles.infoValue}>
              {BUSINESS_INFO.phone}
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>📧 Email:</ThemedText>
            <ThemedText style={styles.infoValue}>
              {BUSINESS_INFO.email}
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>🏛️ GST:</ThemedText>
            <ThemedText style={styles.infoValue}>
              {BUSINESS_INFO.gst}
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      {/* Team Members Section */}
      <Animated.View
        entering={FadeInUp.delay(200).duration(600)}
        style={styles.section}
      >
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          👥 Team Members
        </ThemedText>
        {TEAM_MEMBERS.map((member, index) => (
          <View key={member.id} style={styles.teamCard}>
            <View style={styles.memberInfo}>
              <ThemedText style={styles.memberAvatar}>
                {member.avatar}
              </ThemedText>
              <View style={styles.memberDetails}>
                <ThemedText type="subtitle" style={styles.memberName}>
                  {member.name}
                </ThemedText>
                <ThemedText style={styles.memberRole}>{member.role}</ThemedText>
                <ThemedText style={styles.memberEmail}>
                  {member.email}
                </ThemedText>
              </View>
            </View>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    member.status === "Online" ? "#43cea2" : "#ff6b6b",
                },
              ]}
            />
          </View>
        ))}
        <Pressable style={styles.addMemberButton}>
          <ThemedText style={styles.addMemberText}>
            ➕ Add Team Member
          </ThemedText>
        </Pressable>
      </Animated.View>

      {/* App Settings Section */}
      <Animated.View
        entering={FadeInUp.delay(300).duration(600)}
        style={styles.section}
      >
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          ⚙️ App Settings
        </ThemedText>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>
                🔔 Notifications
              </ThemedText>
              <ThemedText style={styles.settingDescription}>
                Receive alerts for low stock and sales
              </ThemedText>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#767577", true: "#43cea2" }}
              thumbColor={notifications ? "#fff" : "#f4f3f4"}
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>🌙 Dark Mode</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Switch to dark theme
              </ThemedText>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#767577", true: "#43cea2" }}
              thumbColor={darkMode ? "#fff" : "#f4f3f4"}
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>🔄 Auto Sync</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Automatically sync data with cloud
              </ThemedText>
            </View>
            <Switch
              value={autoSync}
              onValueChange={setAutoSync}
              trackColor={{ false: "#767577", true: "#43cea2" }}
              thumbColor={autoSync ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>
      </Animated.View>

      {/* Account Actions Section */}
      <Animated.View
        entering={FadeInUp.delay(400).duration(600)}
        style={styles.section}
      >
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          🔐 Account
        </ThemedText>
        <View style={styles.card}>
          <Pressable style={styles.actionButton}>
            <ThemedText style={styles.actionIcon}>🔑</ThemedText>
            <ThemedText style={styles.actionText}>Change Password</ThemedText>
            <ThemedText style={styles.actionArrow}>›</ThemedText>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <ThemedText style={styles.actionIcon}>📊</ThemedText>
            <ThemedText style={styles.actionText}>Export Data</ThemedText>
            <ThemedText style={styles.actionArrow}>›</ThemedText>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <ThemedText style={styles.actionIcon}>🔄</ThemedText>
            <ThemedText style={styles.actionText}>Backup & Restore</ThemedText>
            <ThemedText style={styles.actionArrow}>›</ThemedText>
          </Pressable>
          <Pressable style={[styles.actionButton, styles.dangerButton]}>
            <ThemedText style={styles.actionIcon}>🚪</ThemedText>
            <ThemedText style={[styles.actionText, styles.dangerText]}>
              Logout
            </ThemedText>
            <ThemedText style={styles.actionArrow}>›</ThemedText>
          </Pressable>
        </View>
      </Animated.View>

      {/* App Info */}
      <Animated.View
        entering={FadeInUp.delay(500).duration(600)}
        style={styles.appInfo}
      >
        <ThemedText style={styles.appVersion}>AgriMedTrack v1.0.0</ThemedText>
        <ThemedText style={styles.appCopyright}>
          © 2024 AgriMed Solutions
        </ThemedText>
      </Animated.View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImageWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 8,
    textShadowColor: "#0008",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#185a9d",
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#43cea2",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  businessHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  businessName: {
    color: "#43cea2",
    fontSize: 18,
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "#43cea2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#185a9d",
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  teamCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#43cea2",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  memberAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#185a9d",
  },
  memberRole: {
    fontSize: 14,
    color: "#43cea2",
    fontWeight: "bold",
  },
  memberEmail: {
    fontSize: 12,
    color: "#666",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  addMemberButton: {
    backgroundColor: "#43cea2",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginTop: 8,
  },
  addMemberText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#185a9d",
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#185a9d",
    flex: 1,
  },
  actionArrow: {
    fontSize: 18,
    color: "#43cea2",
    fontWeight: "bold",
  },
  dangerButton: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: "#ff6b6b",
  },
  appInfo: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  appVersion: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#43cea2",
  },
  appCopyright: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});
