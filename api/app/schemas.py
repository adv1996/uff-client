from pydantic import BaseModel

class PlayerBase(BaseModel):
    id: str
    firstName: str
    lastName: str
    position: str

class Player(PlayerBase):
    class Config:
        orm_mode = True

class StatPlayerBase(BaseModel):
    pid: str
    pass_td: float
    rush_td: float
    rec_td: float
    week: int

class StatPlayer(StatPlayerBase):
    class Config:
        orm_mode = True
