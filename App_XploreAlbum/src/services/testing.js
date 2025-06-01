// Test de conexión
const roboflowService = require('./roboflowService.js');

async function testRoboflow() {
  const result = await roboflowService.testConnection();
  console.log('Test result:', result);
}

testRoboflow();