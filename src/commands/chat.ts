import { SlashCommandBuilder } from "discord.js"
import Command from "../classes/Command"
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

module.exports = new Command({
    data: new SlashCommandBuilder()
        .setName("chat")
        .setDescription("Chat with google gemini")
        .addStringOption(e => e
            .setRequired(true)
            .setName("question")
            .setDescription("Question to ask google gemini")) as SlashCommandBuilder,
    async execute(interaction, client) {
        if (maintenance && !client.config.owners.includes(interaction.user.id)) {
            return interaction.reply(`Hey ${interaction.user.username}! The bot is currently under maintenance and can only be used by the owner/co-owner.`)
        }
        const prompt = interaction.options.getString("question").trim()
        if (prompt != "") {
            await interaction.deferReply()
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
            try {
                const result = await model.generateContent(prompt);
                const response = result.response;
                const text = response.text();
                if (text.length > 2000) {
                    const text_splitted = splitMessage(text, 2000);
                    let counter = 0
                    for (const part of text_splitted) {
                        if (counter === 0) {
                            await interaction.editReply(`${part}`).catch(() => { })
                        } else if (counter === text_splitted.length - 1) {
                            await interaction.channel.send(`${part}${2000 - part.length >= 60 ? "\n\n**PROTIP: You can ping the bot instead of using /chat!**" : ""}`)
                        }
                        else {
                            await interaction.channel.send(`${part}`).catch(() => { });
                        }
                        counter++
                    }
                } else {
                    await interaction.editReply(`${text}\n\n**PROTIP: You can ping the bot instead of using /chat!**`).catch(() => { })
                }
            } catch (e: any) {
                await interaction.editReply(`${e.message}\n\n**PROTIP: You can ping the bot instead of using /chat!**`).catch(() => { })
            }
        }
    }
})