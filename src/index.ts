import CustomClient from "./classes/CustomClient"

import { EmbedBuilder } from 'discord.js'
const logger = require("./logger")
const client = new CustomClient()
const fs = require('node:fs');
const path = require('node:path');

client.config = require("./config.json")
const token = client.config.token;


client.config2 = {
    colors: { success: '#57F287', error: '#ED4245', normal: "#313338" }
}

client.logError = function (error: string = "Unknown error", advanced?: { enabled: boolean, id: string }) {
    logger.error(error)
}
client.logInfo = function (info: string = "Unknown info") {
    logger.info(info)
}

client.login(token)

client.deployCommands(token)
client.deployWebPage()

const pathToEvents = path.join(__dirname, "events")
const files = fs.readdirSync(pathToEvents)

files.forEach((file: string) => {
    const filePath = path.join(pathToEvents, file);
    const event = require(filePath)
    if (event.once) {
        client.once(event.name, async (...args) => event.execute(...args))
    } else {
        client.on(event.name, async (...args) => event.execute(...args, client))
    }
})

