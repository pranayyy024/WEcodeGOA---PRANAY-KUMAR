def create_zendesk_ticket(ticket_data: dict):
    return {"status": "created", "provider": "zendesk", "ticket_data": ticket_data}
