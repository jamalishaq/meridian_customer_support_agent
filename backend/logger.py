import logging
import json

class JSONFormatter(logging.Formatter):
    def format(self, record):
        payload = {
            "level": record.levelname,
            "logger": record.name,
            "timestamp": self.formatTime(record)
        }
        
        # if the message is already a JSON string, merge it in
        try:
            msg = json.loads(record.getMessage())
            if isinstance(msg, dict):
                payload.update(msg)
        except (json.JSONDecodeError, TypeError):
            payload["message"] = record.getMessage()

        return json.dumps(payload)

def setup_logging():
    root = logging.getLogger()
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())
    root.addHandler(handler)
    root.setLevel(logging.INFO)