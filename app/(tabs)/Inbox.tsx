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

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const BackIcon = () => (
  <View style={styles.backIcon}>
    <Text style={styles.backIconText}>{"←"}</Text>
  </View>
);

const InboxScreen: React.FC<Props> = ({ navigation }) => {
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();

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
      style={styles.emailCard} 
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
            <Text style={styles.senderText} numberOfLines={1}>
              {item.sender}
            </Text>
            <Text style={styles.timeText}>{item.timestamp}</Text>
          </View>
        </View>
        <View style={styles.messagePreview}>
          <Text style={styles.subjectText} numberOfLines={1}>
            {item.subject}
          </Text>
          <Text style={styles.previewText} numberOfLines={2}>
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
      <Text style={styles.noEmailsText}>Your inbox is empty</Text>
      <Text style={styles.noEmailsSubtext}>
        New messages will appear here
      </Text>
    </View>
  );

  const renderInbox = () => (
    <Animated.View 
      style={[
        styles.container, 
        { opacity: fadeAnimation }
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={[styles.headerContainer, { paddingTop: insets.top > 0 ? 8 : 16 }]}>
          <Text style={styles.header}>Inbox</Text>
        </View>
        <FlatList
          data={emails}
          renderItem={renderEmailItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.emailsContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyInbox}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
          { transform: [{ translateX }] }
        ]}
      >
        <SafeAreaView style={styles.detailSafeArea}>
          <View style={styles.detailHeader}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={closeEmail}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <BackIcon />
              <Text style={styles.backButtonText}>Inbox</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={[1]}
            renderItem={() => (
              <View style={styles.emailDetailWrapper}>
                <Text style={styles.detailSubject}>
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
                    <Text style={styles.detailSenderName}>
                      {selectedEmail?.sender}
                    </Text>
                    <Text style={styles.detailTimestamp}>
                      {selectedEmail?.timestamp}
                    </Text>
                  </View>
                </View>
                <View style={styles.messageBody}>
                  <Text style={styles.detailBody}>
                    {selectedEmail?.body}
                  </Text>
                </View>
              </View>
            )}
            keyExtractor={() => "detail"}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.detailScrollContent}
          />
        </SafeAreaView>
      </Animated.View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      {renderInbox()}
      {selectedEmail && renderEmailDetail()}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  header: {
    fontSize: 28,
    fontWeight: "600",
    color: "#1D1D1F",
  },
  emailsContent: {
    paddingVertical: 8,
  },
  emailCard: {
    backgroundColor: "#F5F5F7",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  senderText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1D1D1F",
    flex: 1,
    paddingRight: 10,
  },
  timeText: {
    fontSize: 14,
    color: "#86868B",
  },
  messagePreview: {
    paddingLeft: 52,
  },
  subjectText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1D1D1F",
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    color: "#86868B",
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
    color: "#1D1D1F",
    marginBottom: 8,
  },
  noEmailsSubtext: {
    fontSize: 16,
    color: "#86868B",
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
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
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
    color: "#0066CC",
  },
  backButtonText: {
    fontSize: 16,
    color: "#0066CC",
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
    color: "#1D1D1F",
    marginBottom: 16,
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
    color: "#1D1D1F",
  },
  detailTimestamp: {
    fontSize: 14,
    color: "#86868B",
  },
  messageBody: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  detailBody: {
    fontSize: 16,
    lineHeight: 22,
    color: "#1D1D1F",
  },
});

export default InboxScreen;
