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

// Function to send data to the broker
function sendDataToBroker(data) {
  const jsonData = JSON.stringify(data);
  mqttClient.publish(topic, jsonData, (err) => {
    if (err) {
      console.error('Error publishing data:', err);
    } else {
      console.log('Data published successfully:', jsonData);
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
      try {
        const data = JSON.parse(body);
        if (data.status === 'on' || data.status === 'off') {
          sendDataToBroker(data);
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('Data received successfully');
        } else {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Invalid data');
        }
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error processing data');
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
