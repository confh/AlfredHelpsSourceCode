import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import Command from "../classes/Command"

module.exports = new Command({
    data: new SlashCommandBuilder()
        .setName("about")
        .setDescription("Information about the bot"),
    async execute(interaction, client) {
        const uptime = client.uptime!!
        const seconds = Math.floor(uptime / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const formattedUptime = `${days} days\n ${hours % 24} hours\n ${minutes % 60} minutes\n ${seconds % 60} seconds`
        const embed = new EmbedBuilder()
            .setTitle(`About ${client.user?.username}`)
            .addFields(
                {
                    name: "Servers",
                    value: client.guilds.cache.size.toString(),
                    inline: true
                },
                {
                    name: "Users",
                    value: client.users.cache.size.toString(),
                    inline: true
                },
                {
                    name: "Uptime",
                    value: formattedUptime,
                    inline: true
                },
                {
                    name: "Commands count",
                    value: client.commands.filter(cmd => !(cmd.ownerOnly)).length.toString(),
                    inline: true
                },
                {
                    name: "Amount of times used in the last 24 hours",
                    value: client.usage.toString(),
                    inline: true
                }
            )
            .setTimestamp()
            .setColor("#2a2d30")
            .setThumbnail(client.user?.avatarURL({ size: 1024 })?.toString() as string)
        interaction.reply({ embeds: [embed] })
    }

})