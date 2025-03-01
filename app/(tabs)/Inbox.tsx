import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";

const InboxScreen = () => {
  const [emails, setEmails] = useState<any[]>([]);

  useEffect(() => {
    setEmails([
      {
        id: "1",
        subject: "Dear students,",
        sender: "John Fry - President of Drexel University",
        important: true,
        body: "I wanted to take a moment to thank you all for your resilience and dedication during this academic year. Your hard work continues to inspire our faculty and staff, and we remain committed to supporting your success at Drexel.\n\nSincerely,\nJohn Fry\njohnfry@drexel.edu"
      },
    ]);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Inbox</Text>

      {/* Email List */}
      <ScrollView
        style={styles.emailsContainer}
        showsVerticalScrollIndicator={false}
      >
        {emails.length > 0 ? (
          emails.map((email) => (
            <View key={email.id} style={styles.emailCard}>
              <Text style={styles.senderText}>{email.sender}</Text>
              <Text style={styles.emailText}>{email.subject}</Text>
              <Text style={styles.bodyText}>{email.body}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noEmailsText}>No important emails found</Text>
        )}
      </ScrollView>
    </View>
  );
};

// Styles
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
    maxHeight: "70%",
  },
  emailCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2.5,
  },
  senderText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#222",
    marginBottom: 2,
  },
  emailText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 2,
  },
  bodyText: {
    fontSize: 16,
    color: "#333",
  },
  noEmailsText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});

export default InboxScreen;
