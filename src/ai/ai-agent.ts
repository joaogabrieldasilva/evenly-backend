import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { ChatOllama } from "@langchain/ollama";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { DynamicStructuredTool } from "langchain/tools";
import { z } from "zod";
import { TransactionType } from "../enums/transaction-types";
import { TransactionService } from "../services/transaction-service";
import { TransactionEntryType } from "../enums/transaction-entry-types";

const searchTransactionsTool = new DynamicStructuredTool({
  name: "search_expenses",
  description: "use this to when user asks about their expenses",
  schema: z.object({
    userId: z.string(),
  }),
  func: async ({ userId }) => {
    const transactions = await TransactionService.getAllTransactions(
      Number(userId)
    );

    const totalPorCategoria: Record<string, number> = {};

    transactions.forEach(({ category, amount }) => {
      if (!totalPorCategoria[category]) {
        totalPorCategoria[category] = 0;
      }
      totalPorCategoria[category] += amount;
    });

    const resumo = {
      total_transacoes: transactions.length,
      total_por_categoria: totalPorCategoria,
    };

    console.log({
      resumo,
      transactions,
    });

    return JSON.stringify({
      resumo,
      transactions,
    });
  },
});

const model = new ChatOllama({
  model: process.env.AI_MODEL,
  baseUrl: process.env.AI_ENDPOINT,
  temperature: 0,
});

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "Você é um assistente útil chamado Ollie que pode consultar transações",
  ],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),
]);

const agent = createToolCallingAgent({
  llm: model,
  tools: [searchTransactionsTool],
  prompt,
});

const executor = new AgentExecutor({
  agent,
  tools: [searchTransactionsTool],
});

export async function aiAgent(userId: number, prompt: string) {
  console.log(userId);
  const response = await executor.invoke({
    input: `
    context: 
      userId: ${userId}

    ${prompt}
    `,
    userId: String(userId),
    agent_scratchpad: "",
    chat_history: [],
  });

  return response.output;
}
