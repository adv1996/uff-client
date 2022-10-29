import { useCallback, useEffect, useMemo, useState } from "react";
import { League, LeagueClient, Platform } from "../index";
import "../index.css";

const App = () => {
  const leagueClient = useMemo(() => new LeagueClient(), []);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [value, setValue] = useState("demo");
  const [weeks, setWeeks] = useState("2");
  const [checked, setChecked] = useState(false);

  const handleChange = () => {
    setChecked(!checked);
  };

  const fetchLeague = useCallback(async () => {
    await leagueClient.addLeague(value, Platform.SLEEPER, checked);
  }, [leagueClient, value, checked]);

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

  const removeLeague = (id: string) => {
    leagueClient.removeLeague(id);
  };

  const leagueResults = useMemo(() => {
    return leagues.map((league) => league.getResults());
  }, [leagues]);

  useEffect(() => {
    const subscription = leagueClient.onMessage().subscribe((value) => {
      setLeagues([...value]);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [leagueClient]);

  return (
    <main>
      <div className="tw-p-4">
        <h1 className="tw-text-5xl">Universal Fantasy Football Client</h1>
      </div>
      <div className="tw-container tw-mx-auto">
        <div className="tw-flex tw-flex-ro tw-space-x-10">
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
              <select className="tw-border tw-border-black tw-mx-2">
                <option>SLEEPER</option>
                <option>ESPN</option>
                <option>YAHOO</option>
              </select>
              <label>Enter League ID</label>
              <input
                type="text"
                className="tw-border tw-border-black tw-mx-2"
                onChange={(e) => setValue(e.target.value)}
                value={value}
              />
              <button
                className="tw-bg-green-200 tw-px-2 tw-border tw-border-black"
                onClick={fetchLeague}
              >
                Add League
              </button>
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
                        onClick={() => removeLeague(league.settings.id)}
                        className="tw-bg-red-200 tw-px-2 tw-border tw-border-black"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </ol>
              {leagueResults.map((result, index) => {
                return result.map((r, i) => {
                  return <p key={`${index}-${i}`}>{r.user.displayName}</p>;
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
