const axios = require('axios');

module.exports = {
    name: 'echo',
    description: 'Echoes a message to the channel.',
    options: [
        {
            name: 'message',
            type: 3, // STRING type
            description: 'The message to echo',
            required: true,
        },
    ],
    async execute(interaction) {
        // Extract the message option from the interaction data
        const message = interaction.data.options.find(opt => opt.name === 'message').value;

        await axios.post(`https://discord.com/api/v10/channels/${interaction.channel_id}/messages`, {
            content: message,
        }, {
            headers: {
                Authorization: `Bot ${process.env.Token}`,
                'Content-Type': 'application/json',
            },
        });

        // Send an ephemeral response indicating the message was sent
        await axios.post(`https://discord.com/api/v10/interactions/${interaction.id}/${interaction.token}/callback`, {
            type: 4, // Send a response
            data: {
                content: 'Your message has been sent!',
                flags: 64, // Make this message ephemeral
            },
        }, {
            headers: {
                Authorization: `Bot ${process.env.Token}`, 
            },
        });
    },
};
