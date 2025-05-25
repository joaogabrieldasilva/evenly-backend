import fs from "fs";

export async function aiAgent(prompt: string) {
  const guidelines = fs.readFileSync("src/ai/guidelines.md", "utf-8");

  const response = await fetch(process.env.AI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL,
      stream: false,
      prompt: `
        ${guidelines}

        com base nessas diretrizes, responda a questão abaixo:

        ${prompt}
     `,
    }),
  });

  return (await response.json())?.response;

  //   const reader = response.body.getReader();
  //   const decoder = new TextDecoder("utf-8");
  //   let text = "";

  //   while (true) {
  //     const { value, done } = await reader.read();
  //     if (done) break;
  //     const chunk = decoder.decode(value, { stream: true });

  //     const lines = chunk.split("\n").filter((line) => line.trim() !== "");
  //     for (const line of lines) {
  //       const json = JSON.parse(line);
  //       if (json.response) {
  //         text += json.response;
  //       }
  //     }
  //   }

  //   console.log("Final response:", text);

  //   return text;
}
