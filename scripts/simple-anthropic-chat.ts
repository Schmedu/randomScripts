// Name: Simple Anthropic Chat
// Description: A simple chat interface using the Anthropic API
// Tags: chat, anthropic, ai
// Author: Eduard Uffelmann
// Twitter: @schmedu_
// Linkedin: https://www.linkedin.com/in/euffelmann/
// Website: https://schmedu.com

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
    apiKey: await env("ANTHROPIC_API_KEY", {
        hint: md(
            "Get your API key from https://console.anthropic.com/settings/keys"
        ),
    }),
});

let messages = [];
await chat({
    preview: "",
    ignoreBlur: true,
    onSubmit: async (input) => {
        if (input === "") {
            return;
        }

        try {
            let newMessage = {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: input,
                    },
                ],
            };

            chat.addMessage("");
            let messageContent = "";
            // const response = await anthropic.messages
            await anthropic.messages
                .stream({
                    model: "claude-3-opus-20240229",
                    max_tokens: 1000,
                    temperature: 1,
                    messages: messages.concat([newMessage]),
                })
                .on("text", (text) => {
                    messageContent += text;
                    chat.setMessage(-1, md(messageContent));
                });
            messages = messages.concat([
                newMessage,
                {
                    role: "assistant",
                    content: messageContent,
                },
            ]);
        } catch (e) {
            console.log(e);
            chat.addMessage("");
            chat.setMessage(-1, md("Error: " + e.message));
        }
    },
    shortcuts: [
        {
            name: "Copy",
            key: `cmd+shift+c`,
            bar: "right",
            onPress: async () => {
                await copy(messages[messages.length - 1].content);
            },
        },
    ],
});
