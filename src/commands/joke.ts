import { SlashCommandBuilder } from "discord.js"
import Command from "../classes/Command"
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

module.exports = new Command({
    data: new SlashCommandBuilder()
        .setName("joke")
        .setDescription("Tells you a joke") as SlashCommandBuilder,
    async execute(interaction, client) {
        const prompt = "tell me a joke"
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
            await interaction.editReply(`${text}`).catch(() => { })
        } catch (e: any) {
            await interaction.editReply(`${e.message}`).catch(() => { })
        }
    }
})