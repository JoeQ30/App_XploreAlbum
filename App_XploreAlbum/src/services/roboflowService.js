const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

class RoboflowService {
  constructor() {
    this.apiKey = process.env.ROBOFLOW_API_KEY;
    this.workspace = process.env.ROBOFLOW_WORKSPACE;
    this.project = process.env.ROBOFLOW_PROJECT;
    this.version = process.env.ROBOFLOW_VERSION;
    this.baseUrl = `https://detect.roboflow.com/${this.project}/${this.version}`;
  }

  async predictFromBuffer(imageBuffer) {
    try {
      const formData = new FormData();
      formData.append('file', imageBuffer, { 
        filename: 'image.jpg',
        contentType: 'image/jpeg'
      });

      const response = await axios.post(this.baseUrl, formData, {
        params: {
          api_key: this.apiKey,
          confidence: 40,
          overlap: 30
        },
        headers: {
          ...formData.getHeaders(),
          'Accept': 'application/json'
        }
      });

      return this.processPredictions(response.data);
    } catch (error) {
      console.error('Error calling Roboflow API:', error);
      throw new Error('Error processing image with AI');
    }
  }

  async predictFromUri(imageUri) {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(imageUri));

      const response = await axios.post(this.baseUrl, formData, {
        params: {
          api_key: this.apiKey,
          confidence: 40,
          overlap: 30
        },
        headers: {
          ...formData.getHeaders(),
          'Accept': 'application/json'
        }
      });

      return this.processPredictions(response.data);
    } catch (error) {
      console.error('Error calling Roboflow API:', error);
      throw new Error('Error processing image with AI');
    }
  }

  processPredictions(predictions) {
    if (!predictions.predictions || predictions.predictions.length === 0) {
      return {
        success: false,
        message: 'No landmarks identified'
      };
    }

    // Ordenar predicciones por confianza (mayor primero)
    const sortedPredictions = [...predictions.predictions].sort((a, b) => b.confidence - a.confidence);
    const bestPrediction = sortedPredictions[0];

    return {
      success: true,
      predictions: sortedPredictions,
      bestPrediction: {
        class: bestPrediction.class,
        confidence: bestPrediction.confidence,
        boundingBox: {
          x: bestPrediction.x,
          y: bestPrediction.y,
          width: bestPrediction.width,
          height: bestPrediction.height
        }
      }
    };
  }
}

module.exports = new RoboflowService();