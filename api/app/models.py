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


class QB(Base):
    __tablename__ = "QB"

    pid = Column(String, ForeignKey("player.id"), primary_key=True)
    week = Column(Integer, primary_key=True)
    pass_td = Column(Float, default=0)
    rush_td = Column(Float, default=0)
    rec_td = Column(Float, default=0)


    player_id = relationship("Player", back_populates="qbs")

class WR(Base):
    __tablename__ = "WR"

    pid = Column(String, ForeignKey("player.id"), primary_key=True)
    week = Column(Integer, primary_key=True)
    pass_td = Column(Float, default=0)
    rush_td = Column(Float, default=0)
    rec_td = Column(Float, default=0)


    player_id = relationship("Player", back_populates="wrs")

class RB(Base):
    __tablename__ = "RB"

    pid = Column(String, ForeignKey("player.id"), primary_key=True)
    week = Column(Integer, primary_key=True)
    pass_td = Column(Float, default=0)
    rush_td = Column(Float, default=0)
    rec_td = Column(Float, default=0)


    player_id = relationship("Player", back_populates="rbs")

class TE(Base):
    __tablename__ = "TE"

    pid = Column(String, ForeignKey("player.id"), primary_key=True)
    week = Column(Integer, primary_key=True)
    pass_td = Column(Float, default=0)
    rush_td = Column(Float, default=0)
    rec_td = Column(Float, default=0)


    player_id = relationship("Player", back_populates="tes")