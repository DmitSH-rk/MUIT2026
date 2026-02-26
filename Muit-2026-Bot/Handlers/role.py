# Handlers/role.py
from aiogram.fsm.context import FSMContext
from Handlers.deps import api


async def detect_roles(tg_id: int) -> tuple[bool, bool]:
    is_candidate = False
    is_org = False

    try:
        me_c = await api.get_candidate_me(tg_id)
        if isinstance(me_c, dict) and me_c.get("id") is not None:
            is_candidate = True
    except Exception:
        pass

    try:
        me_o = await api.get_org_me(tg_id)
        if isinstance(me_o, dict) and me_o.get("id") is not None:
            is_org = True
    except Exception:
        pass

    return is_candidate, is_org


async def get_active_role(state: FSMContext) -> str | None:
    data = await state.get_data()
    return data.get("active_role")


async def set_active_role(state: FSMContext, role: str):
    await state.update_data(active_role=role)