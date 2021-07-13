# Example - Deploy a Simple ML Model to AWS Lambda for Inference

## Objective

In this tutorial we'll deploy some Python code to an AWS Lambda function using the [Lambda container images feature](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html). The Lambda function will be invoked via Amazon API Gateway. The code will perform inference with an XGBoost model prepared using Amazon SageMaker. We will deploy the architecture using AWS CDK.

## Requirements

This project uses AWS CDK to deploy the samples. To be able to deploy both stacks you'll need the following installed:

    - CDK 1.113.0 or later
    - Docker installed and running locally
    - AWS credentials configured

## Expected Time

You should be able to deploy this in about 15 minutes

# Tutorial

## Deploy the model to S3

Before we can deploy our Lambda function we need to have a ML model deployed to S3. In this tutorial the model being used is arbitrary so we have provided a sample model in the `sample_models` directory.

To upload the model to S3 you'll need to have created a bucket via the console. Then you can use the CLI to upload to
a location in that bucket.

```bash
$ aws s3 cp sample_models/model.tar.gz s3://<your-sample-s3-bucket>/model.tar.gz
```

_Note: This sample uses the s3.download_file operation to pull the model to the Lambda's `/tmp` directory. This has a maximum size of `512MB`. If your model is larger then you'll need to consider using EFS as the storage layer._

### Configure the CDK App

Now that our model is in S3. We need to let our CDK app know about it. The stack we are deploying is defined in `lib/xgboost_sample_container-stack.ts`. You can see that there are some parameters being pulled in from the cdk context.

```ts
    // Fetch context variables from cdk.json
    const s3Bucket = this.node.tryGetContext('xgboost:model:s3Bucket')
    const s3BucketKey = this.node.tryGetContext('xgboost:model:s3Key')
```

We can specify these parameters in the `cdk.json` file. Let's add the S3 bucket and key for our model into the `cdk.json` file.

```json
    "xgboost:model:s3Bucket": "<your-sample-s3-bucket>",
    "xgboost:model:s3Key": "model.tar.gz"
```

Update `<your-sample-s3-bucket>` with the name of your S3 Bucket. If you've provided a different S3 key in the previous stpes then ensure that it matches this file. Save the file when done.

## Deploy the CDK Application

### Install Dependencies

With the model available in S3, we now can install the CDK dependencies.

```bash
$ npm install
```

### Deploy the Stack to AWS

Now that everything is configured we can use the CDK CLI to deploy our Stack.

```bash
$ cdk deploy
```

_Because there are IAM roles and S3 Bucket permissions being created you will be prompted to accept the changes._

Once complete, you should see a new `XgboostSampleContainerStack` stack in the [CloudFormation console](https://console.aws.amazon.com/cloudformation/home#/stacks?filteringStatus=active&filteringText=&viewNested=true&hideStacks=false). The output should also indicate a URL for the API Gateway endpoint.


## Test the Endpoint

The previous output should have yielded a URL:

```bash
Outputs:
XgboostSampleContainerStack.APILambdaDockerEndpoint8599DAA9 = https://4woryik999e.execute-api.eu-west-1.amazonaws.com/prod/
```

### Make a request to the endpoint

We can hit the endpoint with a POST request using curl. This sample is an XGBoost model with 8 features (see [abalone](https://www.csie.ntu.edu.tw/~cjlin/libsvmtools/datasets/regression.html) datasets) and we provide the body as text in libsvm format.

```bash
$ curl \
    -XPOST https://4woryik999e.execute-api.eu-west-1.amazonaws.com/prod/ \
    --data '12 1:1 2:0.735 3:0.555 4:0.22 5:2.333 6:1.2395 7:0.3645 8:0.2195'
{"status": "success", "xgboost_result": 16.645734786987305}
```

### Viewing the Python Code

The Python code is located in the `function_container` directory along with `requirements.txt` & `Dockerfile`. Notice that the CDK has built and deployed the container for you.

You can play around with the code and redeploy using the CDK `deploy` command.

```bash
$ cdk deploy
```

## Clean Up

Because we are using CDK, we can remove the stack using the CLI.

```bash
$ cdk destroy
```

You can manually delete the files and bucket in S3 using the console.
