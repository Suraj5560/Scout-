import json
from typing import Any, Dict
from pydantic import BaseModel

class SSEEvent:
    def __init__(self, event_type: str, data: Dict[str, Any] | BaseModel | str):
        self.event_type = event_type
        if isinstance(data, BaseModel):
            self.data = data.model_dump(mode="json")
        elif isinstance(data, dict):
            self.data = data
        else:
            self.data = {"message": str(data)}
        self.data["type"] = event_type

    def to_sse(self) -> str:
        payload = json.dumps(self.data, default=str)
        return f"event: message\ndata: {payload}\n\n"
