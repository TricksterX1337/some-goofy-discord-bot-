const axios = require('axios');

class SlashManager {
    constructor(token) {
        this.token = token;
        this.apiBaseURL = 'https://discord.com/api/v10';
    }

    // Register a single command
    async registerCommand(command) {
        try {
            const existingCommands = await this.fetchExistingCommands();
            const existingCommand = existingCommands.find(cmd => cmd.name === command.name);

            if (existingCommand) {
                // Update command if it already exists
                await this.updateCommand(existingCommand.id, command);
            } else {
                // Create command if it doesn't exist
                await this.createCommand(command);
            }
        } catch (error) {
            console.error(`Error registering command ${command.name}:`, error.response?.data);
        }
    }

    async fetchExistingCommands() {
        const response = await axios.get(`${this.apiBaseURL}/applications/1297447184152662088/commands`, {
            headers: {
                Authorization: `Bot ${this.token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }

    
    async createCommand(command) {
        const response = await axios.post(`${this.apiBaseURL}/applications/1297447184152662088/commands`, command, {
            headers: {
                Authorization: `Bot ${this.token}`,
                'Content-Type': 'application/json',
            },
        });
        console.log(`Created command: ${response.data.name}`);
    }

    
    async updateCommand(commandId, command) {
        const response = await axios.patch(`${this.apiBaseURL}/applications/1297447184152662088/commands/${commandId}`, command, {
            headers: {
                Authorization: `Bot ${this.token}`,
                'Content-Type': 'application/json',
            },
        });
        console.log(`Updated command: ${response.data.name}`);
    }

    async loadCommands() {
      const commands = [
          require('../commands/echo'),
          // Load other commands as needed
          ];
        for (const command of commands) {
            await this.registerCommand(command);
        }
    }
}

module.exports = SlashManager;
