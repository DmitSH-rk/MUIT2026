from aiogram import Router
from Api.UserApi.EmployeeApi import EmploymentAPI


router = Router()
api = EmploymentAPI("http://localhost:8000")