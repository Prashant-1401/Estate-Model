import time

from sqlalchemy import select

from app.database import async_session
from app.models.user import User
from app.models.module import Module
from app.models.role import Role
from app.models.permission import Permission
from app.models.role_permission import RolePermission
from app.models.status import Status
from app.models.lead_source import LeadSource
from app.models.dashboard_widget import DashboardWidget
from app.models.notification_template import NotificationTemplate
from app.models.lead import Lead
from app.models.property import Property
from app.models.project import Project
from app.models.follow_up import FollowUp
from app.auth import hash_password


DEFAULT_MODULES = [
    {"name": "Leads", "slug": "leads", "description": "Lead management"},
    {"name": "Properties", "slug": "properties", "description": "Property management"},
    {"name": "Projects", "slug": "projects", "description": "Project management"},
    {"name": "Users", "slug": "users", "description": "User management"},
    {"name": "Reports", "slug": "reports", "description": "Reports and analytics"},
    {"name": "Settings", "slug": "settings", "description": "System settings"},
]

DEFAULT_ROLES = [
    {"name": "Super Admin", "slug": "super_admin", "hierarchy_level": 0, "is_system": True},
    {"name": "Admin", "slug": "admin", "hierarchy_level": 1, "is_system": True},
    {"name": "Manager", "slug": "manager", "hierarchy_level": 2, "is_system": True},
    {"name": "Team Leader", "slug": "team_leader", "hierarchy_level": 3, "is_system": False},
    {"name": "Agent", "slug": "agent", "hierarchy_level": 4, "is_system": True},
    {"name": "Marketing Executive", "slug": "marketing_executive", "hierarchy_level": 5, "is_system": False},
    {"name": "Transaction Coordinator", "slug": "transaction_coordinator", "hierarchy_level": 6, "is_system": False},
    {"name": "Read Only User", "slug": "read_only", "hierarchy_level": 7, "is_system": False},
]

DEFAULT_ACTIONS = ["view", "create", "edit", "delete", "export"]

DEFAULT_LEAD_STATUSES = [
    {"name": "New Lead", "slug": "new", "color": "#3B82F6", "sort_order": 0},
    {"name": "Assigned", "slug": "assigned", "color": "#8B5CF6", "sort_order": 1},
    {"name": "Contacted", "slug": "contacted", "color": "#06B6D4", "sort_order": 2},
    {"name": "Interested", "slug": "interested", "color": "#10B981", "sort_order": 3},
    {"name": "Visit Scheduled", "slug": "visit_scheduled", "color": "#F59E0B", "sort_order": 4},
    {"name": "Visited", "slug": "visited", "color": "#F97316", "sort_order": 5},
    {"name": "Negotiation", "slug": "negotiation", "color": "#EF4444", "sort_order": 6},
    {"name": "Booked", "slug": "booked", "color": "#22C55E", "sort_order": 7},
    {"name": "Registration", "slug": "registration", "color": "#14B8A6", "sort_order": 8},
    {"name": "Completed", "slug": "completed", "color": "#059669", "sort_order": 9},
    {"name": "Rejected", "slug": "rejected", "color": "#DC2626", "sort_order": 10},
]

DEFAULT_LEAD_SOURCES = [
    {"name": "Google Ads", "slug": "google-ads", "icon": "Globe", "sort_order": 0},
    {"name": "Facebook", "slug": "facebook", "icon": "Facebook", "sort_order": 1},
    {"name": "Instagram", "slug": "instagram", "icon": "Instagram", "sort_order": 2},
    {"name": "99Acres", "slug": "99acres", "icon": "Building", "sort_order": 3},
    {"name": "MagicBricks", "slug": "magicbricks", "icon": "Building", "sort_order": 4},
    {"name": "Housing", "slug": "housing", "icon": "Building", "sort_order": 5},
    {"name": "Broker Referral", "slug": "broker-referral", "icon": "Users", "sort_order": 6},
    {"name": "Direct Walk-In", "slug": "direct-walk-in", "icon": "Footprints", "sort_order": 7},
    {"name": "Website", "slug": "website", "icon": "Globe", "sort_order": 8},
    {"name": "Referral", "slug": "referral", "icon": "UserPlus", "sort_order": 9},
]

DEFAULT_DASHBOARD_WIDGETS = [
    {"name": "Total Leads", "widget_type": "stat", "description": "Total number of leads", "config": {"icon": "Users", "color": "#3B82F6"}, "sort_order": 0},
    {"name": "Today's Leads", "widget_type": "stat", "description": "Leads added today", "config": {"icon": "Calendar", "color": "#10B981"}, "sort_order": 1},
    {"name": "Hot Leads", "widget_type": "stat", "description": "Leads marked as hot", "config": {"icon": "Flame", "color": "#EF4444"}, "sort_order": 2},
    {"name": "Total Properties", "widget_type": "stat", "description": "Total properties listed", "config": {"icon": "Building2", "color": "#8B5CF6"}, "sort_order": 3},
    {"name": "Total Projects", "widget_type": "stat", "description": "Total projects", "config": {"icon": "FolderTree", "color": "#F59E0B"}, "sort_order": 4},
    {"name": "Total Users", "widget_type": "stat", "description": "Total team members", "config": {"icon": "Users", "color": "#06B6D4"}, "sort_order": 5},
    {"name": "Revenue MTD", "widget_type": "stat", "description": "Revenue this month", "config": {"icon": "DollarSign", "color": "#22C55E"}, "sort_order": 6},
    {"name": "Recent Leads", "widget_type": "table", "description": "Latest 10 leads", "config": {"limit": 10}, "sort_order": 7},
    {"name": "Upcoming Follow-ups", "widget_type": "list", "description": "Pending follow-ups", "config": {"limit": 10}, "sort_order": 8},
]

DEFAULT_NOTIFICATION_TEMPLATES = [
    {
        "name": "New Lead Assigned",
        "channel": "in-app",
        "subject": "New Lead Assigned to You",
        "body": "You have been assigned a new lead: {{lead_name}}. Please follow up within 24 hours.",
        "variables": ["lead_name", "agent_name", "source"],
    },
    {
        "name": "Lead Status Changed",
        "channel": "in-app",
        "subject": "Lead Status Updated",
        "body": "Lead {{lead_name}} status changed from {{old_status}} to {{new_status}}.",
        "variables": ["lead_name", "old_status", "new_status"],
    },
    {
        "name": "Follow-up Reminder",
        "channel": "in-app",
        "subject": "Follow-up Reminder",
        "body": "You have a follow-up scheduled with {{lead_name}} at {{time}}.",
        "variables": ["lead_name", "time", "property"],
    },
    {
        "name": "New Lead Email",
        "channel": "email",
        "subject": "New Lead Received - {{lead_name}}",
        "body": "A new lead has been received.\n\nName: {{lead_name}}\nPhone: {{phone}}\nEmail: {{email}}\nSource: {{source}}\n\nPlease review and take action.",
        "variables": ["lead_name", "phone", "email", "source"],
    },
]


async def seed_modules(db):
    for i, mod_data in enumerate(DEFAULT_MODULES):
        result = await db.execute(select(Module).where(Module.slug == mod_data["slug"]))
        if result.scalar_one_or_none():
            continue
        module_id = f"MOD-{int(time.time() * 1000) + i}"
        module = Module(id=module_id, **mod_data)
        db.add(module)
    await db.flush()


async def seed_roles(db):
    for i, role_data in enumerate(DEFAULT_ROLES):
        result = await db.execute(select(Role).where(Role.slug == role_data["slug"]))
        if result.scalar_one_or_none():
            continue
        role_id = f"ROL-{int(time.time() * 1000) + i}"
        role = Role(id=role_id, **role_data)
        db.add(role)
    await db.flush()


async def seed_permissions(db):
    modules_result = await db.execute(select(Module))
    modules = {m.slug: m.id for m in modules_result.scalars().all()}

    roles_result = await db.execute(select(Role))
    roles = {r.slug: r.id for r in roles_result.scalars().all()}

    perm_count = 0
    for module_slug, module_id in modules.items():
        for action in DEFAULT_ACTIONS:
            perm_slug = f"{module_slug}_{action}"
            result = await db.execute(select(Permission).where(Permission.name == perm_slug))
            if result.scalar_one_or_none():
                continue

            perm_id = f"PERM-{int(time.time() * 1000) + perm_count}"
            permission = Permission(
                id=perm_id,
                module_id=module_id,
                action=action,
                name=perm_slug,
                description=f"{action.title()} {module_slug.title()}",
            )
            db.add(permission)
            perm_count += 1

            for role_slug, role_id in roles.items():
                if role_slug in ["agent", "read_only"] and action in ["delete", "export"]:
                    continue
                if role_slug == "read_only" and action != "view":
                    continue

                rp_id = f"RP-{int(time.time() * 1000)}-{perm_count}"
                rp = RolePermission(
                    id=rp_id,
                    role_id=role_id,
                    permission_id=perm_id,
                )
                db.add(rp)

    await db.flush()


async def seed_statuses(db):
    for status_data in DEFAULT_LEAD_STATUSES:
        result = await db.execute(
            select(Status).where(Status.entity_type == "lead", Status.slug == status_data["slug"])
        )
        if result.scalar_one_or_none():
            continue
        status_id = f"STS-{int(time.time() * 1000)}-{status_data['slug'][:4].upper()}"
        status = Status(id=status_id, entity_type="lead", **status_data)
        db.add(status)
    await db.flush()


async def seed_lead_sources(db):
    for source_data in DEFAULT_LEAD_SOURCES:
        result = await db.execute(select(LeadSource).where(LeadSource.slug == source_data["slug"]))
        if result.scalar_one_or_none():
            continue
        source_id = f"LDS-{int(time.time() * 1000)}-{source_data['slug'][:4].upper()}"
        source = LeadSource(id=source_id, **source_data)
        db.add(source)
    await db.flush()


async def seed_dashboard_widgets(db):
    for widget_data in DEFAULT_DASHBOARD_WIDGETS:
        result = await db.execute(
            select(DashboardWidget).where(DashboardWidget.name == widget_data["name"])
        )
        if result.scalar_one_or_none():
            continue
        widget_id = f"DW-{int(time.time() * 1000)}-{widget_data['name'][:4].upper()}"
        widget = DashboardWidget(id=widget_id, **widget_data)
        db.add(widget)
    await db.flush()


async def seed_notification_templates(db):
    for template_data in DEFAULT_NOTIFICATION_TEMPLATES:
        result = await db.execute(
            select(NotificationTemplate).where(NotificationTemplate.name == template_data["name"])
        )
        if result.scalar_one_or_none():
            continue
        template_id = f"NTF-{int(time.time() * 1000)}-{template_data['name'][:4].upper()}"
        template = NotificationTemplate(id=template_id, **template_data)
        db.add(template)
    await db.flush()


SAMPLE_LEADS = [
    {"name": "Rahul Sharma", "phone": "+91 98765 43210", "email": "rahul.sharma@email.com", "budget": "80L - 1.2Cr", "area": "2000 sq ft", "type": "3 BHK Flat", "source": "Google Ads", "status": "Hot", "assigned": "Agent", "requirement": "Looking for a 3 BHK in Whitefield with good schools nearby"},
    {"name": "Priya Patel", "phone": "+91 87654 32109", "email": "priya.patel@email.com", "budget": "50L - 75L", "area": "1200 sq ft", "type": "2 BHK Flat", "source": "99Acres", "status": "Warm", "assigned": "Agent", "requirement": "2 BHK near metro station, semi-furnished preferred"},
    {"name": "Amit Singh", "phone": "+91 76543 21098", "email": "amit.singh@email.com", "budget": "1.5Cr - 2Cr", "area": "3000 sq ft", "type": "Villa", "source": "Referral", "status": "New", "assigned": "Unassigned", "requirement": "Independent villa with garden, budget flexible for right property"},
    {"name": "Sneha Reddy", "phone": "+91 65432 10987", "email": "sneha.reddy@email.com", "budget": "40L - 60L", "area": "1000 sq ft", "type": "1 BHK Flat", "source": "MagicBricks", "status": "Contacted", "assigned": "Manager", "requirement": "1 BHK for investment purpose, near IT park"},
    {"name": "Vikram Desai", "phone": "+91 54321 09876", "email": "vikram.desai@email.com", "budget": "2Cr - 3Cr", "area": "3500 sq ft", "type": "Penthouse", "source": "Direct Walk-In", "status": "Negotiation", "assigned": "Agent", "requirement": "Premium penthouse with city view, ready to move"},
    {"name": "Ananya Gupta", "phone": "+91 43210 98765", "email": "ananya.gupta@email.com", "budget": "60L - 80L", "area": "1500 sq ft", "type": "2 BHK Flat", "source": "Facebook", "status": "Interested", "assigned": "Agent", "requirement": "2 BHK in gated community with gym and pool"},
    {"name": "Karthik Nair", "phone": "+91 32109 87654", "email": "karthik.nair@email.com", "budget": "1Cr - 1.5Cr", "area": "2200 sq ft", "type": "3 BHK Flat", "source": "Website", "status": "Visit Scheduled", "assigned": "Manager", "requirement": "3 BHK with parking, near schools and hospitals"},
    {"name": "Meera Joshi", "phone": "+91 21098 76543", "email": "meera.joshi@email.com", "budget": "35L - 50L", "area": "900 sq ft", "type": "Studio Apartment", "source": "Housing", "status": "New", "assigned": "Unassigned", "requirement": "Studio apartment near IT corridor, fully furnished"},
    {"name": "Arjun Mehta", "phone": "+91 10987 65432", "email": "arjun.mehta@email.com", "budget": "90L - 1.3Cr", "area": "1800 sq ft", "type": "3 BHK Flat", "source": "Broker Referral", "status": "Visited", "assigned": "Agent", "requirement": "3 BHK in good locality, ready for possession by December"},
    {"name": "Deepa Iyer", "phone": "+91 09876 54321", "email": "deepa.iyer@email.com", "budget": "70L - 1Cr", "area": "1600 sq ft", "type": "2 BHK Flat", "source": "Instagram", "status": "Booked", "assigned": "Manager", "requirement": "2 BHK near tech park, already shortlisted 2 properties"},
    {"name": "Sanjay Kumar", "phone": "+91 98123 45678", "email": "sanjay.kumar@email.com", "budget": "45L - 65L", "area": "1100 sq ft", "type": "2 BHK Flat", "source": "Google Ads", "status": "Hot", "assigned": "Agent", "requirement": "2 BHK with balcony, close to railway station"},
    {"name": "Pooja Banerjee", "phone": "+91 87123 45678", "email": "pooja.b@email.com", "budget": "1.8Cr - 2.5Cr", "area": "2800 sq ft", "type": "4 BHK Flat", "source": "Referral", "status": "Warm", "assigned": "Manager", "requirement": "Luxury 4 BHK in premium township with all amenities"},
    {"name": "Rohan Verma", "phone": "+91 76123 45678", "email": "rohan.v@email.com", "budget": "55L - 75L", "area": "1300 sq ft", "type": "2 BHK Flat", "source": "99Acres", "status": "Contacted", "assigned": "Agent", "requirement": "Affordable 2 BHK with good connectivity"},
    {"name": "Nisha Agarwal", "phone": "+91 65123 45678", "email": "nisha.a@email.com", "budget": "3Cr - 4Cr", "area": "4000 sq ft", "type": "Independent House", "source": "Direct Walk-In", "status": "Negotiation", "assigned": "Agent", "requirement": "Independent house with compound, 4+ bedrooms"},
    {"name": "Vivek Choudhary", "phone": "+91 54123 45678", "email": "vivek.c@email.com", "budget": "40L - 55L", "type": "1 BHK Flat", "source": "Website", "status": "New", "assigned": "Unassigned", "area": "750 sq ft", "requirement": "1 BHK near metro, first-time buyer"},
]

SAMPLE_PROPERTIES = [
    {"title": "Prestige Lakeside Habitat", "location": "Whitefield, Bangalore", "price": "1.2 Cr", "bedrooms": 3, "bathrooms": 2, "area": "1850 sq ft", "type": "Apartment", "status": "Available", "featured": True},
    {"title": "Brigade Gateway Enclave", "location": "Rajajinagar, Bangalore", "price": "2.5 Cr", "bedrooms": 4, "bathrooms": 3, "area": "2800 sq ft", "type": "Apartment", "status": "Available", "featured": True},
    {"title": "Sobha Dream Acres", "location": "Panathur, Bangalore", "price": "85 L", "bedrooms": 2, "bathrooms": 2, "area": "1200 sq ft", "type": "Apartment", "status": "Available", "featured": False},
    {"title": "Embassy Springs", "location": "Devanahalli, Bangalore", "price": "3.2 Cr", "bedrooms": 4, "bathrooms": 4, "area": "3500 sq ft", "type": "Villa", "status": "Available", "featured": True},
    {"title": "Mantri Serenity", "location": "Dasanapura, Bangalore", "price": "95 L", "bedrooms": 2, "bathrooms": 2, "area": "1350 sq ft", "type": "Apartment", "status": "Sold", "featured": False},
    {"title": "Godrej Platinum", "location": "Hebbal, Bangalore", "price": "1.8 Cr", "bedrooms": 3, "bathrooms": 3, "area": "2200 sq ft", "type": "Apartment", "status": "Available", "featured": False},
    {"title": "Ozone Urbana Aqua", "location": "Budigere Cross, Bangalore", "price": "72 L", "bedrooms": 2, "bathrooms": 2, "area": "1100 sq ft", "type": "Apartment", "status": "Available", "featured": False},
    {"title": "Puravankara Purva Atmosphere", "location": "Thanisandra, Bangalore", "price": "1.5 Cr", "bedrooms": 3, "bathrooms": 2, "area": "1650 sq ft", "type": "Apartment", "status": "Available", "featured": True},
    {"title": "Assetz Earth & Essence", "location": "Sarjapur Road, Bangalore", "price": "1.1 Cr", "bedrooms": 3, "bathrooms": 2, "area": "1550 sq ft", "type": "Apartment", "status": "Under Construction", "featured": False},
    {"title": "SattvaViva", "location": "Hoskote, Bangalore", "price": "55 L", "bedrooms": 2, "bathrooms": 2, "area": "1050 sq ft", "type": "Apartment", "status": "Available", "featured": False},
]

SAMPLE_PROJECTS = [
    {"name": "Prestige City", "developer": "Prestige Group", "location": "Sarjapur Road, Bangalore", "status": "Under Construction", "total_units": 2500, "units_sold": 1800, "launch_date": "Jan 2024", "completion_date": "Dec 2027", "price_range": "80L - 4Cr", "description": "Integrated township with residential, commercial and retail"},
    {"name": "Brigade Orchade", "developer": "Brigade Group", "location": "Devanahalli, Bangalore", "status": "Under Construction", "total_units": 1200, "units_sold": 850, "launch_date": "Mar 2023", "completion_date": "Jun 2026", "price_range": "55L - 2.5Cr", "description": "Premium residential project near airport"},
    {"name": "Sobha Dream Valley", "developer": "Sobha Ltd", "location": "Off Thanisandra Main Road", "status": "Completed", "total_units": 800, "units_sold": 780, "launch_date": "Feb 2022", "completion_date": "Mar 2025", "price_range": "70L - 1.8Cr", "description": "Luxury apartments with world-class amenities"},
    {"name": "Embassy Lake Terraces", "developer": "Embassy Group", "location": "Hebbal, Bangalore", "status": "Under Construction", "total_units": 400, "units_sold": 320, "launch_date": "Jun 2023", "completion_date": "Sep 2026", "price_range": "2Cr - 6Cr", "description": "Ultra-luxury lakeside residences"},
    {"name": "Godrej Ananda", "developer": "Godrej Properties", "location": "KR Puram, Bangalore", "status": "Planning", "total_units": 1500, "units_sold": 0, "launch_date": "Q1 2026", "completion_date": "Q4 2029", "price_range": "50L - 1.5Cr", "description": "Affordable luxury project with smart home features"},
]

SAMPLE_FOLLOW_UPS = [
    {"lead_id": "LEAD-SAMPLE-001", "lead_name": "Rahul Sharma", "property_title": "Prestige Lakeside Habitat", "assigned_to": "Agent", "status": "Today", "time": "10:30 AM", "note": "Discuss pricing and payment plan"},
    {"lead_id": "LEAD-SAMPLE-002", "lead_name": "Priya Patel", "property_title": "Sobha Dream Acres", "assigned_to": "Agent", "status": "Today", "time": "2:00 PM", "note": "Schedule site visit"},
    {"lead_id": "LEAD-SAMPLE-003", "lead_name": "Karthik Nair", "property_title": "Godrej Platinum", "assigned_to": "Manager", "status": "Tomorrow", "time": "11:00 AM", "note": "Follow up on negotiation status"},
    {"lead_id": "LEAD-SAMPLE-004", "lead_name": "Vikram Desai", "property_title": "Embassy Springs", "assigned_to": "Agent", "status": "Overdue", "time": "Yesterday", "note": "Was supposed to visit but cancelled"},
    {"lead_id": "LEAD-SAMPLE-005", "lead_name": "Ananya Gupta", "property_title": "Ozone Urbana Aqua", "assigned_to": "Agent", "status": "Tomorrow", "time": "3:30 PM", "note": "Send property brochure and floor plans"},
    {"lead_id": "LEAD-SAMPLE-006", "lead_name": "Sanjay Kumar", "property_title": "Puravankara Purva Atmosphere", "assigned_to": "Agent", "status": "Today", "time": "4:00 PM", "note": "Finalize deal, bring token amount details"},
    {"lead_id": "LEAD-SAMPLE-007", "lead_name": "Deepa Iyer", "property_title": "Brigade Gateway Enclave", "assigned_to": "Manager", "status": "Overdue", "time": "2 days ago", "note": "Registration paperwork pending"},
    {"lead_id": "LEAD-SAMPLE-008", "lead_name": "Nisha Agarwal", "property_title": "Embassy Lake Terraces", "assigned_to": "Agent", "status": "Tomorrow", "time": "5:00 PM", "note": "Present custom floor plan options"},
]


async def seed_sample_data(db):
    existing = await db.execute(select(Lead).limit(1))
    if existing.scalar_one_or_none():
        return

    for i, lead_data in enumerate(SAMPLE_LEADS):
        lead_id = f"LEAD-SAMPLE-{i+1:03d}"
        lead = Lead(id=lead_id, date="Aug 2026", **lead_data)
        db.add(lead)

    for i, prop_data in enumerate(SAMPLE_PROPERTIES):
        prop_id = f"PROP-SAMPLE-{i+1:03d}"
        prop = Property(id=prop_id, **prop_data)
        db.add(prop)

    for i, proj_data in enumerate(SAMPLE_PROJECTS):
        proj_id = f"PROJ-SAMPLE-{i+1:03d}"
        proj = Project(id=proj_id, **proj_data)
        db.add(proj)

    for i, fu_data in enumerate(SAMPLE_FOLLOW_UPS):
        fu_id = f"FU-SAMPLE-{i+1:03d}"
        fu = FollowUp(id=fu_id, **fu_data)
        db.add(fu)

    await db.flush()


async def seed_users():
    async with async_session() as db:
        for i, (email, name, role, password) in enumerate([
            ("admin@estatecrm.com", "Admin", "admin", "admin123"),
            ("manager@estatecrm.com", "Manager", "manager", "manager123"),
            ("agent@estatecrm.com", "Agent", "agent", "agent123"),
        ]):
            result = await db.execute(select(User).where(User.email == email))
            existing = result.scalar_one_or_none()
            if existing:
                continue

            uid = f"UR-{int(time.time() * 1000000) + i}"
            user = User(
                id=uid,
                name=name,
                email=email,
                role=role,
                status="Active",
                hashed_password=hash_password(password),
            )
            db.add(user)

        await seed_modules(db)
        await seed_roles(db)
        await seed_permissions(db)
        await seed_statuses(db)
        await seed_lead_sources(db)
        await seed_dashboard_widgets(db)
        await seed_notification_templates(db)
        await seed_sample_data(db)
        await db.commit()
