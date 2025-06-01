import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Platform,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import { useRouter } from "expo-router";
import { useThemeStore } from "../hooks/themeStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const AdvisorsScreen: React.FC = () => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tempDate, setTempDate] = useState(new Date());
  const [selectedAdvisor, setSelectedAdvisor] = useState<any>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useThemeStore();

  const theme = isDarkMode
    ? {
        background: "#000000",
        secondaryBackground: "#1C1C1E",
        tertiaryBackground: "#2C2C2E",
        text: "#FFFFFF",
        secondaryText: "#8E8E93",
        tertiaryText: "#48484A",
        separator: "#38383A",
        accent: "#007AFF",
        destructive: "#FF3B30",
        modalBackground: "rgba(0,0,0,0.7)",
        cardBackground: "#1C1C1E",
        groupedBackground: "#000000",
      }
    : {
        background: "#F2F2F7",
        secondaryBackground: "#FFFFFF",
        tertiaryBackground: "#F2F2F7",
        text: "#000000",
        secondaryText: "#8E8E93",
        tertiaryText: "#C7C7CC",
        separator: "#C6C6C8",
        accent: "#007AFF",
        destructive: "#FF3B30",
        modalBackground: "rgba(0,0,0,0.4)",
        cardBackground: "#FFFFFF",
        groupedBackground: "#F2F2F7",
      };

  const advisors = [
    {
      title: "Financial Advisor",
      name: "Jane Smith",
      phone_number: "(555) 123-4567",
      office_address: "Room 101, Finance Building",
      office_hours: "Monday–Friday, 9:00 AM–5:00 PM",
      emoji: "💰",
    },
    {
      title: "International Advisor",
      name: "Carlos Rivera",
      phone_number: "(555) 987-6543",
      office_address: "Room 202, Global Center",
      office_hours: "Tuesday–Thursday, 10:00 AM–4:00 PM",
      emoji: "🌍",
    },
    {
      title: "Academic Advisor",
      name: "Emily Johnson",
      phone_number: "(555) 456-7890",
      office_address: "Room 305, Academic Hall",
      office_hours: "Monday–Wednesday, 8:00 AM–3:00 PM",
      emoji: "📚",
    },
  ];

  const handleSchedulePress = (advisor: any) => {
    setSelectedAdvisor(advisor);
    setTempDate(new Date());
    setShowPicker(true);
  };

  const handleConfirm = () => {
    setSelectedDate(tempDate);
    setShowPicker(false);
  };

  const handleBackToAcademics = () => {
    router.replace("/(tabs)/academic");
  };

  const renderAdvisor = ({ item, index }: { item: any; index: number }) => (
    <View style={[
      styles.advisorCard, 
      { backgroundColor: theme.cardBackground },
      index === advisors.length - 1 && styles.lastCard
    ]}>
      <View style={styles.advisorHeader}>
        <View style={styles.advisorTitleContainer}>
          <Text style={styles.advisorEmoji}>{item.emoji}</Text>
          <View style={styles.advisorTitleText}>
            <Text style={[styles.advisorTitle, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.advisorName, { color: theme.secondaryText }]}>{item.name}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.advisorDetails}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>Phone</Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>{item.phone_number}</Text>
        </View>
        <View style={[styles.separator, { backgroundColor: theme.separator }]} />
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>Office</Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>{item.office_address}</Text>
        </View>
        <View style={[styles.separator, { backgroundColor: theme.separator }]} />
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>Hours</Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>{item.office_hours}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.scheduleButton, { backgroundColor: theme.accent }]}
        onPress={() => handleSchedulePress(item)}
        activeOpacity={0.8}
      >
        <Text style={styles.scheduleButtonText}>Schedule Appointment</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.largeTitle, { color: theme.text }]}>Advisors</Text>
      </View>

      <FlatList
        data={advisors}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={renderAdvisor}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: theme.secondaryBackground }]}
              onPress={handleBackToAcademics}
              activeOpacity={0.8}
            >
              <Text style={[styles.backButtonText, { color: theme.accent }]}>← Back to Academics</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Date Picker Modal */}
      <Modal 
        transparent 
        animationType="fade" 
        visible={showPicker}
        statusBarTranslucent
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalBackground }]}>
          <View style={[styles.pickerModal, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={[styles.pickerAction, { color: theme.accent }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.pickerTitle, { color: theme.text }]}>Select Time</Text>
              <TouchableOpacity onPress={handleConfirm}>
                <Text style={[styles.pickerAction, { color: theme.accent, fontWeight: '600' }]}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.pickerSeparator, { backgroundColor: theme.separator }]} />
            
            <DateTimePicker
              value={tempDate}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                if (Platform.OS === 'android') {
                  if (event.type === "set" && date) {
                    setTempDate(date);
                    handleConfirm();
                  } else {
                    setShowPicker(false);
                  }
                } else if (date) {
                  setTempDate(date);
                }
              }}
              textColor={theme.text}
              themeVariant={isDarkMode ? "dark" : "light"}
              style={styles.datePicker}
            />
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      {selectedDate && selectedAdvisor && (
        <Modal 
          transparent 
          animationType="slide" 
          visible={!!selectedDate}
          statusBarTranslucent
        >
          <View style={[styles.modalOverlay, { backgroundColor: theme.modalBackground }]}>
            <View style={[styles.confirmationModal, { backgroundColor: theme.cardBackground }]}>
              <View style={styles.confirmationIcon}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
              
              <Text style={[styles.confirmationTitle, { color: theme.text }]}>
                Appointment Scheduled
              </Text>
              
              <View style={styles.confirmationDetails}>
                <Text style={[styles.confirmationAdvisor, { color: theme.text }]}>
                  {selectedAdvisor.name}
                </Text>
                <Text style={[styles.confirmationTime, { color: theme.secondaryText }]}>
                  {moment(selectedDate).format("EEEE, MMMM Do")}
                </Text>
                <Text style={[styles.confirmationTime, { color: theme.secondaryText }]}>
                  {moment(selectedDate).format("h:mm A")}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.confirmationButton, { backgroundColor: theme.accent }]}
                onPress={() => setSelectedDate(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmationButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.374,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  advisorCard: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  lastCard: {
    marginBottom: 24,
  },
  advisorHeader: {
    padding: 16,
    paddingBottom: 12,
  },
  advisorTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  advisorEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  advisorTitleText: {
    flex: 1,
  },
  advisorTitle: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.45,
    marginBottom: 2,
  },
  advisorName: {
    fontSize: 16,
    fontWeight: '400',
  },
  advisorDetails: {
    paddingHorizontal: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '400',
    flex: 0.3,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '400',
    flex: 0.7,
    textAlign: 'right',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 0,
  },
  scheduleButton: {
    margin: 16,
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  scheduleButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.43,
  },
  footerContainer: {
    paddingBottom: 34,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: '400',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModal: {
    width: width - 40,
    maxWidth: 320,
    borderRadius: 14,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  pickerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  pickerAction: {
    fontSize: 17,
    fontWeight: '400',
  },
  pickerSeparator: {
    height: StyleSheet.hairlineWidth,
  },
  datePicker: {
    height: 200,
  },
  confirmationModal: {
    width: width - 60,
    maxWidth: 280,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },
  confirmationIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkmark: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmationDetails: {
    alignItems: 'center',
    marginBottom: 24,
  },
  confirmationAdvisor: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 4,
  },
  confirmationTime: {
    fontSize: 15,
    fontWeight: '400',
    marginBottom: 2,
  },
  confirmationButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  confirmationButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AdvisorsScreen;