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

class StatDefTeamBase(BaseModel):
    pid: str
    def_st_td: float
    st_td: float
    def_td = float
    week: int

class StatDefTeam(StatDefTeamBase):
    class Config:
        orm_mode = True

class StatDefPlayerBase(BaseModel):
    pid: str
    week: int
    idp_def_td: float

class StatDefPlayer(StatDefPlayerBase):
    class Config:
        orm_mode = True
