from sqlalchemy.orm import Session
from sqlalchemy import or_

from . import models, schemas

def get_players(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Player).offset(skip).limit(limit).all()

def get_stats(db: Session, skip: int = 0, limit: int = 100):
    qbs = db.query(models.QB).filter(or_(models.QB.pass_td > 0, models.QB.rush_td > 0, models.QB.rec_td > 0))
    wrs = db.query(models.WR).filter(or_(models.WR.pass_td > 0, models.WR.rush_td > 0, models.WR.rec_td > 0))
    rbs = db.query(models.RB).filter(or_(models.RB.pass_td > 0, models.RB.rush_td > 0, models.RB.rec_td > 0))
    tes = db.query(models.TE).filter(or_(models.TE.pass_td > 0, models.TE.rush_td > 0, models.TE.rec_td > 0))
    stacked = qbs.union_all(wrs, rbs, tes)
    return stacked.offset(skip).all()