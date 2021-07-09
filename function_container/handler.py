"""
    Sample lambda function doing predictions based on XGBoost Model

"""
import json


def handle(event, context):
    return {
        'body': json.dumps({'status': 'success'}),
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json'
        }
    }
