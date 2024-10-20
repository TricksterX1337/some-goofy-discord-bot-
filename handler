const WebSocket = require('ws');
const axios = require('axios');
const { loadCommands } = require('./commandLoader');
const commands = loadCommands();

class discordWebSocket {
    constructor(token, intents) {
        this.token = token;
        this.intents = intents;
        this.gatewayURL = 'wss://gateway.discord.gg/?v=10&encoding=json';
        this.connection = null;
        this.heartbeatInterval = null;
        this.lastHeartbeatAck = true;
        this.sessionId = null;
        this.lastSequenceNumber = null;
        this.reconnectTimeout = 5000;
        this.apiBaseURL = 'https://discord.com/api/v10';
        this.ping = null;
        this.lastHeartbeatTimestamp = null;
    }

    connect() {
        console.log('Connecting to Discord Gateway...');
        this.connection = new WebSocket(this.gatewayURL);

        this.connection.on('open', () => {
            console.log('Connected to Discord Gateway.');
            if (this.sessionId) {
                this.resumeSession();
            } else {
                this.identify();
            }
        });

        this.connection.on('message', (data) => {
            const payload = JSON.parse(data);
            this.handlePayload(payload);
        });

        this.connection.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
        
        this.connection.on('close', (code) => {
            console.warn(`WebSocket closed with code ${code}. Reconnecting...`);
            clearInterval(this.heartbeatInterval);
            this.connection = null;
            setTimeout(() => this.connect(), this.reconnectTimeout);
        });
    }
    
    handlePayload(payload) {
        const { op, t, d, s } = payload;

        if (s) {
            this.lastSequenceNumber = s;
        }

        switch (op) {
            case 10:
                this.startHeartbeat(d.heartbeat_interval);
                break;
            case 11:
                this.lastHeartbeatAck = true;
                console.log('Heartbeat acknowledged.');
                this.ping = Date.now() - this.lastHeartbeatTimestamp;
                console.log(`Latency: ${this.ping}ms`);
                break;
            case 0: // Dispatch
                if (t === 'READY') {
                    console.log('Bot connected and ready.');
                    this.sessionId = d.session_id;  // Store session ID for potential resuming
                }
                if (t === 'INTERACTION_CREATE') {
                    this.handleInteraction(d); // Handle slash command interaction
                }
                break;
            default:
                console.log(`Unhandled WebSocket event: ${op}`);
                break;
        }
    }

    identify() {
        const payload = {
            op: 2,
            d: {
                token: this.token,
                intents: this.intents,
                properties: {
                    $os: 'linux',
                    $browser: 'my_library',
                    $device: 'my_library',
                },
                presence: {
                    status: 'dnd',
                    activities: [{
                        name: 'KonoSuba.',
                        type: 3, // Type 3 is "Watching"
                    }],
                    afk: false,  // Not AFK
                },
            },
        };
        this.connection.send(JSON.stringify(payload));
    }

    resumeSession() {
        console.log('Attempting to resume session...');
        const payload = {
            op: 6,
            d: {
                token: this.token,
                session_id: this.sessionId,
                seq: this.lastSequenceNumber,
            },
        };
        this.connection.send(JSON.stringify(payload));
    }

    startHeartbeat(interval) {
        console.log(`Starting heartbeat every ${interval}ms.`);
        this.heartbeatInterval = setInterval(() => {
            if (!this.lastHeartbeatAck) {
                console.warn('No heartbeat ACK received. Reconnecting...');
                this.connection.close();
                return;
            }
            this.lastHeartbeatAck = false;
            this.lastHeartbeatTimestamp = Date.now();
            this.connection.send(JSON.stringify({ op: 1, d: this.lastSequenceNumber }));
            console.log('Sent heartbeat.');
        }, interval);
    }

    async handleInteraction(interaction) {
        const { type, data } = interaction;

        if (type === 2) {
            const commandName = data.name;
            const command = commands.get(commandName);
            
            if (!command) {
                console.error(`No command found for ${commandName}`);
                return;
            }

            try {
                // Execute the command
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error executing command ${commandName}:`, error);

                // Send error response to user if command execution fails
                await axios.post(`https://discord.com/api/v10/interactions/${interaction.id}/${interaction.token}/callback`, {
                    type: 4,
                    data: {
                        content: `There was an error while executing the command: ${commandName}`,
                    },
                }, {
                    headers: {
                        Authorization: `Bot ${this.token}`,
                    },
                });
            }
        }
    }

    /* Optional API Request Method
    async sendAPIRequest(endpoint, method = 'GET', data = {}) {
        try {
            const url = `${this.apiBaseURL}/${endpoint}`;
            const response = await axios({
                url,
                method,
                headers: {
                    Authorization: `Bot ${this.token}`,
                    'Content-Type': 'application/json',
                },
                data,  // Used for POST/PUT requests
            });
            return response.data;
        } catch (error) {
            console.error(`API Request Error: ${error.response?.status} - ${error.response?.data}`);
            throw error;
        }
    }

    async fetchBotInfo() {
        try {
            const botInfo = await this.sendAPIRequest('oauth2/applications/@me');
            console.log('Bot Info:', botInfo);
        } catch (error) {
            console.error('Failed to fetch bot info:', error);
        }
    }*/
}

module.exports = discordWebSocket;
