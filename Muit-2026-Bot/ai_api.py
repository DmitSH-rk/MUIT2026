import os
import aiohttp
import asyncio
import json
import requests
import logging

# Настройка логирования
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)
OPENAI_API_KEY = "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"
if not OPENAI_API_KEY:
    raise RuntimeError("Set the OPENAI_API_KEY environment variable")


async def get_popular_professions_from_openai():
    prompt = (
        # "List the top 10 most popular professions in 2025 based on job growth, "
        # "demand, and salary. For each profession, provide the name, average salary "
        # "(in USD), job growth percentage or description, and a brief description "
        # "of the role. Format the response as a JSON array of objects with keys: "
        # "'name', 'salary', 'growth', 'description'. Example: "
        # "[{'name': 'Data Scientist', 'salary': '$120,000', 'growth': '35% by 2030', 'description': 'Analyzes data'}]."
        "Перечислите 10 самых востребованных профессий(слесарь, механик и т.д), где нужен физический труд и работа руками, в 2025 году на основании роста рабочих мест, спроса и зарплаты. Для каждой профессии укажите название, среднюю зарплату (в долларах США), процент роста рабочих мест или описание роста и краткое описание роли. Отформатируйте ответ в виде JSON-массива объектов с ключами: 'name', 'salary', 'growth', 'description'. Пример: [{'name': 'Data Scientist', 'salary': '$120,000', 'growth': '35% к 2030', 'description': 'Анализирует данные'}]."
    )

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "mistralai/mistral-7b-instruct",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant who provides accurate and structured JSON data."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 1000
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=payload) as resp:
                if resp.status == 401:
                    text = await resp.text()
                    logger.error(f"OpenRouter API authentication error: {text}")
                    return []
                if resp.status == 403 or resp.status == 404:
                    text = await resp.text()
                    logger.error(f"OpenRouter API error {resp.status}: {text}")
                    return []
                if resp.status != 200:
                    text = await resp.text()
                    logger.error(f"OpenRouter API error {resp.status}: {text}")
                    return []

                data = await resp.json()
                content = data.get("choices", [])[0].get("message", {}).get("content", "")
                logger.info(f"Raw OpenRouter response: {content}")
                
                # Save raw response for debugging
                with open('api_response.txt', 'w', encoding='utf-8') as f:
                    f.write(content)
                
                try:
                    # Parse the JSON string
                    professions = json.loads(content)
                    if not isinstance(professions, list):
                        logger.error(f"OpenRouter response is not a list: {content}")
                        return []
                    # Validate each profession dictionary
                    valid_professions = []
                    for prof in professions:
                        if not isinstance(prof, dict):
                            logger.error(f"Invalid profession format (not a dict): {prof}")
                            continue
                        if not all(key in prof for key in ['name', 'salary', 'growth', 'description']):
                            logger.error(f"Invalid profession format (missing keys): {prof}")
                            continue
                        valid_professions.append(prof)
                    if not valid_professions:
                        logger.error("No valid professions found in response")
                        return []
                    return valid_professions
                except json.JSONDecodeError:
                    logger.error(f"Failed to parse OpenRouter response as JSON: {content}")
                    return []
    except Exception as e:
        logger.error(f"Error fetching professions from OpenRouter API: {e}")
        return []