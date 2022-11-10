import requests
import os
import argparse
from utils import saveToJson

parser = argparse.ArgumentParser()
parser.add_argument('leagueId')  
parser.add_argument('startWeek')
parser.add_argument('endWeek')

BASE_URL = "https://api.sleeper.app/v1"

def getSettings(leagueId):
    response = requests.get(f'{BASE_URL}/league/{leagueId}')
    data = response.json()
    return data

def getRosters(leagueId):
    response = requests.get(f'{BASE_URL}/league/{leagueId}/rosters')
    data = response.json()
    return data

def getUsers(leagueId):
    response = requests.get(f'{BASE_URL}/league/{leagueId}/users')
    data = response.json()
    return data

def getMatchup(leagueId, week):
    response = requests.get(f'{BASE_URL}/league/{leagueId}/matchups/{week}')
    data = response.json()
    return data

def createLeagueDataSheet(leagueId, startWeek, endWeek):
    settings = getSettings(leagueId)
    users = getUsers(leagueId)
    rosters = getRosters(leagueId)
    # be able to support saving to different platforms
    
    leagueData = {
        'settings': settings,
        'users': users,
        'rosters': rosters
    }
    
    for week in range(startWeek, endWeek):
        matchup = getMatchup(leagueId, week)
        leagueData[f'matchup_{week}'] = matchup
    
    saveToJson(f'./leagues/sleeper/{leagueId}.json', leagueData)

def main():
  args = parser.parse_args()
  # TODO add some validation here
  if args.leagueId and args.startWeek and args.endWeek:
    createLeagueDataSheet(args.leagueId, int(args.startWeek), int(args.endWeek))

if __name__ == "__main__":
    main()
