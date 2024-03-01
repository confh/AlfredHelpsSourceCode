import { EmbedBuilder, SlashCommandBuilder } from "discord.js"
import Command from "../classes/Command"
import OpenAI from "openai"
import functions from "../functions"

module.exports = new Command({
    data: new SlashCommandBuilder()
        .setName("image")
        .setDescription("Generate an image")
        .addStringOption(e => e
            .setRequired(true)
            .setName("prompt")
            .setDescription("Context of the image")) as SlashCommandBuilder,
    async execute(interaction, client) {
        const voted = await functions.hasVoted(client, interaction.user.id)
        if (!voted) {
            const embed = new EmbedBuilder()
                .setTimestamp()
                .setAuthor({ name: `Vote for ${client.user?.displayName}`, iconURL: client.user?.avatarURL({ size: 1024 }) as string })
                .setFooter({ text: `${client.user?.username}`, iconURL: client.user?.avatarURL({ size: 1024 }) as string })
                .setDescription(`You've to vote in order to use this command.\n\n[Click here to vote](https://top.gg/bot/717830171574403162/vote)`)
                .setColor(client.config2.colors.error)
            return await interaction.reply({ embeds: [embed], ephemeral: true })
        }
        await interaction.deferReply()
        const prompt = interaction.options.getString("prompt")

        const openai = new OpenAI({ apiKey: "OPEN_AI_API_KEY" })

        try {
            const image = await openai.images.generate({ prompt: prompt })

            await interaction.editReply(image.data[0].url)
        } catch (e: any) {
            await interaction.editReply(e.error.message)
        }
    }
})