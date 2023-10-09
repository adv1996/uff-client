import { useCallback, useEffect, useMemo, useState } from "react";
import { League, LeagueClient, Platform } from "../index";
import "../index.css";

const App = () => {
  const leagueClient = useMemo(() => new LeagueClient(), []);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [value, setValue] = useState("1243865");
  const [weeks, setWeeks] = useState("2");
  const [checked, setChecked] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState("");

  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(
    Platform.YAHOO
  ); // Initial value can be whatever you prefer

  const handleChange = () => {
    setChecked(!checked);
  };

  const fetchLeague = useCallback(async () => {
    if (selectedPlatform === Platform.SLEEPER) {
      await leagueClient
        .addLeague({
          id: value,
          platform: Platform.SLEEPER,
          isDevelopment: checked,
        })
        .catch(() => {
          // eslint-disable-next-line no-console
          console.log("Could not add league", value);
        });
    } else if (selectedPlatform === Platform.YAHOO) {
      await leagueClient
        .addLeague({
          id: value,
          platform: Platform.YAHOO,
          isDevelopment: checked,
        })
        .catch(() => {
          // eslint-disable-next-line no-console
          console.log("Could not add league", value);
        });
    }
  }, [selectedPlatform, leagueClient, value, checked]);

  const fetchMatchups = useCallback(
    async (league: League) => {
      await leagueClient.retrieveMatchupsByLeague(
        league.settings.id,
        1,
        parseInt(weeks)
      );
    },
    [leagueClient, weeks]
  );

  const fetchTransactions = useCallback(
    async (league: League) => {
      await leagueClient.retrieveTransactionsByLeague(
        league.settings.id,
        1,
        parseInt(weeks)
      );
    },
    [leagueClient, weeks]
  );

  const fetchDraft = useCallback(
    async (league: League) => {
      await leagueClient.retrieveDraftByLeague(league.settings.id);
    },
    [leagueClient]
  );

  const removeLeague = (id: string) => {
    leagueClient.removeLeague(id);
  };

  const leagueResults = useMemo(() => {
    return leagues.map((league) =>
      league.getResults(leagueClient.players, leagueClient.playerStats)
    );
  }, [leagues, leagueClient.players, leagueClient.playerStats]);

  useEffect(() => {
    const subscription = leagueClient.onMessage().subscribe((value) => {
      setLeagues([...value]);
    });
    setLoading(true);

    // load players for assigning player ids to real names and teams
    // NEED TO INVESTIGATE THIS CALL IS HAPPENING 2x
    if (leagueClient.players.length === 0) {
      leagueClient.loadPlayers(true).then(() => {
        if (leagueClient.playerStats.length === 0) {
          leagueClient.loadPlayerStats().then(() => {
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [leagueClient]);

  const getResultsCSV = useCallback(
    (league: League) => {
      return league.getResultsCSV(leagueClient.players, []);
    },
    [leagueClient.players]
  );
  return (
    <main>
      <div className="tw-p-4">
        <h1 className="tw-text-5xl">Universal Fantasy Football Client</h1>
      </div>
      <div className="tw-container tw-mx-auto">
        <div className="tw-flex tw-flex-row tw-space-x-10">
          <div>
            <h2 className="tw-text-xl">How to Use?</h2>
            <ol className="tw-list-decimal">
              <li>Create League Client</li>
              <code>const client = new LeagueClient();</code>
              <li>Add League</li>
              <code>client.addLeague("demo", Platform.SLEEPER);</code>
              <li>Retrieve Matchups</li>
              <code>league.retrieveMatchups(1, 2);</code>
              <li>Calculate Results</li>
              <code>league.getResults();</code>
            </ol>
          </div>
          <div>
            <h2 className="tw-text-xl">Try it out!</h2>
            <div>
              <label>Choose Platform</label>
              <select
                value={selectedPlatform}
                onChange={(event) =>
                  setSelectedPlatform(event.target.value as Platform)
                }
                className="tw-border tw-border-black tw-mx-2"
              >
                <option value={Platform.SLEEPER}>SLEEPER</option>
                <option value={Platform.ESPN}>ESPN</option>
                <option value={Platform.YAHOO}>YAHOO</option>
              </select>
              <label>Enter League ID</label>
              <input
                type="text"
                className="tw-border tw-border-black tw-mx-2"
                onChange={(e) => setValue(e.target.value)}
                value={value}
              />
              {selectedPlatform === Platform.YAHOO && (
                <>
                  <label>Enter Access Token</label>
                  <input
                    type="text"
                    className="tw-border tw-border-black"
                    onChange={(e) => setAccessToken(e.target.value)}
                    value={accessToken}
                    placeholder="Access Token"
                  />
                </>
              )}
              {!isLoading && (
                <button
                  className="tw-bg-green-200 tw-px-2 tw-border tw-border-black"
                  onClick={fetchLeague}
                >
                  Add League
                </button>
              )}
              <label>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={handleChange}
                />
                Is Development
              </label>
            </div>
            <div className="tw-mt-4">
              <p>Added Leagues</p>
              <label>Weeks to Fetch</label>
              <input
                value={weeks}
                className="tw-border tw-border-black tw-mx-2"
                type="number"
                onChange={(e) => setWeeks(e.target.value)}
              />
              <ol className="tw-list-disc tw-px-4">
                {leagues.map((league) => {
                  return (
                    <div key={league.settings.id}>
                      <li>{league.settings.name}</li>
                      <button
                        onClick={() => fetchMatchups(league)}
                        className="tw-bg-green-200 tw-px-2 tw-border tw-border-black"
                      >
                        Retrieve Matchups
                      </button>
                      <button
                        onClick={() => fetchTransactions(league)}
                        className="tw-bg-green-200 tw-px-2 tw-border tw-border-black"
                      >
                        Retrieve Transactions
                      </button>
                      <button
                        onClick={() => fetchDraft(league)}
                        className="tw-bg-green-200 tw-px-2 tw-border tw-border-black"
                      >
                        Retrieve Draft
                      </button>
                      <button
                        onClick={() => removeLeague(league.settings.id)}
                        className="tw-bg-red-200 tw-px-2 tw-border tw-border-black"
                      >
                        Remove
                      </button>
                      <a
                        href={`data:text/csv;charset=utf-8,${getResultsCSV(
                          league
                        )}`}
                        className="tw-bg-yellow-200 tw-px-2 tw-border tw-border-black"
                        target={"_blank"}
                        rel="noreferrer"
                        download={`${league.settings.id}.csv`}
                      >
                        Download
                      </a>
                    </div>
                  );
                })}
              </ol>
              {leagueResults.map((result, index) => {
                return result.map((r, i) => {
                  return (
                    <div key={`${index}-${i}`}>
                      <p>{r.user.displayName}</p>
                    </div>
                  );
                });
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default App;
