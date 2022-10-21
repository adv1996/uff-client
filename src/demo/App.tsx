import { useState } from "react";
import { create } from "../";
import { Platform } from "../interfaces/Settings.interface";
import { League } from "../models/LeagueModel/LeagueModel";

const App = () => {
  const [value, setValue] = useState("");
  const [leagues, setLeagues] = useState<League[]>([]);

  const fetchLeague = async () => {
    const league = await create(value, Platform.SLEEPER);
    setLeagues((leagues) => [...leagues, league]);
  };

  const fetchMatchups = async () => {
    const league = leagues[0];
    const matchups = await league.retrieveMatchups(1, 2);
    console.log(matchups);
  };

  const fetchResults = () => {
    const league = leagues[0];
    const results = league.getResults();
    console.log(results);
  };

  return (
    <main>
      <h1>Demo App</h1>
      <div>
        <ul>
          <li>784961395996356608</li>
          <li>849473673709629440</li>
        </ul>
      </div>
      <div>
        <select>
          <option>SLEEPER</option>
          <option>ESPN</option>
        </select>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button onClick={fetchLeague}>Retrieve League</button>
        <button onClick={fetchMatchups}>Fetch Matchups</button>
        <button onClick={fetchResults}>Results</button>
      </div>
      <div>
        {leagues.map((league, index) => {
          return (
            <p key={`${league.settings.id}-${index}`}>{league.settings.name}</p>
          );
        })}
      </div>
    </main>
  );
};

export default App;
