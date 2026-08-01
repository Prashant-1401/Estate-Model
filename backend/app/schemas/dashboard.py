from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_leads: int = 0
    today_leads: int = 0
    hot_leads: int = 0
    total_properties: int = 0
    available_properties: int = 0
    sold_properties: int = 0
    total_projects: int = 0
    total_users: int = 0
    total_inquiries: int = 0
    revenue_mtd: str = "₹0"
