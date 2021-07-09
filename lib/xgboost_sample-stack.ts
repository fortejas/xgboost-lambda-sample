import { LambdaRestApi, RestApi } from '@aws-cdk/aws-apigateway';
import { Code, DockerImageCode, DockerImageFunction, Function, Runtime } from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import { CfnOutput } from '@aws-cdk/core';
import * as path from 'path'

export class XgboostSampleStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ======================================================
    //      Normal Lambda Function
    // ======================================================

    // Provision a lambda function from the function_lambda directory
    const func1 = new Function(this, 'Lambda', {
      code: Code.fromAsset(path.join(__dirname, '../function_lambda')),
      handler: 'handler.handle',
      runtime: Runtime.PYTHON_3_8
    })

    // Provision an API Gateway in-front of the lambda function.
    const api1 = new LambdaRestApi(this, 'APILambda', {
      handler: func1
    })

    // Output the URL
    new CfnOutput(this, 'APILambdaOutput', {
      value: api1.url,
      description: "API Gateway URL using typical lambda function"
    })

  }
}
