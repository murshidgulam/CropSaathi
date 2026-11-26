
import { Asset } from 'expo-asset';
import * as ort from 'onnxruntime-react-native';

import {
  preprocessLeafImage,
  checkImageQuality,
} from '../utils/imagePreprocessing';

const diseaseLabels = require('../assets/models/labels.json');

// Load the CropSaathi ONNX disease detection model
export async function loadCropDiseaseModel() {
  try {
    const assets = await Asset.loadAsync(
      require('../assets/models/mohan_model.onnx')
    );

    const modelUri = assets[0].localUri;

    if (!modelUri) {
      throw new Error('Could not locate the ONNX model file.');
    }

    const session = await ort.InferenceSession.create(modelUri, {
      executionProviders: ['cpu'],
    });

    console.log('CropSaathi AI model loaded successfully!');
    console.log('Model inputs:', session.inputNames);
    console.log('Model outputs:', session.outputNames);

    return session;
  } catch (error) {
    console.error('CropSaathi model loading failed:', error);
    throw error;
  }
}

// Predict plant disease from a leaf photo
export async function predictDisease(photo, modelSession) {
  if (!photo) {
    throw new Error('Please select a leaf photo first.');
  }

  if (!modelSession) {
    throw new Error('AI model is not ready yet.');
  }

  // 1. Check photo quality
  const quality = await checkImageQuality(photo);

  if (!quality.valid) {
    return {
      valid: false,
      message: quality.message,
    };
  }

  // 2. Prepare image for AI model
  const inputData = await preprocessLeafImage(photo);

  // 3. Create ONNX input tensor
  const inputTensor = new ort.Tensor(
    'float32',
    inputData,
    [1, 3, 224, 224]
  );

  // 4. Run AI prediction
  const inputName = modelSession.inputNames[0];
  const outputName = modelSession.outputNames[0];

  const results = await modelSession.run({
    [inputName]: inputTensor,
  });

  // 5. Read model output
  const output = results[outputName];

  if (!output || !output.data) {
    throw new Error('The model returned an empty output.');
  }

  const logits = output.data;

  if (logits.length !== diseaseLabels.length) {
    throw new Error(
      `Model returned ${logits.length} values, but ${diseaseLabels.length} labels were provided.`
    );
  }

  // 6. Calculate probabilities using Softmax
  const maxLogit = Math.max(...logits);

  const expScores = Array.from(logits, value =>
    Math.exp(value - maxLogit)
  );

  const total = expScores.reduce(
    (sum, value) => sum + value,
    0
  );

  if (!Number.isFinite(total) || total <= 0) {
    throw new Error('Invalid prediction probabilities.');
  }

  const probabilities = expScores.map(
    value => value / total
  );

  // 7. Find the most likely disease
  let bestIndex = 0;

  for (let i = 1; i < probabilities.length; i++) {
    if (probabilities[i] > probabilities[bestIndex]) {
      bestIndex = i;
    }
  }

  return {
    valid: true,
    predictedLabel: diseaseLabels[bestIndex],
    confidence: Number(
      (probabilities[bestIndex] * 100).toFixed(2)
    ),
  };
}
