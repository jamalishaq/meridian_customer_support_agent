sessions: dict[str, dict] = {}


def get_session(session_id: str) -> dict:
    if session_id not in sessions:
        sessions[session_id] = {
            "messages": [],
            "customer_id": None,
            "customer_name": None,
        }
    return sessions[session_id]


def save_session(session_id: str, session: dict) -> None:
    sessions[session_id] = session
