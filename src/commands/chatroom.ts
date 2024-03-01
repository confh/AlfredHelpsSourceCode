import { PermissionsBitField, SlashCommandBuilder, CommandInteraction, ChannelType, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import Command from "../classes/Command"
import functions from "../functions"
const maintenance = false

module.exports = new Command({
    data: new SlashCommandBuilder()
        .setName("chatroom")
        .setDescription("Create chatroom and talk to the bot") as SlashCommandBuilder,
    async execute(interaction: CommandInteraction, client) {
        if (client.restarting) return interaction.reply("This bot is currently restarting and won't be able to make a chatroom.")
        if (maintenance && !client.config.owners.includes(interaction.user.id)) return interaction.reply(`Hey ${interaction.user.username}! The bot is currently under maintenance and can only be used by the owner/co-owner.`)
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
        if (client.chatrooms.find(e => e.Owner === interaction.user.id)) {
            if (interaction.guild?.channels.cache.get(client.chatrooms.find(e => e.Owner === interaction.user.id)?.ID as string)) { return interaction.editReply(`You already made a channel which is <#${client.chatrooms.find(e => e.Owner === interaction.user.id)?.ID as string}>`) }
            else {
                let index = -1
                client.chatrooms.find((e: any, i: number) => {
                    if (e.Owner === interaction.user.id) {
                        index = i
                        return i
                    }
                })
                if (index > -1) client.chatrooms.splice(index, 1)
            }
        }
        if (!interaction.guild?.members.me?.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.editReply("I need manage channels permissions")
        const channel = await interaction.guild?.channels.create({
            name: `alfred-channel-${client.chatrooms.length + 1}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: interaction.guild.members.me.id,
                    allow: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: interaction.guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionFlagsBits.ViewChannel]
                }
            ]
        })
        client.chatrooms.push({ ID: channel.id, Owner: interaction.user.id, history: [{ role: "user", parts: `call me ${interaction.user.username} and I will call you "Alfred" from now on` }, { role: "model", parts: `Ok I wil call you ${interaction.user.username} from now on` }] })
        channel.send(`<@${interaction.user.id}> here you can chat with me and when you want to end the chat just say \`endchat\``)
        interaction.editReply(`Successfully made chatroom <#${channel.id}>.${interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels) && (await functions.chance(5)) ? '\n\n** PROTIP: U can include the name "alfredbot" on a channel to make the bot respond to messages there without needing to ping!**' : ""}`)
    }
})