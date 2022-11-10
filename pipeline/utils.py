import json

def saveToJson(filename, data):
    with open(filename, 'w') as saveFile:
        json.dump(data, saveFile)

def loadDataFromFile(filename):
    with open(filename, 'r') as readFile:
        return json.load(readFile)