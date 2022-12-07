from sqlalchemy.orm import Session
from sqlalchemy import or_

from . import models, schemas

def get_players(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Player).offset(skip).limit(limit).all()

def get_stats_offense(db: Session, skip: int = 0, limit: int = 100):
    # OFFENSE
    qbs = db.query(models.QB).filter(or_(models.QB.pass_td > 0, models.QB.rush_td > 0, models.QB.rec_td > 0, models.QB.fum_rec_td > 0))
    wrs = db.query(models.WR).filter(or_(models.WR.pass_td > 0, models.WR.rush_td > 0, models.WR.rec_td > 0, models.WR.fum_rec_td > 0))
    rbs = db.query(models.RB).filter(or_(models.RB.pass_td > 0, models.RB.rush_td > 0, models.RB.rec_td > 0, models.RB.fum_rec_td > 0))
    tes = db.query(models.TE).filter(or_(models.TE.pass_td > 0, models.TE.rush_td > 0, models.TE.rec_td > 0, models.TE.fum_rec_td > 0))

    stacked = qbs.union_all(wrs, rbs, tes)

    return stacked.offset(skip).all()

def get_stats_defense_teams(db: Session, skip: int = 0, limit: int = 100):
    # DEF TEAMS
    defs = db.query(models.DEF).filter(or_(models.DEF.def_st_td > 0, models.DEF.st_td > 0, models.DEF.def_td > 0))
    return defs.offset(skip).all()

def get_stats_defense_players(db: Session, skip: int = 0, limit: int = 100):
    # DEF PLAYERS
    dbs = db.query(models.DB).filter(or_(models.DB.idp_def_td > 0))
    lbs = db.query(models.LB).filter(or_(models.LB.idp_def_td > 0))
    dls = db.query(models.DL).filter(or_(models.DL.idp_def_td > 0))

    stacked = dbs.union_all(lbs, dls)
    return stacked.offset(skip).all()