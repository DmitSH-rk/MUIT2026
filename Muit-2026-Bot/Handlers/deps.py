# Handlers/deps.py
from Api.UserApi.EmployeeApi import EmploymentAPI

API_BASE_URL = "http://2.132.157.33:8000"
# API_BASE_URL = "https://club.api.nikcnn.xyz"
api = EmploymentAPI(API_BASE_URL)