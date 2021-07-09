# ML Models in Lambda Functions

This project shows two ways of deploying ML models (or any other code) to Lambda:

    1. Lambda using default packaging
    2. Lambda using containerized packaging

## Usage Requirements

This project uses AWS CDK to deploy the samples. To be able to deploy both stacks you'll need the following installed:

    - CDK 1.110.0 or later
    - Docker installed and running
    - AWS credentials configured

## Setup

1. Clone the Repo and install the requirements using npm

```bash
$ git clone <>
$ cd xgboost_sample
$ npm i
```

1. Deploy the Lambda Stack with Default Packaging

```bash
$ cdk deploy XgboostSampleStack
```

Once complete, you should see a new `XgboostSampleStack` stack in the [CloudFormation console](https://console.aws.amazon.com/cloudformation/home#/stacks?filteringStatus=active&filteringText=&viewNested=true&hideStacks=false). The output should also indicate a URL for the API Gateway endpoint.

1. Test the API

```bash
$ curl https://atshkxtq3j.execute-api.eu-west-1.amazonaws.com/prod/
{"status": "success"}
```

1. Deploy the Lambda Stack with Docker Packaging

> Ensure that docker is running on your local machine. You should be able to successfully do `docker ps` (without root).

```bash
$ cdk deploy XgboostSampleContainerStack
```

1. Test the API with Docker Packaging

```bash
$ curl https://pdtn128phk.execute-api.eu-west-1.amazonaws.com/prod/
{"status": "success"}
```
