import { Events, TextChannel } from 'discord.js'
import CustomClient from "../classes/CustomClient"

module.exports = {
    name: Events.ChannelDelete,
    async execute(channel: TextChannel, client: CustomClient) {
        for (let i = 0; i < client.chatrooms.length; i++) {
            const chatroom = client.chatrooms[i]
            if (channel.id === chatroom.ID) {
                client.chatrooms.splice(i, 1)
                break
            }
        }
    }
}