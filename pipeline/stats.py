import requests
import json
import argparse
import os
import time
import glob
import csv 

def fetchPlayers(isDev):
  if isDev:
    # If isDev is True, read from the local file
    file_path = "players.json"
    try:
      with open(file_path, "r") as json_file:
        data = json.load(json_file)
      return data
    except FileNotFoundError:
      print(f"File not found: {file_path}")
      return None
    except json.JSONDecodeError as e:
      print(f"JSON decoding error: {e}")
      return None
  else:
      # If isDev is False, fetch from the original URL
      url = "https://raw.githubusercontent.com/adv1996/uff-client/main/pipeline/players.json"
      try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for any HTTP errors
        data = response.json()
        return data
      except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return None
      except json.JSONDecodeError as e:
        print(f"JSON decoding error: {e}")
        return None

def fetch_and_save_player_stats(player_id, output_folder):
  # Ensure the output folder exists
  if not os.path.exists(output_folder):
    os.makedirs(output_folder)

  # Define the range of seasons (2019 to 2023)
  # seasons = range(2019, 2024)
  seasons = range(2023, 2024)

  # Create a folder for the player's ID
  player_folder = os.path.join(output_folder, player_id)
  if not os.path.exists(player_folder):
      os.makedirs(player_folder)

  for season in seasons:
      # Define the API URL for each season
      api_url = f"https://api.sleeper.com/stats/nfl/player/{player_id}?season_type=regular&season={season}&grouping=week"
      try:
          # Fetch data from the API
          response = requests.get(api_url)
          response.raise_for_status()  # Raise an exception for any HTTP errors

          # Check if the response content is not empty (null)
          stats = response.json()

          # Check if all key values are null
          all_null = all(value is None for value in stats.values())

          # Print the result
          if all_null:
            print(f"No data available for player {player_id}, season {season}")
          else:
            # Save the response content as a JSON file
            season_filename = os.path.join(player_folder, f"{season}.json")
            with open(season_filename, "w") as season_file:
              json.dump(stats, season_file, indent=2)

            print(f"Saved stats for player {player_id}, season {season} to {season_filename}")

      except requests.exceptions.RequestException as e:
          print(f"Request error for player {player_id}, season {season}: {e}")
      except Exception as e:
          print(f"Error for player {player_id}, season {season}: {e}")

def flatten_dict(d, parent_key='', sep='_'):
    """
    Flatten a nested dictionary.

    Args:
        d (dict): The input dictionary.
        parent_key (str): The key of the parent dictionary (used for recursion).
        sep (str): The separator to use for flattened keys.

    Returns:
        dict: The flattened dictionary.
    """
    items = {}
    for key, value in d.items():
        new_key = f"{parent_key}{sep}{key}" if parent_key else key
        if isinstance(value, dict):
            items.update(flatten_dict(value, new_key, sep=sep))
        else:
            items[new_key] = value
    return items

def assemble_player_stats_to_csv(input_folder, output_csv_file):
    # Get a list of all JSON files in the input folder
    json_files = glob.glob(os.path.join(input_folder, "**/*.json"), recursive=True)
    # Initialize an empty list to store the assembled data
    assembled_data = []

    uCols = set([])

    # Iterate through each JSON file and assemble the data
    for filePath in json_files:
      with open(filePath, "r") as json_file:
        data = json.load(json_file)
        weeks = data.keys()
        for week in weeks:
          if data[week] is not None:
            flattenedStats = flatten_dict({"": data[week]})
            columns = list(flattenedStats.keys())
            uCols.update(columns)
            assembled_data.append(flattenedStats)

    # Set Default Values for Each Object
    for playerStats in assembled_data:
      for key in list(uCols):
        playerStats.setdefault(key, 0)

    # Determine the CSV fieldnames (assuming all JSON files have the same structure)
    fieldnames = list(uCols)

    # Write the assembled data to a CSV file
    with open(output_csv_file, "w", newline="") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()
        for row in assembled_data:
            writer.writerow(row)

    print(f"Data assembled and saved to {output_csv_file}")
    print(len(assembled_data))

def retrievePlayers(isDev):
  allPlayers = fetchPlayers(isDev)

  # Define the output folder (change this to your desired folder)
  output_folder = "player_stats"

  # make this an arg and also choose which players to filter
  filteredPlayers = list(filter(lambda player: player['team'] is not None, allPlayers))

  print('Fetching', len(filteredPlayers), 'players')
  for player in filteredPlayers:
    print('Fetching Player Stats', player['firstName'], player['lastName'], player['id'])
    fetch_and_save_player_stats(player['id'], output_folder)
    time.sleep(0.5)

def main():
  # Example usage:
  # Set isDev to True if you want to read locally, or False to fetch from the URL
  parser = argparse.ArgumentParser(description="Fetch JSON data locally or from a URL")
  parser.add_argument("--isDev", action="store_true", help="Read data locally if provided")

  args = parser.parse_args()
  isDev = args.isDev
  retrievePlayers(isDev)

  input_folder = "player_stats"  # Specify the folder with JSON files
  output_csv_file = "assembled_player_stats.csv"  # Specify the output CSV file

  # Call the function to assemble player stats into a CSV file
  assemble_player_stats_to_csv(input_folder, output_csv_file)

def transformPlayersToCSV():
  parser = argparse.ArgumentParser(description="Fetch JSON data locally or from a URL")
  parser.add_argument("--isDev", action="store_true", help="Read data locally if provided")

  args = parser.parse_args()
  isDev = args.isDev

  players = fetchPlayers(isDev)
  for player in players:
     if player['positions'] is not None:
      player['positions'] = ",".join(player['positions'])

  fieldnames = list(players[0].keys())
  with open('players.csv', "w", newline="") as csv_file:
    writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
    writer.writeheader()
    for row in players:
        writer.writerow(row)

if __name__ == "__main__":
  main()
  transformPlayersToCSV()


# fetch pool of players
# fetch stats for each player (requires args for filtering)
# flatten stats and create csv
# add new stats to sqldb