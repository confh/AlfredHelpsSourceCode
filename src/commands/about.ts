import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import Command from "../classes/Command"

module.exports = new Command({
    data: new SlashCommandBuilder()
        .setName("about")
        .setDescription("Information about the bot"),
    async execute(interaction, client) {
        const uptime = client.uptime!!;
        const seconds = Math.floor(uptime / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const formattedUptime = `${days} days\n ${hours % 24} hours\n ${minutes % 60} minutes\n ${seconds % 60} seconds`;

        const embed = new EmbedBuilder()
            .setTitle(`About ${client.user?.username}`) // Set the title of the embed
            .addFields(
                {
                    name: "Servers", // Add a field for the number of servers
                    value: client.guilds.cache.size.toString(), // Set the value to the number of servers
                    inline: true // Set the field to display inline
                },
                {
                    name: "Users", // Add a field for the number of users
                    value: client.users.cache.size.toString(), // Set the value to the number of users
                    inline: true // Set the field to display inline
                },
                {
                    name: "Uptime", // Add a field for the uptime
                    value: formattedUptime, // Set the value to the formatted uptime
                    inline: true // Set the field to display inline
                },
                {
                    name: "Commands count", // Add a field for the number of commands
                    value: client.commands.filter(cmd => !(cmd.ownerOnly)).length.toString(), // Set the value to the number of commands
                    inline: true // Set the field to display inline
                },
                {
                    name: "Amount of times used in the last 24 hours", // Add a field for the usage count
                    value: client.usage.toString(), // Set the value to the usage count
                    inline: true // Set the field to display inline
                }
            )
            .setTimestamp() // Set the timestamp of the embed
            .setColor("#2a2d30") // Set the color of the embed
            .setThumbnail(client.user?.avatarURL({ size: 1024 })?.toString() as string); // Set the thumbnail of the embed

        // Send the embed as a response to the interaction
        interaction.reply({ embeds: [embed] });
    }

})