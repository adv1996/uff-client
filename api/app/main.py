from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/players", response_model=list[schemas.Player])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    players = crud.get_players(db, skip=skip, limit=limit)
    return players

@app.get("/stats") # response_model=list[schemas.StatPlayer, schemas.StatDefTeam]
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    statOffPlayers = crud.get_stats_offense(db, skip=skip, limit=limit)
    statDefTeams = crud.get_stats_defense_teams(db, skip=skip, limit=limit)
    statDefPlayers = crud.get_stats_defense_players(db, skip=skip, limit=limit)
    return statOffPlayers + statDefTeams + statDefPlayers 