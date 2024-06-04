import { Events } from "discord.js"
import CustomClient from "../classes/CustomClient"

module.exports = {
    name: Events.ClientReady,
    once: true,
    /**
     * This is the event handler for the 'ready' event. It is triggered when the Discord client is fully ready and logged in.
     * 
     * @param {CustomClient} client - The custom Discord client instance.
     */
    async execute(client: CustomClient) {
        // Log that the client has loaded
        client.logInfo("Client loaded.");

        // Log that the client is starting to fetch all members
        client.logInfo("Starting to fetch all members.");

        // Iterate over each guild that the client is in and fetch all members of each guild
        client.guilds.cache.forEach(async (guild) => {
            await guild.members.fetch();
        });

        // Log that the client has successfully fetched all members
        client.logInfo("Successfully fetched all members.");

        // After a delay of 10 seconds, update the bot's activity to display the number of users it is answering questions for
        setTimeout(() => {
            // Filter the users that are not bots
            const nonBotUsers = client.users.cache.filter((user) => !user.bot);
            // Convert the number of non-bot users to a localized string
            const userCountString = nonBotUsers.size.toLocaleString("en-us");
            // Set the bot's activity to display the number of users it is answering questions for
            client.user?.setActivity(`Answering ${userCountString} users' questions...`, { type: 4 });
        }, 10000);
    }
}