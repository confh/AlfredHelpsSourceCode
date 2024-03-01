import { TextChannel, Events } from "discord.js"
import CustomClient from "../classes/CustomClient"

function exportData(client: CustomClient) {
    const channel = client.channels.cache.get("1209970684755710073") as TextChannel
    const mapped = client.usersUsage.sort((a, b) => {
        return b.usage - a.usage
    }).map(e => `${client.users.cache.get(e.user)?.displayName} used the bot ${e.usage} time(s) which is ${Math.round(e.usage / client.usage * 100)}% of total bot usage.`)
    channel.send(`${mapped.length ? `${mapped.join('\n')}` : "No usage today"}`)
}

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
        const date = new Date()
        const newDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0).getTime()
        let time = newDate - date.getTime()
        if (time < 0) time += 8.64e+7
        time -= 7.2e+6
        if (time > 0) {
            setTimeout(() => {
                exportData(client)
                setInterval(() => { exportData(client) }, 8.64e+7)
            }, time);
        }
        client.user?.setActivity(`Answering ${client.users.cache.filter(a => a.bot == false).size} users' questions...`, { type: 4 })
    }
}