import { SlashCommandBuilder, EmbedBuilder, CommandInteraction, ColorResolvable } from "discord.js"
import Command from "../classes/Command"

module.exports = new Command({
    data: new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription("Information about a user")
        .addUserOption(e => e
            .setRequired(false)
            .setName("user")
            .setDescription("The user to display information about")) as SlashCommandBuilder,
    async execute(interaction, client) {
        const user = interaction.options.getUser("user") || interaction.user
        const bannedFromBot = ["767741466424246273"]
        const roles = [
            {
                User: "538352367654141952",
                Role: "Owner"
            },
            {
                User: "762910903325818880",
                Role: "Co-Owner"
            },
            {
                User: "1203731941317410896",
                Role: "Co-Owner"
            },
        ]
        const inServer = interaction.guild?.members.cache.get(user.id) ? true : false
        const fields = [
            {
                name: "Display name",
                value: user.displayName,
                inline: true
            },
            {
                name: "Username",
                value: user.username,
                inline: true
            },
            {
                name: "Banned from bot",
                value: `${bannedFromBot.includes(user.id) ? "true" : "false"}`,
                inline: true
            },
            {
                name: "Role in the bot",
                value: `${roles.find(a => a.User === user.id) ? roles.find(a => a.User === user.id)?.Role : "User"}`,
                inline: true
            },
            {
                name: "In server",
                value: `${inServer}`,
                inline: true
            },
        ]
        if (inServer) {
            const member = interaction.guild?.members.cache.get(user.id)
            fields.push({
                name: "Highest role",
                value: member?.roles.highest.name.toString() as string,
                inline: true
            })
        }
        const embed = new EmbedBuilder()
            .setTitle(`Information about ${user.displayName}`)
            .addFields(fields)
            .setTimestamp()
            .setColor(client.config2.colors.success)
            .setThumbnail(user.avatarURL({ size: 1024 })?.toString() as string)

        if (inServer) embed.setColor(interaction.guild?.members.cache.get(user.id)?.displayHexColor as ColorResolvable)
        interaction.reply({ embeds: [embed] })
    }

})