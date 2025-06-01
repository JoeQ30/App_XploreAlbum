const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

class RoboflowService {
  constructor() {
    this.apiKey = process.env.ROBOFLOW_API_KEY;
    this.workspace = process.env.ROBOFLOW_WORKSPACE;
    this.project = process.env.ROBOFLOW_PROJECT;
    this.version = process.env.ROBOFLOW_VERSION;
    
    // Use traditional Hosted API endpoint instead of serverless
    this.baseUrl = `https://detect.roboflow.com/${this.project}/${this.version}`;
    
    // Validate required environment variables
    if (!this.apiKey) {
      throw new Error('Missing ROBOFLOW_API_KEY environment variable');
    }
    if (!this.project) {
      throw new Error('Missing ROBOFLOW_PROJECT environment variable');
    }
    if (!this.version) {
      throw new Error('Missing ROBOFLOW_VERSION environment variable');
    }
    
    console.log('RoboflowService initialized with Hosted API URL:', this.baseUrl);
  }

  async predictFromBuffer(imageBuffer) {
    try {
      // Validate inputs
      if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
        throw new Error('Invalid image buffer provided');
      }

      // Convert buffer to base64 - traditional format (no data URL prefix)
      const base64Image = imageBuffer.toString('base64');
      
      console.log('Calling Roboflow Hosted API...');
      console.log('URL:', this.baseUrl);
      console.log('Image size:', imageBuffer.length, 'bytes');
      
      // Traditional Hosted API format
      const response = await axios({
        method: 'POST',
        url: `${this.baseUrl}?api_key=${this.apiKey}`,
        data: base64Image,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000, // 30 second timeout
        validateStatus: function (status) {
          return status < 500; // Don't throw for 4xx errors
        }
      });

      console.log('Roboflow Hosted API response status:', response.status);
      console.log('Roboflow Hosted API response received');
      
      if (response.status === 404) {
        throw new Error(`API endpoint not found. Please verify your project (${this.project}) and version (${this.version})`);
      }
      
      if (response.status >= 400) {
        throw new Error(`API request failed with status ${response.status}: ${response.data?.message || response.statusText}`);
      }
      
      return this.processPredictions(response.data);
      
    } catch (error) {
      console.error('Error calling Roboflow Hosted API:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: this.baseUrl
      });
      
      // Return structured error for better handling
      if (error.response?.status === 400) {
        throw new Error('Imagen no válida o formato incorrecto');
      } else if (error.response?.status === 402) {
        throw new Error('Límite de API excedido');
      } else if (error.response?.status === 404) {
        throw new Error(`Endpoint no encontrado. Verifica tu proyecto y versión`);
      } else if (error.response?.status >= 500) {
        throw new Error('Error del servidor de IA. Intenta de nuevo.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout: La IA tardó demasiado en responder');
      } else {
        throw new Error(`Error procesando imagen con IA: ${error.message}`);
      }
    }
  }

  // Alternative method for URL-based images (Hosted API format)
  async predictFromUrl(imageUrl) {
    try {
      console.log('Calling Roboflow Hosted API with URL...');
      
      const response = await axios({
        method: 'POST',
        url: `${this.baseUrl}?api_key=${this.apiKey}&image=${encodeURIComponent(imageUrl)}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000
      });

      console.log('Roboflow Hosted API response received');
      return this.processPredictions(response.data);
      
    } catch (error) {
      console.error('Error calling Roboflow Hosted API:', error);
      throw this.handleApiError(error);
    }
  }

  handleApiError(error) {
    if (error.response?.status === 400) {
      return new Error('Imagen no válida o formato incorrecto');
    } else if (error.response?.status === 402) {
      return new Error('Límite de API excedido');
    } else if (error.response?.status >= 500) {
      return new Error('Error del servidor de IA. Intenta de nuevo.');
    } else if (error.code === 'ECONNABORTED') {
      return new Error('Timeout: La IA tardó demasiado en responder');
    } else {
      return new Error('Error procesando imagen con IA');
    }
  }

  processPredictions(apiResponse) {
    try {
      // Workflows API might have different response structure
      console.log('Processing workflow response:', JSON.stringify(apiResponse, null, 2));
      
      let predictions = [];
      
      // Check for workflow-specific response format
      if (apiResponse.outputs && apiResponse.outputs.predictions) {
        predictions = Array.isArray(apiResponse.outputs.predictions) 
          ? apiResponse.outputs.predictions 
          : [apiResponse.outputs.predictions];
      } 
      // Fallback to standard formats
      else if (apiResponse.predictions && Array.isArray(apiResponse.predictions)) {
        predictions = apiResponse.predictions;
      } else if (apiResponse.predicted_classes && Array.isArray(apiResponse.predicted_classes)) {
        predictions = apiResponse.predicted_classes;
      } 
      // Check if the response itself is a prediction array
      else if (Array.isArray(apiResponse)) {
        predictions = apiResponse;
      } else {
        console.log('Unexpected Workflows API response format:', apiResponse);
        
        // Try to extract any prediction-like data
        const possiblePredictions = this.extractPredictionsFromResponse(apiResponse);
        if (possiblePredictions.length > 0) {
          predictions = possiblePredictions;
        }
      }

      if (!predictions || predictions.length === 0) {
        return {
          success: false,
          message: 'No se pudo identificar ningún lugar en la imagen'
        };
      }

      // Sort predictions by confidence (highest first)
      const sortedPredictions = [...predictions].sort((a, b) => {
        const confidenceA = this.getConfidence(a);
        const confidenceB = this.getConfidence(b);
        return confidenceB - confidenceA;
      });

      const bestPrediction = sortedPredictions[0];
      const confidence = this.getConfidence(bestPrediction);
      const className = this.getClassName(bestPrediction);

      // Minimum confidence threshold
      if (confidence < 0.3) { // 30% minimum confidence
        return {
          success: false,
          message: `Lugar identificado con baja confianza (${(confidence * 100).toFixed(1)}%). Intenta con una imagen más clara.`
        };
      }

      return {
        success: true,
        predictions: sortedPredictions,
        bestPrediction: {
          class: className,
          confidence: confidence,
          boundingBox: this.getBoundingBox(bestPrediction)
        }
      };
      
    } catch (error) {
      console.error('Error processing predictions:', error);
      return {
        success: false,
        message: 'Error procesando respuesta de la IA'
      };
    }
  }

  // Helper methods to handle different response formats
  extractPredictionsFromResponse(response) {
    const predictions = [];
    
    // Recursively search for prediction-like objects
    const searchForPredictions = (obj, path = '') => {
      if (typeof obj !== 'object' || obj === null) return;
      
      for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value) && value.length > 0) {
          // Check if this array contains prediction-like objects
          const firstItem = value[0];
          if (this.isPredictionLike(firstItem)) {
            predictions.push(...value);
          } else {
            value.forEach((item, index) => searchForPredictions(item, `${path}.${key}[${index}]`));
          }
        } else if (typeof value === 'object') {
          if (this.isPredictionLike(value)) {
            predictions.push(value);
          } else {
            searchForPredictions(value, `${path}.${key}`);
          }
        }
      }
    };
    
    searchForPredictions(response);
    return predictions;
  }

  isPredictionLike(obj) {
    if (typeof obj !== 'object' || obj === null) return false;
    
    // Check for common prediction properties
    const hasConfidence = 'confidence' in obj || 'conf' in obj || 'score' in obj;
    const hasClass = 'class' in obj || 'name' in obj || 'label' in obj;
    
    return hasConfidence || hasClass;
  }

  getConfidence(prediction) {
    return prediction.confidence || prediction.conf || prediction.score || 0;
  }

  getClassName(prediction) {
    return prediction.class || prediction.name || prediction.label || 'unknown';
  }

  // MÉTODO TESTCONNECTION CORREGIDO - FORMATO EXACTO DE ROBOFLOW
  async testConnection() {
    try {
      console.log('Testing Roboflow Hosted API connection...');
      console.log('API Key:', this.apiKey ? `${this.apiKey.substring(0, 8)}...` : 'NOT SET');
      console.log('Project:', this.project);
      console.log('Version:', this.version);
      console.log('Full URL:', this.baseUrl);
      
      // Crear una imagen JPEG simple y válida de 64x64 pixels
      // Esta es una imagen JPEG mínima pero completamente válida
      const testImageBase64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAEAAQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDX4BAAACAAQAAgAEAAIABAACAA=';
      
      const response = await axios({
        method: 'POST',
        url: `${this.baseUrl}?api_key=${this.apiKey}`,
        data: testImageBase64,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 15000,
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      console.log('Connection test result:', response.status, response.statusText);
      console.log('API Response:', JSON.stringify(response.data, null, 2));
      
      return {
        success: response.status === 200,
        status: response.status,
        message: response.status === 200 ? 'Conexión exitosa' : response.statusText,
        data: response.data,
        note: response.status === 200 ? 'API funcionando correctamente' : 'Revisar configuración'
      };
      
    } catch (error) {
      console.error('Connection test failed:', error.message);
      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        suggestion: this.getErrorSuggestion(error)
      };
    }
  }

  // MÉTODO ALTERNATIVO: Test con imagen desde archivo real
  async testConnectionWithFile() {
    try {
      // Crear un buffer de imagen JPEG simple programáticamente
      const fs = require('fs');
      const path = require('path');
      
      // Imagen JPEG de 32x32 roja sólida
      const simpleImageBuffer = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
        0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0x10, 0x0B, 0x0C, 0x0E, 0x0C, 0x0A, 0x10,
        0x0E, 0x0D, 0x0E, 0x12, 0x11, 0x10, 0x13, 0x18, 0x28, 0x1A, 0x18, 0x16, 0x16, 0x18, 0x31, 0x23,
        0x25, 0x1D, 0x28, 0x3A, 0x33, 0x3D, 0x3C, 0x39, 0x33, 0x38, 0x37, 0x40, 0x48, 0x5C, 0x4E, 0x40,
        0x44, 0x57, 0x45, 0x37, 0x38, 0x50, 0x6D, 0x51, 0x57, 0x5F, 0x62, 0x67, 0x68, 0x67, 0x3E, 0x4D,
        0x71, 0x79, 0x70, 0x64, 0x78, 0x5C, 0x65, 0x67, 0x63, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x20,
        0x00, 0x20, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xFF, 0xC4, 0x00, 0x14,
        0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x08, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C, 0x03, 0x01, 0x00, 0x02,
        0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0xB2, 0xC0, 0x07, 0xFF, 0xD9
      ]);
      
      console.log('Testing with programmatically created JPEG buffer...');
      
      const base64Image = simpleImageBuffer.toString('base64');
      
      const response = await axios({
        method: 'POST',
        url: `${this.baseUrl}?api_key=${this.apiKey}`,
        data: base64Image,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 15000,
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      return {
        success: response.status === 200,
        status: response.status,
        message: response.statusText,
        data: response.data,
        imageSize: simpleImageBuffer.length
      };
      
    } catch (error) {
      console.error('Buffer image test failed:', error.message);
      return {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  // Método para obtener sugerencias basadas en el error
  getErrorSuggestion(error) {
    const status = error.response?.status;
    
    switch (status) {
      case 401:
        return 'Verifica tu ROBOFLOW_API_KEY';
      case 404:
        return 'Verifica ROBOFLOW_PROJECT y ROBOFLOW_VERSION';
      case 402:
        return 'Has excedido el límite de tu plan de Roboflow';
      case 400:
        return 'Problema con el formato de la solicitud';
      default:
        return 'Verifica tu configuración de Roboflow';
    }
  }

  getBoundingBox(prediction) {
    return {
      x: prediction.x || prediction.bbox?.x || 0,
      y: prediction.y || prediction.bbox?.y || 0,
      width: prediction.width || prediction.bbox?.width || 0,
      height: prediction.height || prediction.bbox?.height || 0
    };
  }
}

module.exports = new RoboflowService();