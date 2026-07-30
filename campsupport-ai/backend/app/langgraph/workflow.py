from .state import GraphState


def build_workflow():
    return {"state": GraphState, "status": "workflow_ready"}
