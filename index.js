const http = require('http');
const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');

// MQTT Broker settings
const brokerUrl = 'mqtt://broker.emqx.io';
const brokerPort = 1883;
const topic = 'sense/live';

// Create an MQTT client
const mqttClient = mqtt.connect(brokerUrl, { port: brokerPort });

// Function to send status ("on" or "off") to the broker
function sendStatusToBroker(status) {
  mqttClient.publish(topic, status, (err) => {
    if (err) {
      console.error('Error publishing status:', err);
    } else {
      console.log(`Status "${status}" published successfully.`);
    }
  });
}

// Create an HTTP server
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/send-data') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      const status = body.trim(); // Remove any leading/trailing whitespaces
      if (status === 'on' || status === 'off') {
        sendStatusToBroker(status);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(`Status "${status}" received and sent successfully.`);
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid status');
      }
    });
  } else {
    // Serve the index.html file for any other request
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading index.html');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      }
    });
  }
});

// Start the server on port 3000
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

// MQTT client event handlers
mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
});

mqttClient.on('error', (err) => {
  console.error('MQTT Error:', err);
});

mqttClient.on('close', () => {
  console.log('Disconnected from MQTT broker');
});
