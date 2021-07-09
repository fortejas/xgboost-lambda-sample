import { LambdaRestApi } from '@aws-cdk/aws-apigateway';
import { Code, DockerImageCode, DockerImageFunction, Function, Runtime } from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import { CfnOutput } from '@aws-cdk/core';
import * as path from 'path'

export class XgboostSampleContainerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ======================================================
    //      Containerized Lambda Function
    // ======================================================

    // Create the function from a container
    const func2 = new DockerImageFunction(this, 'LambdaDocker', {
      code: DockerImageCode.fromImageAsset(path.join(__dirname, '../function_container'))
    })

    // Add the function behind API Gateway
    const api2 = new LambdaRestApi(this, 'APILambdaDocker', {
      handler: func2
    })

    // Output the URL
    new CfnOutput(this, 'APILambdaContainerOutput', {
      value: api2.url,
      description: "API Gateway URL using containerized lambda function"
    })

  }
}
