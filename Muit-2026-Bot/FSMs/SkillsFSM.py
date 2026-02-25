from aiogram.fsm.state import StatesGroup, State

class SkillsFSM(StatesGroup):
    Experience = State()
    PersonalQualities = State()
    SoftSkills = State()
    HardSkills = State()
    Education = State()