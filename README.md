# AWS Lambda recursion detection bug demo

A reproduction of what I think is a bug in AWS lambda's recursive invocation
detection: The X-Ray trace header lineage counters of any message in an SQS
batch take on the maximum value of any message in the batch, reducing the number
of times some messages can loop though a system.

The system:
- sqs queue
- lambda that
    - receives from the queue
    - increments a counter in each record
    - sends each record back to the queue


# Deploy & run

Requires
- nodejs
- docker (if you're on windows)

```sh
npm i -g aws-cdk
npm i
cdk deploy
npx ts-node send_message.ts hello
```

Go to the AWS console, find the lambda `LambdaRecursionBugDemoStack-Lambda...`,
and look at its logs. You should the same message appearing, and its counter
value incrementing. Now send another message:

```sh
npx ts-node send_message.ts hello_again
```

Wait until you see a log message `event: with 2 records`. You should see the
hello and hello_again messages in the SQS records. Note the value of the
`AWSTraceHeader`, specifically the `Lineage=<hash>:count` part at the end. The
'hello' message should have a higher lineage count as it has been looping for
longer. Now find the next time the 'hello_again' message is received from SQS.
You'll see that its lineage value has taken on the same value as the 'hello'
message.