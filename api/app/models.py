from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float
from sqlalchemy.orm import relationship

from .database import Base


class Player(Base):
    __tablename__ = "player"

    id = Column(String, primary_key=True)
    firstName = Column(String)
    lastName = Column(String)
    position = Column(String)

    qbs = relationship("QB", back_populates="player_id")
    wrs = relationship("WR", back_populates="player_id")
    rbs = relationship("RB", back_populates="player_id")
    tes = relationship("TE", back_populates="player_id")

    defs = relationship("DEF", back_populates="player_id")

    dbs = relationship("DB", back_populates="player_id")
    dls = relationship("DL", back_populates="player_id")
    lbs = relationship("LB", back_populates="player_id")


class QB(Base):
    __tablename__ = "QB"

    pid = Column(String, ForeignKey("player.id"), primary_key=True)
    week = Column(Integer, primary_key=True)
    pass_td = Column(Float, default=0)
    rush_td = Column(Float, default=0)
    rec_td = Column(Float, default=0)
    fum_rec_td = Column(Float, default=0)

    player_id = relationship("Player", back_populates="qbs")

class WR(Base):
    __tablename__ = "WR"

    pid = Column(String, ForeignKey("player.id"), primary_key=True)
    week = Column(Integer, primary_key=True)
    pass_td = Column(Float, default=0)
    rush_td = Column(Float, default=0)
    rec_td = Column(Float, default=0)
    fum_rec_td = Column(Float, default=0)

    player_id = relationship("Player", back_populates="wrs")

class RB(Base):
    __tablename__ = "RB"

    pid = Column(String, ForeignKey("player.id"), primary_key=True)
    week = Column(Integer, primary_key=True)
    pass_td = Column(Float, default=0)
    rush_td = Column(Float, default=0)
    rec_td = Column(Float, default=0)
    fum_rec_td = Column(Float, default=0)

    player_id = relationship("Player", back_populates="rbs")

class TE(Base):
    __tablename__ = "TE"

    pid = Column(String, ForeignKey("player.id"), primary_key=True)
    week = Column(Integer, primary_key=True)
    pass_td = Column(Float, default=0)
    rush_td = Column(Float, default=0)
    rec_td = Column(Float, default=0)
    fum_rec_td = Column(Float, default=0)

    player_id = relationship("Player", back_populates="tes")

class DEF(Base):
    __tablename__ = "DEF"

    pid = Column(String, ForeignKey("player.id"), primary_key=True)
    week = Column(Integer, primary_key=True)
    def_st_td = Column(Float, default=0)
    st_td = Column(Float, default=0)
    def_td = Column(Float, default=0)

    player_id = relationship("Player", back_populates="defs")

class DB(Base):
    __tablename__ = "DB"

    pid = Column(String, ForeignKey("player.id"), primary_key=True)
    week = Column(Integer, primary_key=True)
    idp_def_td = Column(Float, default=0)

    player_id = relationship("Player", back_populates="dbs")

class DL(Base):
    __tablename__ = "DL"

    pid = Column(String, ForeignKey("player.id"), primary_key=True)
    week = Column(Integer, primary_key=True)
    idp_def_td = Column(Float, default=0)

    player_id = relationship("Player", back_populates="dls")

class LB(Base):
    __tablename__ = "LB"

    pid = Column(String, ForeignKey("player.id"), primary_key=True)
    week = Column(Integer, primary_key=True)
    idp_def_td = Column(Float, default=0)

    player_id = relationship("Player", back_populates="lbs")