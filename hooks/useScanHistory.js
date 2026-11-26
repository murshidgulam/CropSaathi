
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

import {
  loadScanHistory,
  saveScanHistory,
} from '../services/historyService';

import {
  deleteScanFromBackend,
  clearAllScansFromBackend,
} from '../services/apiService';

export default function useScanHistory() {
  const [history, setHistory] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Load saved history
  useEffect(() => {
    let isActive = true;

    async function loadHistory() {
      try {
        const savedHistory = await loadScanHistory();

        if (isActive) {
          setHistory(savedHistory);
        }
      } catch (error) {
        console.error('History loading error:', error);

        if (isActive) {
          Alert.alert(
            'Storage error',
            'Could not load your saved scan history.'
          );
        }
      } finally {
        if (isActive) {
          setHistoryLoaded(true);
        }
      }
    }

    loadHistory();

    return () => {
      isActive = false;
    };
  }, []);

  // Delete one scan
  const handleDeleteScan = async (scanId) => {
    const scanToDelete = history.find(
      item => String(item.id) === String(scanId)
    );

    if (!scanToDelete) return;

    try {
      if (scanToDelete.backendId) {
        await deleteScanFromBackend(scanToDelete.backendId);
      }

      const updatedHistory = history.filter(
        item => String(item.id) !== String(scanId)
      );

      await saveScanHistory(updatedHistory);
      setHistory(updatedHistory);

      Alert.alert('Success', 'Scan deleted successfully.');
    } catch (error) {
      console.error('Scan deletion failed:', error);

      Alert.alert(
        'Deletion Failed',
        'Could not delete this scan. Please try again.'
      );
    }
  };

  // Delete all scans
  const handleClearHistory = async () => {
    try {
      const result = await clearAllScansFromBackend();

      console.log(
        'SQLite records deleted:',
        result.deletedCount
      );

      await saveScanHistory([]);
      setHistory([]);

      Alert.alert(
        'Success',
        'All scan history has been deleted.'
      );
    } catch (error) {
      console.error('Clear history failed:', error);

      Alert.alert(
        'Deletion Failed',
        'Could not clear all scan history. Please try again.'
      );
    }
  };

  return {
    history,
    historyLoaded,
    setHistory,
    handleDeleteScan,
    handleClearHistory,
  };
}
