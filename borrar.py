import requests
import json

API_ENDPOINT = 'https://uinames.com/api/'

data = {
    "sizeLimit": 15
    }

req = requests.get(url=API_ENDPOINT)
res = json.loads(req.text)
username = res['name'] + ' ' + res['surname']
print(username)
