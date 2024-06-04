import { SlashCommandBuilder } from "discord.js";
import CustomClient from "./CustomClient";

/**
 * Command class
 * 
 * This class is used to define command properties and methods.
 * It is used to create a command object which can be added to the bot's command list.
 */
export default class Command {
    // The data property contains the command's slash command builder
    public data: SlashCommandBuilder;
    // The execute property is a function that is called when the command is executed
    public execute: (interaction: any, client: CustomClient) => any;
    // The ownerOnly property is an optional boolean that determines if the command can only be used by bot owners
    public ownerOnly?: boolean

    /**
     * Constructor for the Command class
     * 
     * @param {Command} options - An object containing properties for the command
     */
    constructor(options: Command) {
        // Object.assign is used to assign the properties of the options object to the properties of the current object
        Object.assign(this, options)
    }
}
