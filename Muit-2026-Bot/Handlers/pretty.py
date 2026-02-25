import json
TG_MAX = 3800  # запас до лимита 4096

def _trunc(s: str | None, n: int = 240) -> str:
    if not s:
        return "—"
    s = str(s).strip()
    return s if len(s) <= n else s[: n - 1] + "…"

def _status_emoji(status: str | None) -> str:
    m = {
        "draft": "📝",
        "active": "✅",
        "paused": "⏸️",
        "closed": "🛑",
        "archived": "📦",
    }
    return m.get(status or "", "❔")

def _confidence_emoji(conf: str | None) -> str:
    m = {"low": "🟠", "medium": "🟡", "high": "🟢"}
    return m.get(conf or "", "⚪")

def _fmt_bool(v: bool | None, yes="Да", no="Нет") -> str:
    if v is None:
        return "—"
    return yes if v else no

def _fmt_description_json(dj) -> tuple[str | None, str | None]:
    """
    Возвращает (text, exp) если удаётся.
    Ожидаем что description_json может быть dict с ключами text/exp/exp_years/stack и т.п.
    """
    if not isinstance(dj, dict):
        return (None, None)
    text = dj.get("text")
    exp = dj.get("exp") or dj.get("exp_years")
    return (text if isinstance(text, str) else None, str(exp) if exp is not None else None)

def pretty_vacancy(v: dict) -> str:
    vid = v.get("id", "—")
    title = v.get("position_title") or v.get("role_search") or "Без названия"
    status = v.get("status")
    city = v.get("city") or "—"
    employment_type = v.get("employment_type") or "—"
    is_remote = v.get("is_remote")
    dj = v.get("description_json") or {}
    text, exp = _fmt_description_json(dj)

    lines = []
    lines.append(f"{_status_emoji(status)} Вакансия #{vid}: {title}")
    lines.append(f"Статус: {status or '—'}")
    lines.append(f"Город: {city}")
    lines.append(f"Удалёнка: {_fmt_bool(is_remote)}")
    lines.append(f"Тип занятости: {employment_type}")
    if exp:
        lines.append(f"Опыт: {exp}")
    if text:
        lines.append(f"Описание: {_trunc(text, 260)}")
    return "\n".join(lines)

def pretty_vacancies_list(vacs) -> str:
    if not vacs:
        return "📋 У вас пока нет вакансий."

    out = [f"📋 Ваши вакансии: {len(vacs)}\n"]
    for i, v in enumerate(vacs, 1):
        out.append(f"{i}) {pretty_vacancy(v)}")
        out.append("")  # пустая строка между
        if sum(len(x) + 1 for x in out) > TG_MAX:
            out.append("… (список обрезан)")
            break
    return "\n".join(out).strip()

def pretty_explanation(expl) -> str:
    """
    explanation приходит как object. Делаем вывод “по-человечески”.
    """
    if expl is None:
        return "—"

    # если строка — выводим как есть
    if isinstance(expl, str):
        return _trunc(expl, 900)

    # если dict — пробуем красиво по ключам
    if isinstance(expl, dict):
        lines = []
        # частые кейсы: summary / matched / missing
        for key in ("summary", "reason", "matched_skills", "missing_skills", "notes"):
            if key in expl:
                val = expl.get(key)
                if isinstance(val, list):
                    val = ", ".join(str(x) for x in val[:30])
                lines.append(f"• {key}: {_trunc(str(val), 700)}")
        # если ничего из “частых” не нашлось — показываем 5 ключей
        if not lines:
            for k, v in list(expl.items())[:6]:
                if isinstance(v, list):
                    v = ", ".join(str(x) for x in v[:30])
                lines.append(f"• {k}: {_trunc(str(v), 700)}")
        return "\n".join(lines)

    # fallback: json
    try:
        return _trunc(json.dumps(expl, ensure_ascii=False, indent=2), 1200)
    except Exception:
        return _trunc(str(expl), 1200)

def pretty_candidate_reco(rec: dict) -> str:
    match_pct = rec.get("match_percent_display") or rec.get("match_percent") or "—"
    conf = rec.get("confidence")
    score = rec.get("match_score")
    expl = rec.get("explanation")

    lines = []
    lines.append(f"👤 Кандидат (рекомендация)")
    lines.append(f"Match: {match_pct}%  { _confidence_emoji(conf)} {conf or '—'}")
    if score is not None:
        lines.append(f"Score: {score}")
    lines.append("Почему подходит:")
    lines.append(pretty_explanation(expl))
    return "\n".join(lines)

def pretty_match(m: dict) -> str:
    if not isinstance(m, dict):
        return f"Match: {_trunc(str(m), 1200)}"
    return (
        "🎉 Мэтч!\n"
        f"Match ID: {m.get('id','—')}\n"
        f"Vacancy ID: {m.get('vacancy_id','—')}\n"
        f"Candidate ID: {m.get('candidate_id','—')}\n"
        f"Organization ID: {m.get('organization_id','—')}\n"
        f"Status: {m.get('status','—')}\n"
        f"Matched at: {m.get('matched_at','—')}"
    )

def pretty_org_profile(me: dict) -> str:
    if not isinstance(me, dict):
        return _trunc(str(me), 1200)
    lines = []
    lines.append("🏢 Профиль компании")
    lines.append(f"Название: {me.get('name','—')}")
    lines.append(f"Email: {me.get('email','—')}")
    lines.append(f"Город: {me.get('city','—')}")
    vacs = me.get("vacancies") or []
    if vacs:
        lines.append(f"\n📌 Вакансии: {len(vacs)}")
        for v in vacs[:6]:
            lines.append(f"• #{v.get('id','—')} {v.get('position_title','Vacancy')} ({v.get('status','—')})")
        if len(vacs) > 6:
            lines.append("• …")
    return "\n".join(lines)

def pretty_candidate_profile(me: dict) -> str:
    if not isinstance(me, dict):
        return _trunc(str(me), 1200)
    desc = me.get("description_json") or {}
    lines = []
    lines.append("🧑‍💻 Профиль кандидата")
    lines.append(f"Email: {me.get('email','—')}")
    lines.append(f"Город: {me.get('city','—')}")
    lines.append(f"Категория: {me.get('category','—')}")
    if isinstance(desc, dict):
        if desc.get("bio"):
            lines.append(f"О себе: {_trunc(desc.get('bio'), 260)}")
        if desc.get("skills"):
            lines.append(f"Навыки: {_trunc(desc.get('skills'), 260)}")
        if desc.get("edu"):
            lines.append(f"Образование: {_trunc(desc.get('edu'), 260)}")
    if me.get("resume_text"):
        lines.append(f"Резюме: {_trunc(me.get('resume_text'), 260)}")
    return "\n".join(lines)