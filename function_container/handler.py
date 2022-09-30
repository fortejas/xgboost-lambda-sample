"""
    Sample lambda function doing predictions based on XGBoost Model

"""
import os
import json
import tarfile
import pickle as pkl

import boto3
import xgboost as xgb
import numpy as np


XGB_MODEL_BUCKET = os.environ.get('XGB_MODEL_BUCKET')
XGB_MODEL_KEY = os.environ.get('XGB_MODEL_KEY')


def load_model():
    """Loads the Pickle Model from a .tgz file"""
    # Create a tempfile location
    model_file = '/tmp/models/model.tar.gz'
    os.mkdir(os.path.dirname(model_file))

    # Download Model from S3
    s3 = boto3.client('s3')
    s3.download_file(XGB_MODEL_BUCKET, XGB_MODEL_KEY, model_file)

    with tarfile.open(model_file) as tf:
        def is_within_directory(directory, target):
            
            abs_directory = os.path.abspath(directory)
            abs_target = os.path.abspath(target)
        
            prefix = os.path.commonprefix([abs_directory, abs_target])
            
            return prefix == abs_directory
        
        def safe_extract(tar, path=".", members=None, *, numeric_owner=False):
        
            for member in tar.getmembers():
                member_path = os.path.join(path, member.name)
                if not is_within_directory(path, member_path):
                    raise Exception("Attempted Path Traversal in Tar File")
        
            tar.extractall(path, members, numeric_owner) 
            
        
        safe_extract(tf, os.path.dirname(model_file))

    return pkl.load(open(os.path.join(os.path.dirname(model_file), 'xgboost-model'), 'rb'))


# Assign the model in the global scope
model = load_model()


def parse_input(line):
    features = line.strip().split()[1:]
    data = [float(x.split(':')[1]) for x in features]
    return xgb.DMatrix(np.array([data]))


def handle(event, context):
    print(json.dumps(event))
    line = event['body']
    result = model.predict(parse_input(line))
    return {
        'body': json.dumps({'status': 'success', 'xgboost_result': float(result[0])}),
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json'
        }
    }
