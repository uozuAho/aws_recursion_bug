import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { SQSEvent } from "aws-lambda";
import { Logger } from '@aws-lambda-powertools/logger';


if (!process.env.SQS_OUTPUT_QUEUE_URL) {
    throw new Error('SQS_OUTPUT_QUEUE_URL is required');
}

const logger = new Logger({ serviceName: `looper` });
const queueUrl = process.env.SQS_OUTPUT_QUEUE_URL;

interface Message {
  message: number;
  counter: number | undefined;
}

function sendMessage(message: any, queueUrl: string) {
  const client = new SQSClient();
  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(message),
  });
  return client.send(command);
}

export async function handleSqsEvent(event: SQSEvent) {
  logger.info(`event: with ${event.Records.length} records`, {event});
  for (const record of event.Records) {
    const message = JSON.parse(record.body) as Message;
    logger.info(`message`, {message});
    if (!message.counter) {
      message.counter = 1;
    } else {
      message.counter += 1;
    }
    await sendMessage(message, queueUrl);
    logger.info('done');
  }
}
