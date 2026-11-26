
const diseaseGuidance = {
  // =========================
  // MAIZE (4 CLASSES)
  // =========================

  maize_common_rust: {
    name: 'Common Rust',
    crop: 'Maize',
    symptoms: 'Small reddish-brown spots appear on both sides of the leaves.',
    cause: 'A fungal infection that spreads through airborne spores.',
    action: 'Remove badly affected leaves where practical and seek local agricultural advice.',
    prevention: 'Grow resistant varieties and monitor crops regularly.'
  },

  maize_gray_leaf_spot: {
    name: 'Gray Leaf Spot',
    crop: 'Maize',
    symptoms: 'Long, rectangular gray or brown patches develop on leaves.',
    cause: 'A fungal disease that spreads in warm, humid conditions.',
    action: 'Remove infected crop debris and seek local agricultural advice.',
    prevention: 'Use resistant varieties and maintain good field sanitation.'
  },

  maize_healthy: {
    name: 'Healthy Maize',
    crop: 'Maize',
    symptoms: 'Leaves appear green without clear signs of disease.',
    cause: 'No visible disease detected.',
    action: 'Continue normal crop care and monitoring.',
    prevention: 'Maintain balanced nutrition and proper watering.'
  },

  maize_northern_leaf_blight: {
    name: 'Northern Leaf Blight',
    crop: 'Maize',
    symptoms: 'Long, cigar-shaped gray-green lesions appear on leaves.',
    cause: 'A fungal disease that spreads through spores.',
    action: 'Remove infected crop residue where practical and seek local agricultural advice.',
    prevention: 'Use resistant varieties and rotate crops.'
  },

  // =========================
  // POTATO (3 CLASSES)
  // =========================

  potato_early_blight: {
    name: 'Early Blight',
    crop: 'Potato',
    symptoms: 'Dark brown spots with circular rings appear on older leaves.',
    cause: 'A fungal disease that can spread through infected plant debris.',
    action: 'Remove badly affected leaves and seek local agricultural advice.',
    prevention: 'Rotate crops and avoid wetting leaves while watering.'
  },

  potato_healthy: {
    name: 'Healthy Potato',
    crop: 'Potato',
    symptoms: 'Leaves appear green without clear signs of disease.',
    cause: 'No visible disease detected.',
    action: 'Continue normal crop care and monitoring.',
    prevention: 'Use healthy seed potatoes and maintain proper watering.'
  },

  potato_late_blight: {
    name: 'Late Blight',
    crop: 'Potato',
    symptoms: 'Water-soaked dark patches appear on leaves and may spread quickly.',
    cause: 'A disease caused by Phytophthora infestans.',
    action: 'Remove severely affected plant material and seek prompt agricultural advice.',
    prevention: 'Use healthy seed potatoes and monitor crops during cool, humid weather.'
  },

  // =========================
  // RICE (3 CLASSES)
  // =========================

  rice_brown_spot: {
    name: 'Brown Spot',
    crop: 'Rice',
    symptoms: 'Small oval brown spots appear on leaves, sometimes with gray centres.',
    cause: 'A fungal disease caused by Bipolaris oryzae.',
    action: 'Seek local agricultural advice and maintain balanced crop nutrition.',
    prevention: 'Use healthy seeds and maintain proper field management.'
  },

  rice_healthy: {
    name: 'Healthy Rice',
    crop: 'Rice',
    symptoms: 'Leaves appear green without clear signs of disease.',
    cause: 'No visible disease detected.',
    action: 'Continue normal crop care and monitoring.',
    prevention: 'Use healthy seeds and maintain balanced nutrition.'
  },

  rice_leaf_blast: {
    name: 'Leaf Blast',
    crop: 'Rice',
    symptoms: 'Spindle-shaped spots with gray or whitish centres and dark edges appear on leaves.',
    cause: 'A fungal disease caused by Magnaporthe oryzae.',
    action: 'Seek local agricultural advice for suitable disease management.',
    prevention: 'Use resistant varieties and avoid excessive nitrogen fertilizer.'
  },

  // =========================
  // TOMATO (5 CLASSES)
  // =========================

  tomato_early_blight: {
    name: 'Early Blight',
    crop: 'Tomato',
    symptoms: 'Dark brown spots with circular rings appear on older leaves.',
    cause: 'A fungal disease that spreads through infected plant debris and splashing water.',
    action: 'Remove badly affected leaves and seek local agricultural advice.',
    prevention: 'Avoid wetting leaves while watering and remove infected plant debris.'
  },

  tomato_healthy: {
    name: 'Healthy Tomato',
    crop: 'Tomato',
    symptoms: 'Leaves appear green without clear signs of disease.',
    cause: 'No visible disease detected.',
    action: 'Continue normal crop care and monitoring.',
    prevention: 'Maintain balanced nutrition and proper watering.'
  },

  tomato_late_blight: {
    name: 'Late Blight',
    crop: 'Tomato',
    symptoms: 'Water-soaked dark patches appear on leaves and may spread quickly.',
    cause: 'A disease caused by Phytophthora infestans.',
    action: 'Remove severely affected plant material and seek prompt agricultural advice.',
    prevention: 'Avoid overhead watering and monitor plants during cool, humid weather.'
  },

  tomato_leaf_mold: {
    name: 'Leaf Mold',
    crop: 'Tomato',
    symptoms: 'Yellow patches appear on the upper leaf surface, with olive-green mold underneath.',
    cause: 'A fungal disease favoured by high humidity.',
    action: 'Remove severely affected leaves and improve airflow around plants.',
    prevention: 'Maintain good spacing and reduce excess humidity.'
  },

  tomato_septoria_leaf_spot: {
    name: 'Septoria Leaf Spot',
    crop: 'Tomato',
    symptoms: 'Small circular spots with gray centres and dark edges appear on leaves.',
    cause: 'A fungal disease that spreads through infected debris and splashing water.',
    action: 'Remove affected lower leaves and seek local agricultural advice.',
    prevention: 'Rotate crops, avoid wetting foliage and remove infected debris.'
  }
};

export default diseaseGuidance;
