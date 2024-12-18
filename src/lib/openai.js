import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: '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',
    dangerouslyAllowBrowser: true // Untuk client-side usage
})

export const processCommand = async (command) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a smart home assistant. You can control lights, AC, and other devices. Convert natural language commands to structured actions."
                },
                {
                    role: "user",
                    content: command
                }
            ],
            temperature: 0.7,
            max_tokens: 150
        })

        return response.choices[0].message.content
    } catch (error) {
        console.error('OpenAI Error:', error)
        throw error
    }
} 