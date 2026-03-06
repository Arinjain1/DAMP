import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

const FAQ_DATA = [
  {
    id: 1,
    question: 'How do I add a new property to my inventory?',
    answer: 'Go to the Properties tab and tap the "+" button. Fill in all required details including property type, location, price, and configuration. Once submitted, the property will appear in your inventory list.',
  },
  {
    id: 2,
    question: 'How can I edit property details?',
    answer: 'Navigate to the Properties tab, find the property you want to edit, and tap the edit icon. Make your changes and save. The updated information will be reflected immediately.',
  },
  {
    id: 3,
    question: 'How do I add a new customer/client?',
    answer: 'Go to the Customers tab and tap the "+" button. Enter customer details including name, contact information, requirements, and budget range. The customer will be added to your follow-up list.',
  },
  {
    id: 4,
    question: 'What is the difference between Sell and Rent properties?',
    answer: 'Sell properties are listed for purchase with a one-time payment. Rent properties are available for monthly/yearly lease. You can filter properties by type using the toggle buttons in the Properties tab.',
  },
  {
    id: 5,
    question: 'How do I track my deals and commissions?',
    answer: 'The Dashboard shows your active deals and total commission earned. You can view detailed deal information including property details, customer info, and payment status.',
  },
  {
    id: 6,
    question: 'Can I filter properties by category?',
    answer: 'Yes! In the Properties tab, use the category filters (Residential, Commercial, Agricultural, Industrial) to view specific property types. You can also combine this with Sell/Rent filters.',
  },
  {
    id: 7,
    question: 'How do I update my profile information?',
    answer: 'Go to Profile > Profile Information to view and update your personal details including name, contact number, age, and city.',
  },
  {
    id: 8,
    question: 'What does the subscription include?',
    answer: 'Your subscription gives you access to unlimited property listings, customer management, deal tracking, and commission calculations. Check the subscription card on your profile for renewal dates.',
  },
  {
    id: 9,
    question: 'How do I contact support?',
    answer: 'You can reach our support team via email at support@damp.com or call us at +91-XXXXXXXXXX. We are available Monday to Saturday, 9 AM to 6 PM IST.',
  },
  {
    id: 10,
    question: 'Is my data secure?',
    answer: 'Yes, all your data is encrypted and stored securely. We follow industry-standard security practices to protect your information. Check our Data Privacy policy for more details.',
  },
];

export default function SupportHub() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState(null);

  const toggleFAQ = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#A78BFA" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support Hub</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>How can we help you?</Text>
          <Text style={styles.welcomeText}>
            Find answers to frequently asked questions about using the DAMP Broker App
          </Text>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {FAQ_DATA.map((faq) => (
            <View key={faq.id} style={styles.faqCard}>
              <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => toggleFAQ(faq.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                {expandedId === faq.id ? (
                  <ChevronUp size={20} color="#6B7280" />
                ) : (
                  <ChevronDown size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
              
              {expandedId === faq.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Contact Section */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactText}>
            Our support team is here to assist you
          </Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Email:</Text>
            <Text style={styles.contactValue}>support@damp.com</Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Phone:</Text>
            <Text style={styles.contactValue}>+91-XXXXXXXXXX</Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Hours:</Text>
            <Text style={styles.contactValue}>Mon-Sat, 9 AM - 6 PM IST</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#A78BFA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 1 : 30,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  faqSection: {
    marginHorizontal: 16,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  faqCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  contactInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    width: 60,
  },
  contactValue: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
});
