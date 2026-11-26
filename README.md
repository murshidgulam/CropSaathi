# 🌱 CropSaathi – AI-Based Crop Disease Detection

## About the Project
CropSaathi is an AI-powered mobile application designed to help farmers identify crop diseases using images of plant leaves. It provides disease predictions, confidence scores, and basic guidance to help farmers take informed decisions.

## Key Features
- AI-based crop disease detection.
- Supports Tomato, Potato, Maize, and Rice.
- Image quality checking for brightness and sharpness.
- Disease prediction with confidence score.
- Crop mismatch validation.
- Disease information and treatment guidance.
- Scan history with delete functionality.
- Local database storage and backend integration.

## Supported Crops
- 🍅 Tomato
- 🥔 Potato
- 🌽 Maize
- 🌾 Rice

## Technology Stack

**Frontend**
- React Native
- Expo
- JavaScript

**AI / Machine Learning**
- ONNX Runtime
- ONNX model for disease prediction

**Backend**
- Node.js
- Express.js
- SQLite

## Project Structure
```text
CropSaathi/
├── components/
├── constants/
├── hooks/
├── screens/
├── services/
├── styles/
├── utils/
├── backend/
├── App.js
├── package.json
└── README.md
```

## Installation and Setup

### 1. Clone the Repository
```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd CropSaathi
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Backend
```bash
cd backend
npm install
node server.js
```

### 4. Start the Mobile Application
Open a new terminal in the main project folder:
```bash
npx expo start
```

## How It Works
1. Select a crop.
2. Upload or capture a leaf image.
3. CropSaathi checks the image quality.
4. The AI model analyses the image.
5. The app displays the predicted disease and confidence score.
6. The scan is saved in the history.

## Future Scope
- Support for more crop varieties.
- More regional languages.
- Improved disease detection accuracy.
- Weather-based crop health recommendations.
- More detailed farming guidance.

## Project Purpose
CropSaathi aims to make crop disease identification more accessible, simple, and convenient for farmers.
