# Handlers/josb.py
from aiogram import Router

from Handlers.start import router as start_router
from Handlers.registration import router as registration_router
from Handlers.profile import router as profile_router
from Handlers.candidate_feed import router as candidate_router
from Handlers.employee_feed import router as employer_router
from Handlers.vacancy_create import router as vacancy_create_router
from Handlers.match import router as match_router

router = Router()
router.include_router(start_router)
router.include_router(registration_router)
router.include_router(profile_router)
router.include_router(candidate_router)
router.include_router(employer_router)
router.include_router(vacancy_create_router)
router.include_router(match_router)