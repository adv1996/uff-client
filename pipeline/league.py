import requests
import os
import argparse
from utils import saveToJson

parser = argparse.ArgumentParser()
parser.add_argument('leagueId')  
parser.add_argument('startWeek')
parser.add_argument('endWeek')

SLEEPER_BASE_URL = "https://api.sleeper.app/v1"

def getSettings(leagueId):
    response = requests.get(f'{SLEEPER_BASE_URL}/league/{leagueId}')
    data = response.json()
    return data

def getRosters(leagueId):
    response = requests.get(f'{SLEEPER_BASE_URL}/league/{leagueId}/rosters')
    data = response.json()
    return data

def getUsers(leagueId):
    response = requests.get(f'{SLEEPER_BASE_URL}/league/{leagueId}/users')
    data = response.json()
    return data

def getMatchup(leagueId, week):
    response = requests.get(f'{SLEEPER_BASE_URL}/league/{leagueId}/matchups/{week}')
    data = response.json()
    return data

def getTransaction(leagueId, week):
    response = requests.get(f'{SLEEPER_BASE_URL}/league/{leagueId}/transactions/{week}')
    data = response.json()
    return data

def getDraft(draftId):
    response = requests.get(f'{SLEEPER_BASE_URL}/draft/{draftId}/picks')
    data = response.json()
    return data

def createLeagueDataSheet(leagueId, startWeek, endWeek):
    settings = getSettings(leagueId)
    users = getUsers(leagueId)
    rosters = getRosters(leagueId)
    draft = getDraft(settings['draft_id'])
    # be able to support saving to different platforms
    
    settings['draft_id'] = leagueId
    leagueData = {
        'settings': settings,
        'users': users,
        'rosters': rosters,
        'draft': draft
    }
    
    for week in range(startWeek, endWeek):
        matchup = getMatchup(leagueId, week)
        transaction = getTransaction(leagueId, week)
        leagueData[f'matchup_{week}'] = matchup
        leagueData[f'transactions_{week}'] = transaction
    
    saveToJson(f'./leagues/sleeper/{leagueId}.json', leagueData)

def main():
  args = parser.parse_args()
  # TODO add some validation here
  if args.leagueId and args.startWeek and args.endWeek:
    createLeagueDataSheet(args.leagueId, int(args.startWeek), int(args.endWeek))

if __name__ == "__main__":
    main()
