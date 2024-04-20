import { CloudFormationClient, DescribeStacksCommand } from "@aws-sdk/client-cloudformation";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const message = process.argv[2];

if (!message) {
    throw new Error("Usage: npx ts-node send_message.js <message>");
}

async function main() {
  const queueUrl = await getQueueUrl();
  const sqsClient = new SQSClient();
  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify({
        message: message,
    }),
  });
  await sqsClient.send(command);
  console.log("Done");
}

async function getQueueUrl() {
    const cfnClient = new CloudFormationClient();
    const stacks = await cfnClient.send(new DescribeStacksCommand({StackName: "LambdaRecursionBugDemoStack"}));
    const queueOutput = stacks.Stacks?.[0].Outputs?.find(output => output.OutputKey === "QueueUrl");
    if (!queueOutput) {
        throw new Error("QueueUrl not found");
    }
    return queueOutput.OutputValue;
}

main()
  .then(() => {})
  .catch((error) => {
    console.error(error);
  });
