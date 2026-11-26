
import { useState, useEffect } from 'react';
import { loadCropDiseaseModel } from '../services/aiService';

export default function useCropDiseaseModel() {
  const [modelSession, setModelSession] = useState(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [modelError, setModelError] = useState(null);

  useEffect(() => {
    let isActive = true;

    async function initializeModel() {
      try {
        setModelLoading(true);
        const session = await loadCropDiseaseModel();

        if (isActive) {
          setModelSession(session);
          setModelError(null);
        }
      } catch (error) {
        console.error('AI model initialization failed:', error);

        if (isActive) {
          setModelError(error.message);
        }
      } finally {
        if (isActive) {
          setModelLoading(false);
        }
      }
    }

    initializeModel();

    return () => {
      isActive = false;
    };
  }, []);

  return {
    modelSession,
    modelLoading,
    modelError,
  };
}
