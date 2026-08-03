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
        await db.commit()
