// Create a client instance
let client = null;
let connected = false;
let connectionAttempt = 1;

logMessage(`INFO    Starting Eclipse Paho JavaScript Client.`);

const clientId = "natalecotec_" + Math.floor(Math.random() * 900) + 100;

const hostname = "broker.hivemq.com";
const port = 8884;
const path = "/mqtt";
const user = "MY_USER";
const pass = "MY_PASSWORD";

const keepAlive = 60;
const timeout = 30;
const tls = true;
const cleanSession = false;
const lastWillTopic = `natalecotec/${clientId}`;
const lastWillQos = 0;
const lastWillRetain = true;
const lastWillMessageVal = `Last will of ${clientId}`;

client = new Paho.MQTT.Client(hostname, Number(port), path, clientId);
logMessage(`INFO    Connecting to Server: [Host: ${hostname}, Port: ${port}, Path: ${client.path}, ID: ${clientId}]`);

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;
client.onConnected = onConnected;

let lastWillMessage = new Paho.MQTT.Message(lastWillMessageVal);
lastWillMessage.destinationName = lastWillTopic;
lastWillMessage.qos = lastWillQos;
lastWillMessage.retained = lastWillRetain;

const connectOptions = {
    invocationContext: {
        host: hostname,
        port: port,
        path: client.path,
        clientId: clientId
    },
    timeout: timeout,
    keepAliveInterval: keepAlive,
    cleanSession: cleanSession,
    useSSL: tls,
    onSuccess: onConnect,
    onFailure: onFail,
    userName: user,
    password: pass,
    willMessage: lastWillMessage
};
// connect the client
client.connect(connectOptions);


function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    logMessage("INFO    onConnect");

    // const subscribeTopicFilter = "natalecotec/ligar/faixa/1";
    // const qos = 1;
    // logMessage(`INFO    Subscribing to: [Topic: ${subscribeTopicFilter}, QoS: ${qos}]`);
    // client.subscribe(subscribeTopicFilter, { qos: Number(qos) });
}
function onConnected(reconnect, uri) {
    // Once a connection has been made, make a subscription and send a message.
    logMessage(`INFO    Client Has now connected: [Reconnected: ${reconnect}, URI: ${uri}]`);
    connected = true;
}
function onFail(context) {
    logMessage(`ERROR   Failed to connect. [Error Message: ${context.errorMessage}]`);
    connected = false;
}

function onConnectionLost(responseObject) {
    logMessage("INFO    onConnectionLost")
    if (responseObject.errorCode !== 0)
        logMessage(`ERROR    onConnectionLost: ${responseObject.errorMessage}, Code: ${responseObject.errorCode}`);

    // Set a timer for 2 seconds to reconnect
    const reconnectSeconds = 2 * connectionAttempt
    connectionAttempt += 1
    setTimeout(() => {
        logMessage(`INFO    Reconnecting in ${reconnectSeconds}...`);
        if (connectOptions.hasOwnProperty("mqttVersionExplicit")) {
            delete connectOptions.mqttVersionExplicit
        }
        client.connect(connectOptions)
    }, reconnectSeconds * 1000); // 1000 milliseconds = 1 second
}
function onMessageArrived(message) {
    logMessage(`Received message: ${message.payloadString}, Topic: ${message.destinationName}, QoS: ${message.qos}, Retained: ${message.retained}`)
}


function logMessage(message) {
    document.getElementById("message").innerHTML += `${message}<br>`;
    console.log(message);
}

function onClickFaixa(faixaNumuero) {
    logMessage(`INFO    Clicou na faixa ${faixaNumuero}`)
    // Publish a Message
    const message = new Paho.MQTT.Message("Ligar");
    message.destinationName = `natalecotec/ligar/faixa/${faixaNumuero}`;
    message.qos = 0;
    client.send(message)
}