from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.api.auth import DEMO_USER_ID
from app.services.ai_chat import get_chat_response

router = APIRouter()


class ChatBody(BaseModel):
    message: str


@router.post("")
async def chat(body: ChatBody):
    user_id = DEMO_USER_ID
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    async def stream():
        async for chunk in get_chat_response(user_id, body.message):
            yield f"data: {chunk}\n\n"

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )