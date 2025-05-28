import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeStore } from "../../hooks/themeStore"; // Ensure useThemeStore is correctly imported

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const BackIcon = () => {
  const { isDarkMode } = useThemeStore();
  const themeAccent = isDarkMode ? "#0A84FF" : "#007AFF"; // Or just use theme.accent

  return (
    <View style={styles.backIcon}>
      <Text style={[styles.backIconText, { color: themeAccent }]}>{"←"}</Text>
    </View>
  );
};


const InboxScreen: React.FC<Props> = ({ navigation }) => {
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();

  const { isDarkMode } = useThemeStore(); // Get the dark mode status

  // Define theme based on dark mode value
  const theme = isDarkMode
    ? {
        background: "#121212",
        text: "#FFFFFF",
        header: "#FFFFFF",
        sectionBackground: "#2A2A2A",
        divider: "#3E3E3E",
        accent: "#0A84FF",
        cardBorder: "#3A3A3A",
        avatarBackground: "#0A84FF",
        segmentBackground: "#2C2C2E",
        segmentText: "#D3D3D3",
        segmentActiveBackground: "#3A3A3C",
        segmentActiveText: "#FFFFFF",
        listBackground: "#121212",
        modalOverlay: "rgba(28,28,30,0.9)",
        cardTitle: "#FFFFFF", 
        card: "#2C2C2E",
      }
    : {
        background: "#FFFFFF",
        text: "#1C1C1E",
        header: "#1C1C1E",
        sectionBackground: "#F5F5F7",
        divider: "#E5E5EA",
        accent: "#007AFF",
        cardBorder: "#E5E5EA",
        avatarBackground: "#007AFF",
        segmentBackground: "#F2F2F7",
        segmentText: "#696969",
        segmentActiveBackground: "#FFFFFF",
        segmentActiveText: "#1C1C1E",
        listBackground: "#FFFFFF",
        modalOverlay: "rgba(0,0,0,0.5)",
        cardTitle: "#000000", 
        card: "#F5F5F7",
      };

  useEffect(() => {
    setEmails([
      {
        id: "1",
        subject: "Message from the President",
        sender: "John Fry",
        important: true,
        timestamp: "10:42 AM",
        body: "I wanted to take a moment to thank you all for your resilience and dedication during this academic year. Your hard work continues to inspire our faculty and staff, and we remain committed to supporting your success at Drexel."
      },
      {
        id: "2",
        subject: "Campus Safety Update",
        sender: "Drexel Public Safety",
        timestamp: "Yesterday",
        body: "This is a reminder to always carry your DragonCard and follow campus safety protocols. In case of emergency, contact Drexel Police immediately."
      },
      {
        id: "3",
        subject: "Important Financial Aid Notice",
        sender: "Office of Financial Aid",
        timestamp: "Apr 17",
        body: "The deadline for submitting your financial aid documents is approaching. Please make sure all required materials are submitted by the end of the month to avoid any delays."
      }
    ]);
  }, []);

  const openEmail = (email: any) => {
    setSelectedEmail(email);
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 0.3,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  const closeEmail = () => {
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start(() => {
      setSelectedEmail(null);
    });
  };

  const renderEmailItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.emailCard, { backgroundColor: isDarkMode ? "#2C2C2E" : "#F5F5F7" }]} 
      onPress={() => openEmail(item)}
      activeOpacity={0.7}
    >
      <View style={styles.emailCardContent}>
        <View style={styles.senderRow}>
          <View style={[
            styles.avatarContainer, 
            item.important ? styles.avatarImportant : null
          ]}>
            <Text style={styles.avatarText}>
              {item.sender.charAt(0)}
            </Text>
          </View>
          <View style={styles.senderDetails}>
            <Text style={[styles.senderText, { color: theme.text }]} numberOfLines={1}>
              {item.sender}
            </Text>
            <Text style={[styles.timeText, { color: theme.text }]}>{item.timestamp}</Text>
          </View>
        </View>
        <View style={styles.messagePreview}>
          <Text style={[styles.subjectText, { color: theme.text }]} numberOfLines={1}>
            {item.subject}
          </Text>
          <Text style={[styles.previewText, { color: theme.text }]} numberOfLines={2}>
            {item.body}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyInbox = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIcon}>
        <Text style={styles.emptyStateIconText}>📭</Text>
      </View>
      <Text style={[styles.noEmailsText, { color: theme.text }]}>Your inbox is empty</Text>
      <Text style={[styles.noEmailsSubtext, { color: theme.text }]}>
        New messages will appear here
      </Text>
    </View>
  );

  const renderInbox = () => (
    <Animated.View 
      style={[
        styles.container, 
        { opacity: fadeAnimation, backgroundColor: theme.background }
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        <View
          style={[
            styles.headerContainer,
            {
              paddingTop: insets.top > 0 ? 8 : 16,
              backgroundColor: theme.background,
            },
          ]}
        >
          <Text style={[styles.header, { color: theme.header }]}>
            Inbox
          </Text>
        </View>

        <FlatList
          data={emails}
          renderItem={renderEmailItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.emailsContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyInbox}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: theme.divider, marginHorizontal: 16 }} />
          )}
                  />
      </SafeAreaView>
    </Animated.View>
  );

  const renderEmailDetail = () => {
    const translateX = slideAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [Platform.OS === 'ios' ? 600 : 400, 0],
    });
  
    return (
      <Animated.View
        style={[
          styles.detailContainer,
          {
            transform: [{ translateX }],
            backgroundColor: theme.background, // Entire popup bg
          },
        ]}
      >
        <SafeAreaView style={[styles.detailSafeArea, { backgroundColor: theme.background }]}>
          <View style={[styles.detailHeader, { backgroundColor: theme.sectionBackground }]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={closeEmail}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <BackIcon />
              <Text style={[styles.backButtonText, { color: theme.accent }]}>Inbox</Text>
            </TouchableOpacity>
          </View>
  
          <FlatList
            data={[1]}
            renderItem={() => (
              <View style={[styles.emailDetailWrapper, { backgroundColor: theme.card }]}>
                <Text style={[styles.detailSubject, { color: theme.text }]}>
                  {selectedEmail?.subject}
                </Text>
                <View style={styles.detailMetaContainer}>
                  <View style={[
                    styles.detailAvatar,
                    selectedEmail?.important ? styles.avatarImportant : null
                  ]}>
                    <Text style={styles.detailAvatarText}>
                      {selectedEmail?.sender.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.detailSenderContainer}>
                    <Text style={[styles.detailSenderName, { color: theme.text }]}>
                      {selectedEmail?.sender}
                    </Text>
                    <Text style={[styles.detailTimestamp, { color: theme.text }]}>
                      {selectedEmail?.timestamp}
                    </Text>
                  </View>
                </View>
                <View style={styles.messageBody}>
                  <Text style={[styles.detailBody, { color: theme.text }]}>
                    {selectedEmail?.body}
                  </Text>
                </View>
              </View>
            )}
            keyExtractor={() => "detail"}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.detailScrollContent, { backgroundColor: theme.background }]}
          />
        </SafeAreaView>
      </Animated.View>
    );
  };
  

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      {renderInbox()}
      {selectedEmail && renderEmailDetail()}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  header: {
    fontSize: 28,
    fontWeight: "600",
  },
  emailsContent: {
    paddingVertical: 8,
  },
  emailCard: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  emailCardContent: {
    padding: 16,
  },
  senderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0066CC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarImportant: {
    backgroundColor: "#FF3B30",
  },
  avatarText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  senderDetails: {
    flex: 1,
  },
  senderText: {
    fontSize: 16,
    fontWeight: "500",
  },
  timeText: {
    fontSize: 14,
  },
  messagePreview: {
    paddingLeft: 52,
  },
  subjectText: {
    fontSize: 15,
    fontWeight: "500",
  },
  previewText: {
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E5EA",
    marginHorizontal: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F5F5F7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyStateIconText: {
    fontSize: 32,
  },
  noEmailsText: {
    fontSize: 18,
    fontWeight: "600",
  },
  noEmailsSubtext: {
    fontSize: 16,
    textAlign: "center",
  },
  detailContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    zIndex: 2,
  },
  detailSafeArea: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backIcon: {
    marginRight: 4,
  },
  backIconText: {
    fontSize: 18,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  detailScrollContent: {
    flexGrow: 1,
  },
  emailDetailWrapper: {
    backgroundColor: "#F5F5F7",
    borderRadius: 10,
    margin: 16,
    padding: 20,
  },
  detailSubject: {
    fontSize: 20,
    fontWeight: "600",
  },
  detailMetaContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "center",
  },
  detailAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0066CC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  detailAvatarText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  detailSenderContainer: {
    flex: 1,
  },
  detailSenderName: {
    fontSize: 16,
    fontWeight: "500",
  },
  detailTimestamp: {
    fontSize: 14,
  },
  messageBody: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  detailBody: {
    fontSize: 16,
    lineHeight: 22,
  },
});

export default InboxScreen;
