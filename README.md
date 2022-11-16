# Universal Fantasy Football - Client (uff-client)

Aggregrate fantasy football from across various platforms into a single schema to pull data from.

Leverage platform agnostic data fetching methods to generate league analytics.

Open demo app to try it out!

```
yarn dev
```

Run Mock JSON Server. This is used for tests and gets you running with a default "demo" league loaded in.

```
yarn dev:test-api
```

If you want to start testing on real leagues and want to seed your mock data with real data use the pipeline scripts to get started.

This is an important workflow to reduce the number of fetches to third parties during development and speeds up local development.

```
cd pipeline
python3 -m venv env // create virtual env
source env/bin/activate // activate virtual env
pip install -r requirements.txt // install packages for pipeline scripts

python league.py 784961395996356608 1 10
python league.py {LEAGUE_ID} {STARTWEEK} {ENDWEEK}

python api.py
```

Once you complete those steps you should see `db.json` and `routes.json` inside `pipeline/api`.
You can now run

```
yarn dev:api
```

to use `json-server` to create an api on saved leagues.
