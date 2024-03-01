import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import Command from "../classes/Command"
import functions from "../functions"

module.exports = new Command({
    data: new SlashCommandBuilder()
        .setName("vote")
        .setDescription("Vote for the bot"),
    async execute(interaction, client) {
        const hasVoted = await functions.hasVoted(client, interaction.user.id)
        const embed = new EmbedBuilder()
            .setTimestamp()
            .setAuthor({ name: `Vote for ${client.user?.displayName}`, iconURL: client.user?.avatarURL({ size: 1024 }) as string })
            .setFooter({ text: `${client.user?.username}`, iconURL: client.user?.avatarURL({ size: 1024 }) as string })
            .setDescription(`${hasVoted ? "You've already voted!!\n\n" : ""}[Click here to vote](https://top.gg/bot/717830171574403162/vote)`)
            .setColor(hasVoted ? client.config2.colors.success : client.config2.colors.normal)

        await interaction.reply({ embeds: [embed] })
    }
})