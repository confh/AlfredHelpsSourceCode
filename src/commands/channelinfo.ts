import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import Command from "../classes/Command"

module.exports = new Command({
    data: new SlashCommandBuilder()
        .setName("channelinfo")
        .setDescription("Information about a channel")
        .addChannelOption(e => e
            .setRequired(false)
            .setName("channel")
            .setDescription("The channel to display info about")) as SlashCommandBuilder,
    async execute(interaction, client) {
        const channel = interaction.options.getChannel("channel") || interaction.channel
        const bannedChannels = ["1143423513429028867"]
        const embed = new EmbedBuilder()
            .setTitle(`Information about the current channel`)
            .addFields(
                {
                    name: "Name",
                    value: client.guilds.cache.size.toString(),
                    inline: true
                },
                {
                    name: "Created at",
                    value: new Date((channel?.createdTimestamp) as number).toLocaleDateString("en-us"),
                    inline: true
                },
                {
                    name: "Is bot banned in it",
                    value: `${bannedChannels.includes(channel.id) ? "true" : "false"}`,
                    inline: true
                },
                {
                    name: "ID",
                    value: interaction.channel?.id.toString() as string,
                    inline: true
                }
            )
            .setTimestamp()
            .setColor(client.config2.colors.normal)
            .setThumbnail(interaction.guild?.iconURL({ size: 1024 }))
        interaction.reply({ embeds: [embed] })
    }

})