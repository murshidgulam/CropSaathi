
import React from 'react';

import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';

export default function HistoryScreen({
  setScreen,
  historyLoaded,
  history,
  startNewScan,
  onDeleteScan,
  onClearHistory,
  styles,
  Header,
  BackButton,
  PrimaryButton,
}) {
  // Confirm before deleting one scan
  const confirmDelete = (scanId) => {
    Alert.alert(
      'Delete Scan?',
      'Are you sure you want to delete this scan?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteScan(scanId),
        },
      ]
    );
  };

  // Confirm before deleting all scans
  const confirmClearAll = () => {
    Alert.alert(
      'Clear All History?',
      'Are you sure you want to permanently delete all your scan history?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: onClearHistory,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.container}>
        <Header />

        <BackButton
          title="← Back to Home"
          onPress={() => setScreen('home')}
        />

        <Text style={styles.heading}>
          Scan History
        </Text>

        <Text style={styles.subtitle}>
          Your previous photo scans.
        </Text>

        {!historyLoaded ? (
          <View style={styles.card}>
            <ActivityIndicator size="large" color="#347B43" />

            <Text style={styles.description}>
              Loading your saved scans...
            </Text>
          </View>
        ) : history.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.leaf}>📋</Text>

            <Text style={styles.cardTitle}>
              No scans yet
            </Text>

            <Text style={styles.description}>
              Your scans will appear here after you
              complete a photo analysis.
            </Text>
          </View>
        ) : (
          <>
            {history.map(item => (
              <View style={styles.historyCard} key={item.id}>
                <Text style={styles.cardTitle}>
                  {item.crop}
                </Text>

                <Text style={styles.description}>
                  {item.disease}
                </Text>

                {item.confidence !== undefined && (
                  <Text style={styles.historyConfidence}>
                    Confidence: {item.confidence}%
                  </Text>
                )}

                <Text style={styles.date}>
                  {item.date}
                </Text>

                <TouchableOpacity
                  onPress={() => confirmDelete(item.id)}
                  style={{
                    backgroundColor: '#FDECEC',
                    padding: 10,
                    borderRadius: 8,
                    marginTop: 12,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: '#C62828',
                      fontWeight: 'bold',
                    }}
                  >
                    🗑 Delete This Scan
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              onPress={confirmClearAll}
              style={{
                backgroundColor: '#C62828',
                padding: 14,
                borderRadius: 10,
                marginVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                }}
              >
                Clear All History
              </Text>
            </TouchableOpacity>
          </>
        )}

        <PrimaryButton
          title="Start New Scan"
          onPress={startNewScan}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
