import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import Command from "../classes/Command"
import functions from "../functions"

module.exports = new Command({
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Display all the commands in the bot"),
    async execute(interaction, client) {
        const array = [] as string[]
        const tips = [
            "Bot will reply to messages in any channel that has \"alfredbot\" in its name",
            "Ping the bot to start talking with it",
            "Use /chatroom so the bot can remember your messages"
        ] as string[]
        const tipsArray = ["\n**Tips:**"] as string[]
        array.push("**Commands:**")
        await client.commands.forEach(cmd => {
            if (!cmd.ownerOnly) array.push(`${cmd.data.toJSON().name}\n<:reply:1093534546135355582>${cmd.data.toJSON().description}`)
        })
        await tips.forEach((tip, i) => {
            if (i == tips.length - 1) {
                tipsArray.push(`<:reply:1093534546135355582>${tip}`)
            } else {
                tipsArray.push(`<:replycont:1093534802621239316>${tip}`)
            }
        })
        await functions.embedPages(client, interaction, array, {
            author: interaction.user.username,
            authorImage: interaction.user.displayAvatarURL({ size: 1024 }),
            perPage: 10,
            endText: tipsArray.join("\n"),
            timestamp: true,
            footer: client.user?.username,
            footerImage: client.user?.displayAvatarURL({ size: 1024 })
        })
    }

})