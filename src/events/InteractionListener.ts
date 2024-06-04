import { EmbedBuilder, Events, CommandInteraction } from "discord.js";
import CustomClient from "../classes/CustomClient"
import functions from "../functions";

const maintenance = false

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    // This function is called whenever a chat input command is created on the discord server
    // It checks if the command is a chat input command and if it's not, it returns
    // It tries to find the command in the commands collection
    // If the command is not found, it logs an error and returns
    // If the command is ownerOnly and the user is not the owner, it replies with a message and returns
    // If the bot is in maintenance mode and the user is not the owner, it replies with a message and returns
    // It tries to execute the command passing the interaction and the client as arguments
    // If there is an error, it generates a unique id, creates a new embed with the error information and sends it to the user
    async execute(interaction: CommandInteraction, client: CustomClient) {
        // Check if the interaction is a chat input command
        if (!interaction.isChatInputCommand()) return;

        // Try to find the command in the commands collection
        const cmd = client.commands.find(a => a.data.toJSON().name === interaction.commandName)

        // If the command is not found, log an error
        if (!cmd) {
            client.logError(`Unknown command "${interaction.commandName}"`)
            return;
        }

        // If the command is ownerOnly and the user is not the owner, reply with a message and return
        if (cmd?.ownerOnly && client.config.owners[0] != interaction.user.id) {
            return interaction.reply({ content: "This command is available for the owner only.", ephemeral: true })
        }

        // If the bot is in maintenance mode and the user is not the owner, reply with a message and return
        if (maintenance && !client.config.owners.includes(interaction.user.id)) {
            return interaction.reply(`Hey ${interaction.user.username}! The bot is currently under maintenance and can only be used by the owner/co-owner.`)
        }

        try {
            // Try to execute the command passing the interaction and the client as arguments
            await cmd?.execute(interaction, client)
        } catch (err) {
            // Generate a unique id
            const id = functions.uuid()

            // Create a new embed with the error information
            const embed = new EmbedBuilder()
                .setColor(client.config2.colors.error)
                .setTitle("Error")
                .setDescription(`There was an error while executing this command!\nThe developers have been notified.\n\n**Error code: ${id}**`)
                .setTimestamp()

            // Log the error with the unique id
            client.logError(`Unable to execute command: ${err}`, { enabled: true, id })

            // If the interaction has been replied to or deferred, follow up with the embed
            // Otherwise, reply with the embed
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [embed], ephemeral: true, allowedMentions: { parse: [] } });
            } else {
                await interaction.reply({ embeds: [embed], ephemeral: true, allowedMentions: { parse: [] } });
            }
        }
    }
}