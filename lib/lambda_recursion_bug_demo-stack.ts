import { Construct } from 'constructs';
import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as eventsources from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';


export class LambdaRecursionBugDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, 'Queue', {
      visibilityTimeout: cdk.Duration.seconds(3),
    });

    new cdk.CfnOutput(this, 'QueueUrl', { value: queue.queueUrl });

    const lambda1 = new NodejsFunction(this, 'Lambda_1', {
      entry: path.join(__dirname, '../lambda/looper.ts'),
      handler: 'handleSqsEvent',
      runtime: lambda.Runtime.NODEJS_20_X,
      reservedConcurrentExecutions: 1,
      environment: {
        SQS_OUTPUT_QUEUE_URL: queue.queueUrl,
      },
      bundling: {
        minify: true,
        externalModules: ['aws-sdk'],
      },
    });

    lambda1.addEventSource(new eventsources.SqsEventSource(queue, {
      batchSize: 2,
      maxBatchingWindow: cdk.Duration.seconds(6),
    }));

    queue.grantSendMessages(lambda1);
  }
}
