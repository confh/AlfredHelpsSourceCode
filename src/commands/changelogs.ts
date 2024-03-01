import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import Command from "../classes/Command"

module.exports = new Command({
    data: new SlashCommandBuilder()
        .setName("changelogs")
        .setDescription("View changelogs"),
    async execute(interaction, client) {
        const changes = [
            {
                Date: "24th of January, 2024",
                Change: "**Chatrooms**: Use /chatrooms command to talk with the bot in a private channel and it can remember your messages!"
            },
            {
                Date: "30th of January, 2024",
                Change: "**Image generation**: Use /image to generate an image"
            }
        ]
        const embed = new EmbedBuilder()
            .setTitle(`Changelogs`)
            .setTimestamp()
            .setColor("#2a2d30")
            .setThumbnail(client.user?.avatarURL({ size: 1024 })?.toString() as string)
            .setDescription(changes.map(e => `**${e.Date}**\n${e.Change}`).join("\n\n"))
        interaction.reply({ embeds: [embed] })
    }

})