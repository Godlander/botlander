import { APIEmbed, ChatInputCommandInteraction, DMChannel, Guild, GuildMember, SlashCommandBuilder, TextChannel } from 'discord.js';

export const slashcommand = new SlashCommandBuilder()
.setName('quote')
.setDescription('Quotes a message')
.addStringOption(option =>
    option.setName('message')
    .setDescription('Link to the message to quote')
    .setRequired(true))
.addUserOption(option => option
    .setName('mention')
    .setDescription('Mentions a user in the quote'))
.addBooleanOption(option => option
    .setName('raw')
    .setDescription('Sends the quote embed as raw string'))

export async function run(interaction : ChatInputCommandInteraction) {
    const input = interaction.options.getString('message', true).toLowerCase();
    const user = interaction.options.getUser('mention', false);
    const mention = user? `${user}` : '';
    const raw = interaction.options.getBoolean('raw', false);
    //check that link is a discord message
    if (!input.startsWith('https://discord.com/channels/')) {
        interaction.reply({content: `Invalid message link`, ephemeral: true});
        return;
    }
    const id = input.split('/').splice(4,3);
    try {
        const dm = id[0] === "@me";
        const guild = dm? null : await interaction.client.guilds.fetch(id[0]);
        const channel = guild? await guild.channels.fetch(id[1]) : await interaction.client.channels.fetch(id[1]);
        if (channel === null || !("messages" in channel)) throw 0;
        const message = await channel.messages.fetch(id[2]);

        let member;
        try {dm? (channel as DMChannel).recipient : await (guild as Guild).members.fetch(message.author);}
        catch {member = null;}
        const embed : APIEmbed = {
            color: member? (member as GuildMember).displayColor || 3553599 : 3553599,
            author: {
                name: message.author.username || "Unknown",
                icon_url: message.author.avatarURL() ?? undefined,
            },
            description: message.content ?? ' ',
            footer: {
                text: dm? '@'+message.author.username : '#'+(channel as TextChannel).name,
                icon_url: dm? undefined : (guild as Guild).iconURL() ?? undefined
            },
            timestamp: message.createdAt.toISOString()
        };
        if (message.attachments.size > 0) {
            let img = message.attachments.find(a => a?.contentType?.startsWith("image"));
            if (img != null) embed.image = {url:img.url};
        }
        if (raw) interaction.reply('`'+JSON.stringify(embed)+'`');
        else interaction.reply({content: mention + ' ' + input, embeds:[embed]});
    }
    catch (e) {
        interaction.reply({content: `Invalid message link`, ephemeral: true});
        console.log(e);
        return;
    }
}
