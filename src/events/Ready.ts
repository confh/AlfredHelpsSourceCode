import { Events } from "discord.js"
import CustomClient from "../classes/CustomClient"

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client: CustomClient) {
        client.logInfo("Client loaded.")
        client.logInfo("Starting to fetch all members.")
        await client.guilds.cache.forEach(async guild => {
            await guild.members.fetch()
        })
        client.logInfo("Successfully fetched all members.")
        setTimeout(() => {
            client.user?.setActivity(`Answering ${client.users.cache.filter(a => a.bot == false).size} users' questions...`, { type: 4 })
        }, 10000);
    }
}