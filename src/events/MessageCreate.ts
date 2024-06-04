import { Events, Message, TextChannel } from 'discord.js'
import CustomClient from "../classes/CustomClient"
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

/**
 * Splits a message into multiple chunks based on a maximum chunk length.
 * 
 * @param message - The message to split.
 * @param maxChunkLength - The maximum length of each chunk.
 * @returns An array of strings, each representing a chunk of the message.
 */
function splitMessage(message: string, maxChunkLength: number): string[] {
    const chunks: string[] = []; // Array to store the chunks
    let currentChunk: string = ""; // Current chunk being built

    // Iterate over each word in the message
    for (const word of message.split(" ")) {
        // If adding the word would exceed the maximum chunk length, start a new chunk
        if (currentChunk.length + word.length > maxChunkLength) {
            chunks.push(currentChunk);
            currentChunk = "";
        }

        // Add the word to the current chunk
        currentChunk += word + " ";
    }

    // If there is a remaining chunk, add it to the array
    if (currentChunk) {
        chunks.push(currentChunk);
    }

    return chunks;
}

const maintenance = false

/**
 * Increases the usage count for the client and the specified user.
 * If the user does not exist in the usersUsage array, it is added with a usage count of 1.
 *
 * @param client - The custom client instance.
 * @param user - The user whose usage count should be increased.
 */
function increaseUsage(client: CustomClient, user: string) {
    // Increase the overall usage count
    client.usage++;

    // Find the user in the usersUsage array
    const userUsage = client.usersUsage.find((e) => e.user === user);

    // If the user exists, increase their usage count
    if (userUsage) {
        userUsage.usage++;
    }
    // If the user does not exist, add them to the array with a usage count of 1
    else {
        client.usersUsage.push({ user, usage: 1 });
    }
}

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message: Message, client: CustomClient) {
        if (message.author.bot) return;

        // Check if the message channel is in the list of chatrooms
        const chatroom = client.chatrooms.find((e) => e.ID === message.channel.id);
        if (chatroom) {
            // Trim the message content
            const msg = message.content.trim();
            // Check if the message author is the owner of the chatroom and the message content is "endchat"
            if ((message.author.id === chatroom.Owner) || (message.author.id === message.guild?.ownerId) && msg === "endchat") {
                // Try to delete the channel
                try {
                    message.channel.delete();
                } catch {
                    // If the channel cannot be deleted, reply with a message
                    message.reply("I can't delete this channel, probably because I don't have manage channels permission.");
                }
                return;
            }
            // Check if the message author is the owner of the chatroom
            if (message.author.id === chatroom.Owner) {
                // Send typing indicator
                message.channel.sendTyping();
                // Create a new GoogleGenerativeAI instance
                const genAI = new GoogleGenerativeAI(client.config.apikey);
                // Define safety settings
                const settings = [
                    {
                        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    }
                ];
                // Create a new generative model
                const model = genAI.getGenerativeModel({ model: "gemini-pro", safetySettings: settings });
                // Start a new chat with the model
                const chat = model.startChat({
                    history: chatroom.history,
                    safetySettings: settings
                });
                try {
                    // Send the message to the chat and get the response
                    const result = await chat.sendMessage(msg);
                    const response = await result.response;
                    const text = response.text();
                    // If the response is too long, split it into multiple messages
                    if (text.length > 2000) {
                        const text_splitted = splitMessage(text, 2000);
                        for (const part of text_splitted) {
                            await message.reply(part).catch(() => { });
                        }
                    } else {
                        // Reply with the response
                        await message.reply(text).catch(() => { });
                    }
                    // Add the message to the chatroom history
                    client.chatrooms.find((e) => e.ID === message.channel.id)?.history.push({ role: "user", parts: msg });
                    client.chatrooms.find((e) => e.ID === message.channel.id)?.history.push({ role: "model", parts: text });
                    // Increase the usage count for the user
                    increaseUsage(client, message.author.id);
                } catch (e: any) {
                    // If an error occurs, reply with the error message
                    await message.reply(e.message).catch(() => { });
                }
            }
            return;
        }

        // This block of code handles replies to messages sent by the bot
        if (message.reference?.messageId) {
            const reference = await message.channel.messages.fetch(message.reference.messageId)
            // If the referenced message was sent by the bot and the user mentions the bot,
            // it creates a new chat with the bot and sends the user's message as a prompt
            if (reference.author.id === client.user?.id && message.mentions.users.find(e => e.id === client.user?.id)) {
                // Check if the bot is in maintenance mode and the user is not an owner
                if (maintenance && !client.config.owners.includes(message.author.id)) {
                    return message.reply(`Hey ${message.author.displayName}! The bot is currently under maintenance and can only be used by the owner/co-owner.`)
                }
                const prompt = message.content.replace(`<@${client.user?.id}>`, "").trim()
                message.channel.sendTyping()
                const genAI = new GoogleGenerativeAI(client.config.apikey);
                const settings = [
                    {
                        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    }
                ]
                const model = genAI.getGenerativeModel({ model: "gemini-pro", safetySettings: settings });
                const chat = model.startChat({
                    history: [
                        {
                            role: "user",
                            parts: `Call me "${message.author.displayName}" and I will call you "Alfred" from now on`
                        },
                        {
                            role: "model",
                            parts: "ok"
                        },
                        {
                            role: "user",
                            parts: ""
                        },
                        {
                            role: "model",
                            parts: reference.content
                        }
                    ],
                    safetySettings: settings
                })
                try {
                    const result = await chat.sendMessage(prompt)
                    const response = await result.response
                    const text = response.text()
                    if (text.length > 2000) {
                        const text_splitted = splitMessage(text, 2000);
                        for (const part of text_splitted) {
                            await message.reply(part).catch(() => { })
                        }
                    } else {
                        await message.reply(text).catch(() => { })
                    }
                    increaseUsage(client, message.author.id)
                } catch (e: any) {
                    await message.reply(e.message).catch(() => { })
                }
                return
            } else if (reference.author.id === message.author.id && message.mentions.users.find(e => e.id === client.user?.id)) {
                // If the referenced message was sent by the user and the user mentions the bot,
                // it creates a new chat with the bot and sends the user's message as a prompt
                if (maintenance && !client.config.owners.includes(message.author.id)) {
                    return message.reply(`Hey ${message.author.displayName}! The bot is currently under maintenance and can only be used by the owner/co-owner.`)
                }
                const prompt = message.content.replace(`<@${client.user?.id}>`, "").trim()
                message.channel.sendTyping()
                const genAI = new GoogleGenerativeAI(client.config.apikey);
                const settings = [
                    {
                        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    }
                ]
                const model = genAI.getGenerativeModel({ model: "gemini-pro", safetySettings: settings });
                const chat = model.startChat({
                    history: [
                        {
                            role: "user",
                            parts: `Call me "${message.author.displayName}" and I will call you "Alfred" from now on`
                        },
                        {
                            role: "model",
                            parts: "ok"
                        },
                        {
                            role: "user",
                            parts: reference.content
                        },
                        {
                            role: "model",
                            parts: ""
                        }
                    ],
                    safetySettings: settings
                })
                try {
                    const result = await chat.sendMessage(prompt)
                    const response = await result.response
                    const text = response.text()
                    if (text.length > 2000) {
                        const text_splitted = splitMessage(text, 2000);
                        for (const part of text_splitted) {
                            await message.reply(part).catch(() => { })
                        }
                    } else {
                        await message.reply(text).catch(() => { })
                    }
                    increaseUsage(client, message.author.id)
                } catch (e: any) {
                    await message.reply(e.message).catch(() => { })
                }
                return
            }
        }

        // Check if the message is a mention to the bot or the channel is named "alfredbot"
        if (message.mentions.users.find(e => e.id === client.user?.id) || message.guild?.channels.cache.get(message.channel.id)?.name.includes("alfredbot")) {
            // Check if the bot is under maintenance and the user is not the owner/co-owner
            if (maintenance && !client.config.owners.includes(message.author.id)) {
                return message.reply(`Hey ${message.author.displayName}! The bot is currently under maintenance and can only be used by the owner/co-owner.`)
            }
            // Remove the mention to the bot and trim the message content
            const prompt = message.content.replace(`<@${client.user?.id}>`, "").trim()
            // Check if the message is a request to restart the bot and the user is the owner
            if (prompt.toLowerCase() === "make restart" && message.author.id === client.config.owners[0]) {
                // Set the restarting state to true and delete all chatroom channels
                client.restarting = true
                await client.chatrooms.forEach(e => {
                    try {
                        (client.channels.cache.get(e.ID) as TextChannel)?.send(`<@${e.Owner}> this chatroom will be deleted in **3 seconds** because the bot will restart soon.`)
                        setTimeout(() => {
                            client.channels.cache.get(e.ID)?.delete().catch(() => { })
                        }, 3000);
                    }
                    catch {

                    }
                })
                return message.reply("Set state to restarting and deleted all chatroom channels.")
            }
            // Check if the prompt is not empty
            if (prompt != "") {
                // Send a typing indicator
                message.channel.sendTyping()
                // Create a new GoogleGenerativeAI instance
                const genAI = new GoogleGenerativeAI(client.config.apikey);
                // Define safety settings
                const settings = [
                    {
                        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    }
                ]
                // Create a new generative model
                const model = genAI.getGenerativeModel({ model: "gemini-pro", safetySettings: settings });
                // Start a new chat with the model
                const chat = model.startChat({
                    history: [
                        {
                            role: "user",
                            parts: `Call me "${message.author.displayName}" and I will call you "Alfred" from now on`
                        },
                        {
                            role: "model",
                            parts: `Ok I will call you ${message.author.displayName} and you call me "Alfred"`
                        }
                    ],
                    safetySettings: settings
                })
                try {
                    // Send the prompt to the model and get the response
                    const result = await chat.sendMessage(prompt);
                    const response = await result.response;
                    const text = response.text();
                    // Check if the response is over 2000 characters and split it into multiple messages
                    if (text.length > 2000) {
                        const text_splitted = splitMessage(text, 2000);
                        for (const part of text_splitted) {
                            await message.reply(part).catch(() => { })
                        }
                    } else {
                        // Send the response as a message
                        await message.reply(text).catch(() => { })
                    }
                    // Increase the usage count for the user
                    increaseUsage(client, message.author.id)
                } catch (e: any) {
                    // Send an error message if an error occurs
                    await message.reply(e.message).catch(() => { })
                }
            }
        }
    }
}