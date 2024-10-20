const fs = require('fs');
const path = require('path');

function loadCommands() {
    const commands = new Map();
    
    const commandFolder = path.join(__dirname, '../commands');
    
    const commandFiles = fs.readdirSync(commandFolder).filter(file => file.endsWith('.js'));

    // Loop through each command file and add it to the commands map
    for (const file of commandFiles) {
        const command = require(path.join(commandFolder, file));
        commands.set(command.name, command);
    }

    return commands;
}

module.exports = { loadCommands };
