import { Events, Message, TextChannel } from 'discord.js'
import CustomClient from "../classes/CustomClient"
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

function splitMessage(message: string, maxChunkLength: number) {
    const chunks = [];
    let currentChunk = "";

    for (const word of message.split(" ")) {
        if (currentChunk.length + word.length > maxChunkLength) {
            chunks.push(currentChunk);
            currentChunk = "";
        }
        currentChunk += word + " ";
    }

    if (currentChunk) {
        chunks.push(currentChunk);
    }

    return chunks;
}

const maintenance = false

function increaseUsage(client: CustomClient, user: string) {
    client.usage++
    if (client.usersUsage.find(e => e.user === user)) {
        (client.usersUsage.find(e => e.user === user))!!.usage++
    } else {
        client.usersUsage.push({ user, usage: 1 })
    }
}

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message: Message, client: CustomClient) {
        if (message.author.bot || message.channel.id === "1143423513429028867") return;

        const chatroom = client.chatrooms.find((e, i) => {
            if (e.ID === message.channel.id) {
                return e
            }
        })
        if (chatroom) {
            const msg = message.content.trim()
            if (((message.author.id === chatroom.Owner) || (message.author.id === message.guild?.ownerId)) && msg === "endchat") {
                try {
                    message.channel.delete()
                } catch {
                    message.reply("I can't delete this channel, probably because I don't have manage channels permission.")
                }
                return
            }
            if (message.author.id === chatroom.Owner) {
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
                    history: chatroom.history,
                    safetySettings: settings
                })
                try {
                    const result = await chat.sendMessage(msg)
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
                    client.chatrooms.find(e => e.ID === message.channel.id)?.history.push({ role: "user", parts: msg })
                    client.chatrooms.find(e => e.ID === message.channel.id)?.history.push({ role: "model", parts: text })
                    increaseUsage(client, message.author.id)
                } catch (e: any) {
                    await message.reply(e.message).catch(() => { })
                }
            }
            return
        }

        if (message.reference?.messageId) {
            const reference = await message.channel.messages.fetch(message.reference.messageId)
            if (reference.author.id === client.user?.id && message.mentions.users.find(e => e.id === client.user?.id)) {
                if (maintenance && !client.config.owners.includes(message.author.id)) {
                    return message.reply(`Hey ${message.author.displayName}! The bot is currently under maintenance and can only be used by the owner/co-owner.`)
                }
                if (message.author.id === "767741466424246273") {
                    return message.reply("Nigga you're banned from this bot.")
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
                if (maintenance && !client.config.owners.includes(message.author.id)) {
                    return message.reply(`Hey ${message.author.displayName}! The bot is currently under maintenance and can only be used by the owner/co-owner.`)
                }
                if (message.author.id === "767741466424246273") {
                    return message.reply("Nigga you're banned from this bot.")
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

        if (message.mentions.users.find(e => e.id === client.user?.id) || message.guild?.channels.cache.get(message.channel.id)?.name.includes("alfredbot")) {
            if (maintenance && !client.config.owners.includes(message.author.id)) {
                return message.reply(`Hey ${message.author.displayName}! The bot is currently under maintenance and can only be used by the owner/co-owner.`)
            }
            if (message.author.id === "767741466424246273") {
                return message.reply("Nigga you're banned from this bot.")
            }
            const prompt = message.content.replace(`<@${client.user?.id}>`, "").trim()
            if (prompt.toLowerCase() === "make restart" && message.author.id === client.config.owners[0]) {
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
            if (prompt != "") {
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
                            parts: `Ok I will call you ${message.author.displayName} and you call me "Alfred"`
                        }
                    ],
                    safetySettings: settings
                })
                try {
                    const result = await chat.sendMessage(prompt);
                    const response = await result.response;
                    const text = response.text();
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
            }
        }
    }
}