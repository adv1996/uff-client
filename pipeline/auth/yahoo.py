import requests
import base64
import json
from dotenv import load_dotenv
import os

load_dotenv()

CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')

from dotenv import load_dotenv

load_dotenv()

def saveToken(tokenData):
  with open("token.json", "w") as token_file:
    json.dump(tokenData, token_file)

def readToken():
   # Extract the token from the file
  with open("token.json", "r") as token_file:
    tokenData = json.load(token_file)
    return tokenData

def getToken():
  tokenData = readToken()
  # Define the URL
  url = "https://api.login.yahoo.com/oauth2/get_token"

  # Define the data to be sent in the request
  data = {
      "grant_type": "refresh_token",
      "redirect_uri": "oob",
      "refresh_token": tokenData['refresh_token'],
      # "code": "rkxhfpr46sfxy93mm6m3ahfud5x3tg3m"
      # Add any other required parameters
  }

  # Encode the credentials in base64
  credentials = f"{CLIENT_ID}:{CLIENT_SECRET}"
  base64_credentials = base64.b64encode(credentials.encode()).decode()


  # Define the headers
  headers = {
      "Content-Type": "application/x-www-form-urlencoded",  # Example content type, adjust as needed
      "Authorization": f"Basic {base64_credentials}"
      # Add any other headers you require
  }

  # Send the POST request
  response = requests.post(url, data=data, headers=headers)
  tokenData = response.json()
  saveToken(tokenData)

  return tokenData

getToken()