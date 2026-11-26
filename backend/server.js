
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// CREATE SQLITE DATABASE
const db = new Database('cropsaathi.db');

db.pragma('journal_mode = WAL');

// CREATE SCANS TABLE
db.exec(`
  CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crop TEXT NOT NULL,
    disease TEXT NOT NULL,
    predictedClass TEXT NOT NULL,
    confidence REAL NOT NULL,
    date TEXT NOT NULL
  )
`);

// SWAGGER API DOCUMENTATION
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CropSaathi API',
      version: '1.0.0',
      description: 'API documentation for the CropSaathi plant disease detection application.'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local development server'
      }
    ],
    paths: {
      '/api/health': {
        get: {
          summary: 'Check backend health',
          responses: {
            200: {
              description: 'Backend is running successfully'
            }
          }
        }
      },

      '/api/scans': {
        get: {
          summary: 'Get all saved scan records',
          responses: {
            200: {
              description: 'List of saved scans'
            }
          }
        },

        post: {
          summary: 'Save a completed disease scan',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: [
                    'crop',
                    'disease',
                    'predictedClass',
                    'confidence'
                  ],
                  properties: {
                    crop: {
                      type: 'string',
                      enum: ['Tomato', 'Potato', 'Maize', 'Rice']
                    },
                    disease: {
                      type: 'string'
                    },
                    predictedClass: {
                      type: 'string'
                    },
                    confidence: {
                      type: 'number',
                      minimum: 60.01,
                      maximum: 100
                    },
                    date: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Scan saved successfully'
            },
            400: {
              description: 'Invalid scan data'
            }
          }
        },

        delete: {
          summary: 'Delete all saved scan records',
          responses: {
            200: {
              description: 'All scan records deleted successfully'
            },
            500: {
              description: 'Unable to clear scan history'
            }
          }
        }
      },

      '/api/scans/{id}': {
        delete: {
          summary: 'Delete one scan record',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'integer'
              }
            }
          ],
          responses: {
            200: {
              description: 'Scan deleted successfully'
            },
            400: {
              description: 'Invalid scan ID'
            },
            404: {
              description: 'Scan not found'
            }
          }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// HEALTH CHECK API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CropSaathi backend is running!',
    database: 'Connected'
  });
});

// SAVE A COMPLETED SCAN
app.post('/api/scans', (req, res) => {
  try {
    const {
      crop,
      disease,
      predictedClass,
      confidence,
      date
    } = req.body;

    const validCrops = ['Tomato', 'Potato', 'Maize', 'Rice'];

    if (!crop || !validCrops.includes(crop)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid crop.'
      });
    }

    if (
      typeof disease !== 'string' ||
      !disease.trim() ||
      typeof predictedClass !== 'string' ||
      !predictedClass.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Disease information is required.'
      });
    }

    if (
      typeof confidence !== 'number' ||
      !Number.isFinite(confidence) ||
      confidence <= 60 ||
      confidence > 100
    ) {
      return res.status(400).json({
        success: false,
        message: 'Only predictions above 60% confidence can be saved.'
      });
    }

    const scanDate = date || new Date().toISOString();

    const result = db.prepare(`
      INSERT INTO scans
      (crop, disease, predictedClass, confidence, date)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      crop,
      disease.trim(),
      predictedClass.trim(),
      confidence,
      scanDate
    );

    res.status(201).json({
      success: true,
      message: 'Scan saved successfully.',
      scanId: result.lastInsertRowid
    });

  } catch (error) {
    console.error('Save scan error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to save scan.'
    });
  }
});

// GET ALL SCAN RECORDS
app.get('/api/scans', (req, res) => {
  try {
    const scans = db.prepare(`
      SELECT * FROM scans ORDER BY id DESC
    `).all();

    res.json({
      success: true,
      total: scans.length,
      scans
    });

  } catch (error) {
    console.error('Fetch scans error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to retrieve scans.'
    });
  }
});

// DELETE ONE SCAN FROM SQLITE
app.delete('/api/scans/:id', (req, res) => {
  try {
    const scanId = Number(req.params.id);

    if (!Number.isInteger(scanId) || scanId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scan ID.'
      });
    }

    const result = db.prepare(
      'DELETE FROM scans WHERE id = ?'
    ).run(scanId);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found.'
      });
    }

    res.json({
      success: true,
      message: 'Scan deleted successfully.'
    });

  } catch (error) {
    console.error('Delete scan error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to delete scan.'
    });
  }
});

// DELETE ALL SCANS FROM SQLITE
app.delete('/api/scans', (req, res) => {
  try {
    const deleteAllScans = db.transaction(() => {
      const result = db.prepare(
        'DELETE FROM scans'
      ).run();

      return result.changes;
    });

    const deletedCount = deleteAllScans();

    res.json({
      success: true,
      message: 'All scan history deleted successfully.',
      deletedCount
    });

  } catch (error) {
    console.error('Clear all scans error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to clear scan history.'
    });
  }
});



// START SERVER
app.listen(PORT, '0.0.0.0', () => {
  console.log('================================');
  console.log(' CropSaathi Backend Started');
  console.log(` Port: ${PORT}`);
  console.log(' Database: SQLite');
  console.log('================================');
});
