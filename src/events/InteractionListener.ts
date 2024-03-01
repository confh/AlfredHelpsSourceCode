import { EmbedBuilder, Events, CommandInteraction } from "discord.js";
import CustomClient from "../classes/CustomClient"
import functions from "../functions";

const maintenance = false

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction: CommandInteraction, client: CustomClient) {
        if (!interaction.isChatInputCommand()) return;
        const cmd = client.commands.find(a => a.data.toJSON().name === interaction.commandName)

        if (!cmd) {
            client.logError(`Unknown command "${interaction.commandName}"`)
        }

        if (cmd?.ownerOnly && client.config.owners[0] != interaction.user.id) {
            return interaction.reply({ content: "This command is available for the owner only.", ephemeral: true })
        }

        if (maintenance && !client.config.owners.includes(interaction.user.id)) {
            return interaction.reply(`Hey ${interaction.user.username}! The bot is currently under maintenance and can only be used by the owner/co-owner.`)
        }

        try {
            await cmd?.execute(interaction, client)
        } catch (err) {
            const id = functions.uuid()
            const embed = new EmbedBuilder()
                .setColor(client.config2.colors.error)
                .setTitle("Error")
                .setDescription(`There was an error while executing this command!\nThe developers have been notified.\n\n**Error code: ${id}**`)
                .setTimestamp()
            client.logError(`Unable to execute command: ${err}`, { enabled: true, id })
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [embed], ephemeral: true, allowedMentions: { parse: [] } });
            } else {
                await interaction.reply({ embeds: [embed], ephemeral: true, allowedMentions: { parse: [] } });
            }
        }
    }
}