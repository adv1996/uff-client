import { rest } from "msw";
import { setupServer } from "msw/node";
import MockData from "./db.json";

const MockServer = setupServer(
  rest.get("https://api.sleeper.app/v1/league/demo/users", (req, res, ctx) => {
    return res(ctx.json(MockData.users));
  }),
  rest.get(
    "https://api.sleeper.app/v1/league/demo/rosters",
    (req, res, ctx) => {
      return res(ctx.json(MockData.rosters));
    }
  ),
  rest.get("https://api.sleeper.app/v1/league/demo", (req, res, ctx) => {
    return res(ctx.json(MockData.settings));
  }),
  rest.get(
    "https://api.sleeper.app/v1/league/demo/matchups/1",
    (req, res, ctx) => {
      return res(ctx.json(MockData.matchup_1));
    }
  )
);

export default MockServer;
