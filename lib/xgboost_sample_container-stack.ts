import { LambdaRestApi } from '@aws-cdk/aws-apigateway';
import { DockerImageCode, DockerImageFunction } from '@aws-cdk/aws-lambda';
import { Bucket } from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import * as path from 'path'

export class XgboostSampleContainerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Fetch context variables from cdk.json
    const s3Bucket = this.node.tryGetContext('xgboost:model:s3Bucket')
    const s3BucketKey = this.node.tryGetContext('xgboost:model:s3Key')

    // Bring in existing S3 bucket
    const s3ModelBucket = Bucket.fromBucketName(this, 'ModelBucket', s3Bucket)

    // Create the function from a container
    const func2 = new DockerImageFunction(this, 'LambdaDocker', {
      code: DockerImageCode.fromImageAsset(path.join(__dirname, '../function_container')),
      environment: {
        XGB_MODEL_BUCKET: s3ModelBucket.bucketName,
        XGB_MODEL_KEY: s3BucketKey
      }
    })

    // Add permission for lambda to fetch the model from S3
    s3ModelBucket.grantRead(func2)

    // Add the function behind API Gateway
    const api2 = new LambdaRestApi(this, 'APILambdaDocker', {
      handler: func2
    })

  }
}
