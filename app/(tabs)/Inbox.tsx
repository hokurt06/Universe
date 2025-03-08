import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

const InboxScreen = () => {
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);

  useEffect(() => {
    setEmails([
      {
        id: "1",
        subject: "Message from the President",
        sender: "John Fry",
        important: true,
        body: "I wanted to take a moment to thank you all for your resilience and dedication during this academic year. Your hard work continues to inspire our faculty and staff, and we remain committed to supporting your success at Drexel."
      },
      {
        id: "2",
        subject: "Campus Safety Update",
        sender: "Drexel Public Safety",
        body: "This is a reminder to always carry your DragonCard and follow campus safety protocols. In case of emergency, contact Drexel Police immediately."
      },
      {
        id: "3",
        subject: "Important Financial Aid Notice",
        sender: "Office of Financial Aid",
        body: "The deadline for submitting your financial aid documents is approaching. Please make sure all required materials are submitted by the end of the month to avoid any delays."
      }
    ]);
  }, []);

  const openEmail = (email: any) => {
    setSelectedEmail(email);
  };

  const closeEmail = () => {
    setSelectedEmail(null);
  };

  if (selectedEmail) {
    // Fullscreen Email Detail View
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Email Details</Text>
        <ScrollView style={styles.emailDetailContainer}>
          <Text style={styles.detailSender}>
            <Text style={styles.boldText}>From: </Text>
            {selectedEmail.sender}
          </Text>
          <Text style={styles.detailSubject}>
            <Text style={styles.boldText}>Subject: </Text>
            {selectedEmail.subject}
          </Text>
          <Text style={styles.detailBody}>{selectedEmail.body}</Text>

          {/* Back button to return to inbox */}
          <TouchableOpacity style={styles.backButton} onPress={closeEmail}>
            <Text style={styles.backButtonText}>Back to Inbox</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Initial Inbox View
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Inbox</Text>

      <ScrollView style={styles.emailsContainer} showsVerticalScrollIndicator={false}>
        {emails.length > 0 ? (
          emails.map((email) => (
            <TouchableOpacity key={email.id} style={styles.emailCard} onPress={() => openEmail(email)}>
              <Text style={styles.senderText}>{email.sender}</Text>
              <Text style={styles.emailText}>{email.subject}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noEmailsText}>No important emails found</Text>
        )}
      </ScrollView>
    </View>
  );
};

// Styles - reused and adapted from your existing styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    paddingTop: 70,
  },
  header: {
    fontSize: 26,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 15,
  },
  emailsContainer: {
    width: "90%",
    maxHeight: "75%",
  },
  emailCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  senderText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#222",
    marginBottom: 2,
  },
  emailText: {
    fontSize: 16,
    color: "#555",
  },
  noEmailsText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },

  // Detail view styles
  emailDetailContainer: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  detailSender: {
    fontSize: 18,
    color: "#555",
    marginBottom: 8,
  },
  detailSubject: {
    fontSize: 18,
    color: "#555",
    marginBottom: 15,
  },
  detailBody: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
    marginBottom: 20,
  },
  boldText: {
    fontWeight: "700",
    color: "#1C1C1E",
  },
  backButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignSelf: "center",
    marginTop: 10,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});

export default InboxScreen;
