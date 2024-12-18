import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI("AIzaSyCSMw-y2NpdAaNyX7eh6DCtWgUOvC9HWJE")

export const processCommand = async (command) => {
    try {
        // First check if it matches any custom command
        const customCommands = await fetch('/api/custom-commands').then(r => r.json())
        const matchedCommand = customCommands.find(cmd => 
            command.toLowerCase().includes(cmd.name.toLowerCase())
        )

        if (matchedCommand) {
            // Execute custom command actions
            return JSON.stringify({
                type: "relay_command",
                actions: matchedCommand.actions.map(a => `RELAY${a.relay}_${a.state}`)
            })
        }

        // If no custom command matched, use Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-pro" })
        
        const prompt = `As a smart home assistant, interpret this command and convert it to a structured action.
                       Command: "${command}"
                       Available commands: RELAY1_ON, RELAY1_OFF, RELAY2_ON, RELAY2_OFF, RELAY3_ON, RELAY3_OFF, RELAY4_ON, RELAY4_OFF
                       
                       For example:
                       - "turn on all lights" should return: {"type": "relay_command", "actions": ["RELAY1_ON", "RELAY2_ON", "RELAY3_ON", "RELAY4_ON"]}
                       - "turn off living room light" should return: {"type": "relay_command", "actions": ["RELAY1_OFF"]}
                       
                       Return response in JSON format with type:'relay_command' and actions array containing the exact command strings.`

        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text()
    } catch (error) {
        console.error('Gemini Error:', error)
        throw error
    }
} 