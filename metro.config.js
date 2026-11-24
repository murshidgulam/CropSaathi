const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow Metro to load ONNX model files
config.resolver.assetExts.push('onnx');

module.exports = config;