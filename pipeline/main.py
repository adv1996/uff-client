import requests
import json

SLEEPER_PLAYERS_URL = "https://api.sleeper.app/v1/players/nfl"

def saveFile(data, filename):
  with open(filename, "w") as outFile:
      json.dump(data, outFile)

def readFile(filename):
  with open(filename, "r") as outFile:
    return json.load(outFile)

def fetchPlayersData():
  response = requests.get(SLEEPER_PLAYERS_URL)
  data = response.json()
  # saveFile(data, "rawPlayers.json")
  return data

def retrievePlayerData(player):
  return {
    'firstName': player['first_name'],
    'lastName': player['last_name'],
    'positions': player['fantasy_positions'],
    'team': player['team'],
    'id': player['player_id']
  }

def main():
  data = fetchPlayersData() # USE IN PRODUCTION
  # data = readFile("rawPlayers.json")  # USE FOR LOCAL TESTING
  playerIds = list(data.keys())
  players = list(map(lambda n: retrievePlayerData(data[n]), playerIds))
  saveFile(players, 'players.json')
    
if __name__ == "__main__":
    main()