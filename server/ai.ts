import { OpenAI } from "openai";
import redis from "./redis";
import Room from "./room";

class AI {
  openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_VCHAT_API_KEY,
    });
  }

  async respond(roomId: number, messageId: number, chatHistory: any) {
    // Set a redis key to expire in 1 minute with the message ID
    // as the value. We'll use this to debounce AI responses to the
    // same message.
    redis.setex(
      `debounce-${roomId}`,
      60,
      messageId.toString(),
    );

    setTimeout(() => this.maybeRespond(roomId, messageId, chatHistory), 1000);
  }

  async maybeRespond(roomId: number, messageId: number, chatHistory: any) {
    redis.get(`debounce-${roomId}`, async (err, reply) => {
      if (err) {
        console.error(err);
        return;
      }
      if (parseInt(reply || '') === messageId) {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: chatHistory.map((message) => ({
            role: 'user',
            content: message.text,
          })),
        });
        const room = new Room(roomId);
        room.sendMessage(1, response.choices[0].message.content || 'No response from AI');
      }
    });
  }
}

export default new AI();

