import requests
import argparse
from auth.yahoo import getToken
from utils import saveToJson

parser = argparse.ArgumentParser()
parser.add_argument('platform')  
parser.add_argument('season')  
parser.add_argument('leagueId')  
parser.add_argument('startWeek')
parser.add_argument('endWeek')

SLEEPER_BASE_URL = "https://api.sleeper.app/v1"

YAHOO_BASE_URL = "https://fantasysports.yahooapis.com/fantasy/v2";

def getSleeperSettings(leagueId):
    response = requests.get(f'{SLEEPER_BASE_URL}/league/{leagueId}')
    data = response.json()
    return data

def getSleeperRosters(leagueId):
    response = requests.get(f'{SLEEPER_BASE_URL}/league/{leagueId}/rosters')
    data = response.json()
    return data

def getSleeperUsers(leagueId):
    response = requests.get(f'{SLEEPER_BASE_URL}/league/{leagueId}/users')
    data = response.json()
    return data

def getSleeperMatchup(leagueId, week):
    response = requests.get(f'{SLEEPER_BASE_URL}/league/{leagueId}/matchups/{week}')
    data = response.json()
    return data

def getSleeperTransaction(leagueId, week):
    response = requests.get(f'{SLEEPER_BASE_URL}/league/{leagueId}/transactions/{week}')
    data = response.json()
    return data

def getSleeperDraft(draftId):
    response = requests.get(f'{SLEEPER_BASE_URL}/draft/{draftId}/picks')
    data = response.json()
    return data

def createSleeperLeagueDataSheet(leagueId, startWeek, endWeek):
    settings = getSleeperSettings(leagueId)
    users = getSleeperUsers(leagueId)
    rosters = getSleeperRosters(leagueId)
    draft = getSleeperDraft(settings['draft_id'])
    # be able to support saving to different platforms
    
    settings['draft_id'] = leagueId
    leagueData = {
        'settings': settings,
        'users': users,
        'rosters': rosters,
        'draft': draft
    }
    
    for week in range(startWeek, endWeek):
        matchup = getSleeperMatchup(leagueId, week)
        transaction = getSleeperTransaction(leagueId, week)
        leagueData[f'matchup_{week}'] = matchup
        leagueData[f'transactions_{week}'] = transaction
    
    saveToJson(f'./leagues/sleeper/{leagueId}.json', leagueData)

seasonMap = {
    '2023': '423'
}

def getGameCode(season):
   if seasonMap.get(season) is not None:
      return seasonMap.get(season)
   raise Exception("Unsupported Season")

def getYahooSettings(tokenData, gameCode, leagueId):
    accessToken = tokenData['access_token']
    headers = {
      'Authorization': f'Bearer {accessToken}',
    }
    url = f"https://fantasysports.yahooapis.com/fantasy/v2/league/{gameCode}.l.{leagueId}/settings?format=json"
    response = requests.get(url, headers=headers)
    data = response.json()
    return data

def getYahooStandings(tokenData, gameCode, leagueId):
    accessToken = tokenData['access_token']
    headers = {
      'Authorization': f'Bearer {accessToken}',
    }
    url = f"https://fantasysports.yahooapis.com/fantasy/v2/league/{gameCode}.l.{leagueId}/standings?format=json"
    response = requests.get(url, headers=headers)
    data = response.json()
    return data

def createYahooLeagueDataSheet(gameCode, leagueId, startWeek, endWeek):
    tokenData = getToken()
    settings = getYahooSettings(tokenData, gameCode, leagueId)
    standings = getYahooStandings(tokenData, gameCode, leagueId)
    
    leagueData = {
        'settings': settings,
        'users': standings,
        # 'rosters': rosters,
        # 'draft': draft
    }

    saveToJson(f'./leagues/yahoo/{gameCode}-{leagueId}.json', leagueData)

def main():
  args = parser.parse_args()
  # TODO add some validation here
  season = args.season
  gameCode = getGameCode(season)
  if args.platform == 'sleeper' and gameCode and args.leagueId and args.startWeek and args.endWeek:
    createSleeperLeagueDataSheet(args.leagueId, int(args.startWeek), int(args.endWeek))
  elif args.platform == 'yahoo' and gameCode and args.leagueId and args.startWeek and args.endWeek:
    createYahooLeagueDataSheet(gameCode, args.leagueId, int(args.startWeek), int(args.endWeek))
  else:
    print('you missing things buddy')

if __name__ == "__main__":
    main()
