import { WebClient } from '@slack/web-api';

const web = new WebClient(process.env.SLACK_BOT_TOKEN);

export const connect = async () => {
  // In a real application, you would go through the Slack OAuth flow
  console.log("Connecting to Slack...");
};

export const sync = async () => {};

export const test = async () => {
  const response = await web.auth.test();
  if (!response.ok) {
    throw new Error("Slack token is invalid");
  }
};

export const disconnect = async () => {};

export const sendMessage = async (channel: string, text: string) => {
  await web.chat.postMessage({
    channel,
    text,
  });
};