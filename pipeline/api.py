import glob

from utils import loadDataFromFile, saveToJson

def collateData():
    # needs to be platform agnostic
    filesToCollate = glob.glob("./leagues/sleeper/*")
    
    db = {}
    routes = {}
    
    for filename in filesToCollate:
        data = loadDataFromFile(filename)
        keys = list(data.keys())
        leagueId = filename.split('/')[-1].split('.json')[0]
        
        # SLEEPER API ROUTES
        db[f'settings-{leagueId}'] = data['settings']
        db[f'users-{leagueId}'] = data['users']
        db[f'rosters-{leagueId}'] = data['rosters']
        
        routes[f'/api/league/{leagueId}'] = f'/settings-{leagueId}'
        routes[f'/api/league/{leagueId}/users'] = f'/users-{leagueId}'
        routes[f'/api/league/{leagueId}/rosters'] = f'/rosters-{leagueId}'
        
        # Add Matchup API Routes
        matchups = list(filter(lambda x: "matchup" in x, keys))
        
        for matchup in matchups:
            db[f'{leagueId}-{matchup}'] = data[matchup]

        routes[f'/api/league/{leagueId}/matchups/*'] = f"/{leagueId}-matchup_$1"
            
    saveToJson('./api/db.json', db)
    saveToJson('./api/routes.json', routes)

def main():
  collateData()

if __name__ == "__main__":
    main()