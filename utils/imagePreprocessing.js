
import * as ImageManipulator from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import { toByteArray } from 'base64-js';

// Prepare a 224 x 224 image and return its decoded pixels.
async function getResizedImage(imageUri) {
  if (!imageUri) {
    throw new Error('No leaf image was provided.');
  }

  const resized = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 224, height: 224 } }],
    {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    }
  );

  if (!resized.base64) {
    throw new Error('Could not convert the image.');
  }

  const decoded = jpeg.decode(toByteArray(resized.base64), {
    useTArray: true,
  });

  if (decoded.width !== 224 || decoded.height !== 224) {
    throw new Error('Image must be 224 x 224 pixels.');
  }

  return decoded.data;
}

// Check image brightness and sharpness.
export async function checkImageQuality(imageUri) {
  const data = await getResizedImage(imageUri);

  const width = 224;
  const height = 224;
  const pixels = width * height;

  const gray = new Float32Array(pixels);
  let brightness = 0;

  for (let i = 0; i < pixels; i++) {
    const p = i * 4;

    const value =
      0.299 * data[p] +
      0.587 * data[p + 1] +
      0.114 * data[p + 2];

    gray[i] = value;
    brightness += value;
  }

  brightness /= pixels;

  // Measure image sharpness using the Laplacian.
  let laplacianSum = 0;
  let laplacianSquaredSum = 0;
  let count = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;

      const laplacian =
        gray[i - width] +
        gray[i + width] +
        gray[i - 1] +
        gray[i + 1] -
        4 * gray[i];

      laplacianSum += laplacian;
      laplacianSquaredSum += laplacian * laplacian;
      count++;
    }
  }

  const mean = laplacianSum / count;
  const sharpness =
    laplacianSquaredSum / count - mean * mean;

  console.log('Photo brightness:', brightness);
  console.log('Photo sharpness:', sharpness);

  // These are initial heuristic thresholds.
  // They must be tested and adjusted using real crop images.
  if (brightness < 35) {
    return {
      valid: false,
      reason: 'dark',
      message:
        'Your photo is too dark. Please take another photo in better lighting.',
    };
  }

  if (brightness > 245) {
    return {
      valid: false,
      reason: 'bright',
      message:
        'Your photo is too bright. Please avoid direct glare and try again.',
    };
  }

  if (sharpness < 25) {
    return {
      valid: false,
      reason: 'blurry',
      message:
        'Your photo appears blurry. Please upload a clearer leaf photo.',
    };
  }

  return {
    valid: true,
    reason: null,
    message: 'Photo quality looks acceptable.',
  };
}

// Prepare the image for Mohan's ONNX model.
export async function preprocessLeafImage(imageUri) {
  const data = await getResizedImage(imageUri);

  const pixels = 224 * 224;

  const mean = [0.485, 0.456, 0.406];
  const std = [0.229, 0.224, 0.225];

  const inputData = new Float32Array(3 * pixels);

  for (let i = 0; i < pixels; i++) {
    const pixelIndex = i * 4;

    const red = data[pixelIndex] / 255;
    const green = data[pixelIndex + 1] / 255;
    const blue = data[pixelIndex + 2] / 255;

    inputData[i] = (red - mean[0]) / std[0];
    inputData[pixels + i] = (green - mean[1]) / std[1];
    inputData[2 * pixels + i] = (blue - mean[2]) / std[2];
  }

  return inputData;
}
