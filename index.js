const discordWebSocket = require('./handler/connector');
const SlashManager = require('./handler/register');
const { loadCommands } = require('./handler/commandLoader');

const token = process.env.Token;
const intents = 513;

const client = new discordWebSocket(token, intents);
const commands = loadCommands();
const slashManager = new SlashManager(token);
client.connect();
//client.fetchBotInfo();

(async () => {
    await slashManager.loadCommands();
})();

module.exports = {
    client,
    commands
}
