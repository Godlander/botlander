const {Events} = require('discord.js');
const {clientid} = require('../config.json');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        //ignore bot messages
        channel = message.channel;
        if (message.author.bot) return;

        //ignore non botlander calls
        const regx = new RegExp(`(botlander|<@!?${clientid}>)`, 'i');
        if (!regx.test(message.content)) return;

        //look for reminder
        if (await require('../actions/reminder').execute(message)) return;
        //chatbot response
        require('../actions/chatbot').execute(message);
    }
};