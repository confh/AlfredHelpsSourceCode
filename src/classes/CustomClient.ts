
import { Client, ColorResolvable, GatewayIntentBits, REST, Routes } from 'discord.js'
import express from "express";
import Command from './Command';
import fs from 'node:fs';
import path from 'node:path';
const app = express()

interface historyData {
    role: "user" | "model",
    parts: string
}

interface chatRoom {
    ID: string,
    Owner: string,
    history: historyData[]
}

interface timeoutInterface {
    channelID: string,
    timeout: NodeJS.Timeout
}

interface userUsage {
    user: string,
    usage: number
}

export default class CustomClient extends Client {
    [x: string]: any;
    rest_commands: any[] = [];
    commands: Command[] = [];
    logInfo = (info: string = "Unknown info") => { };
    logError = (error: string = "Unknown error", advanced?: { enabled: boolean, id: string }) => { };
    config: {
        owners: string[],
        token: string,
        clientid: string,
        apikey: string
    };
    config2: {
        colors: {
            success: ColorResolvable,
            error: ColorResolvable,
            normal: ColorResolvable
        }
    }
    public chatrooms: chatRoom[]
    public restarting = false
    public timeouts: timeoutInterface[]
    public usage = 0
    public usersUsage: userUsage[] = []
    client: any;

    constructor() {
        super({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions]
        });
        this.chatrooms = []
    }

    /**
     * Deploys the bot's commands to the Discord API.
     * @param {string} token - The bot's token.
     */
    async deployCommands(token: string) {
        // Clear the usage counter every 24 hours
        setInterval(() => {
            this.usage = 0;
        }, 24 * 60 * 60 * 1000);

        const commandsPath = path.join(__dirname, "..", "commands"); // Get the path to the commands folder
        const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.ts')); // Get the list of command files

        const rest = new REST().setToken(token); // Create a new REST instance with the bot token
        const commandData = commandFiles.map((file: string) => {
            const filePath = path.join(commandsPath, file); // Get the full path of the command file
            const command = require(filePath) as Command; // Load the command module

            if ('data' in command && 'execute' in command) { // Check if the command has the required properties
                return command.data.toJSON(); // Add the command data to the list of rest commands
            } else {
                this.logInfo(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`); // Log a warning if the command is missing required properties
            }
        });

        try {
            this.logInfo(`Started refreshing ${commandData.length} application (/) commands.`); // Log the start of the command refresh

            const data = await rest.put(
                Routes.applicationCommands(this.config.clientid), // Get the route to update the application commands
                { body: commandData }, // Set the body of the request to the list of rest commands
            ) as any;

            this.logInfo(`Successfully reloaded ${data.length} application (/) commands.`.toString()); // Log the success of the command refresh
        } catch (error) {
            this.logError(error as string); // Log any errors that occur during the command refresh
        }
    }

    /**
     * Deploys the web page and starts the server.
     *
     * @returns {Promise<void>} A promise that resolves when the server is started.
     */
    async deployWebPage() {
        // Define the route for the web page
        app.get("/", (req: any, res: any) => {
            // Send a response with the username of the bot
            res.send(`${this.user?.username} is online`);
        });

        // Log the successful loading of the webpage
        this.logInfo("Successfully loaded webpage");

        // Start the server on the specified port or 3000 if not specified
        app.listen(process.env.PORT || 3000);
    }
}