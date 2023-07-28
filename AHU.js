const mqtt = require('mqtt');

// MQTT Broker settings
const brokerUrl = 'mqtt://broker.emqx.io';
const brokerPort = 1883;
const topic = 'sense/live';

// Data to send
const dataOn = { status: 'on' };
const dataOff = { status: 'off' };

// Function to send data to the broker
function sendData(client, data) {
  const jsonData = JSON.stringify(data);
  client.publish(topic, jsonData, (err) => {
    if (err) {
      console.error('Error publishing data:', err);
    } else {
      console.log('Data published successfully:', jsonData);
    }
  });
}

// Connect to the broker
const client = mqtt.connect(brokerUrl, { port: brokerPort });

client.on('connect', () => {
  console.log('Connected to MQTT broker');

  // Send data every 5 minutes
  setInterval(() => {
    // Generate a random number (0 or 1) to alternate between on and off status
    const randomStatus = Math.random() < 0.5 ? 'on' : 'off';
    const dataToSend = { status: randomStatus };

    sendData(client, dataToSend);
  }, 1000); // 5 minutes in milliseconds
});

client.on('error', (err) => {
  console.error('MQTT Error:', err);
});

client.on('close', () => {
  console.log('Disconnected from MQTT broker');
});
