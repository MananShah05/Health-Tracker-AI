import json
from datetime import datetime, timedelta, timezone
from app.core.database import get_database
from app.core.config import get_settings

settings = get_settings()


async def parse_food_image(image_data: bytes) -> list[dict]:
    import base64
    from openai import OpenAI

    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    b64 = base64.b64encode(image_data).decode()

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "Parse this food image into a JSON array of items with fields: "
                            "name, calories, protein (g), carbs (g), fat (g). "
                            "Return ONLY valid JSON array, no markdown."
                        ),
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{b64}"},
                    },
                ],
            }
        ],
        max_tokens=512,
    )

    text = response.choices[0].message.content.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("[")
        end = text.rfind("]") + 1
        return json.loads(text[start:end])