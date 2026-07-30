def create_servicenow_ticket(ticket_data: dict):
    return {"status": "created", "provider": "servicenow", "ticket_data": ticket_data}
