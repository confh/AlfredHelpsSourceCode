import { Events, TextChannel } from 'discord.js'
import CustomClient from "../classes/CustomClient"

module.exports = {
    name: Events.ChannelDelete,
    async execute(channel: TextChannel, client: CustomClient) {
        // Iterate over the chatrooms array
        for (let i = 0; i < client.chatrooms.length; i++) {
            // Get the current chatroom
            const chatroom = client.chatrooms[i];

            // Check if the deleted channel's ID matches the current chatroom's ID
            if (channel.id === chatroom.ID) {
                // Remove the current chatroom from the array
                client.chatrooms.splice(i, 1);

                // Exit the loop as we have found and removed the chatroom
                break;
            }
        }
    }

}