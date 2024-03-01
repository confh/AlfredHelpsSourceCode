import { SlashCommandBuilder } from "discord.js"
import Command from "../classes/Command"

module.exports = new Command({
    data: new SlashCommandBuilder()
        .setName("export")
        .setDescription("Show usage of the bot"),
    ownerOnly: true,
    async execute(interaction, client) {
        const mapped = client.usersUsage.sort((a, b) => {
            return b.usage - a.usage
        }).map(e => `${client.users.cache.get(e.user)?.displayName} used the bot ${e.usage} time(s) which is ${Math.round(e.usage / client.usage * 100)}% of total bot usage.`)
        interaction.reply(`${mapped.length ? `${mapped.join('\n')}` : "No usage today"}`)
    }
})