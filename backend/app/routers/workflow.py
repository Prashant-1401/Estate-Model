import time
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.workflow import Workflow
from app.models.workflow_step import WorkflowStep
from app.schemas.workflow import WorkflowCreate, WorkflowRead, WorkflowUpdate
from app.schemas.common import Page
from app.pagination import paginate
from app.auth import require_role
from app.constants import Role

router = APIRouter(prefix="/api/workflows", tags=["workflows"])


@router.get("", response_model=Page[WorkflowRead])
async def list_workflows(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    entity_type: str = "",
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    stmt = select(Workflow).order_by(Workflow.name)
    if entity_type:
        stmt = stmt.where(Workflow.entity_type == entity_type)
    items, total, pages = await paginate(db, stmt, page, per_page)
    return Page(items=items, total=total, page=page, per_page=per_page, pages=pages)


@router.get("/{workflow_id}", response_model=WorkflowRead)
async def get_workflow(
    workflow_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    result = await db.execute(select(Workflow).where(Workflow.id == workflow_id))
    workflow = result.scalar_one_or_none()
    if not workflow:
        raise HTTPException(404, detail="Workflow not found")

    workflow_data = WorkflowRead.model_validate(workflow)

    steps_stmt = (
        select(WorkflowStep)
        .where(WorkflowStep.workflow_id == workflow_id)
        .order_by(WorkflowStep.sort_order)
    )
    steps_result = await db.execute(steps_stmt)
    workflow_data.steps = [WorkflowStepRead.model_validate(s) for s in steps_result.scalars().all()]

    return workflow_data


@router.post("", response_model=WorkflowRead, status_code=201)
async def create_workflow(
    data: WorkflowCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    workflow_id = f"WFL-{int(time.time() * 1000)}"
    workflow = Workflow(
        id=workflow_id,
        name=data.name,
        entity_type=data.entity_type,
        description=data.description,
        trigger_event=data.trigger_event,
    )
    db.add(workflow)
    await db.flush()

    for i, step_data in enumerate(data.steps):
        step_id = f"WFS-{int(time.time() * 1000)}-{i}"
        step = WorkflowStep(
            id=step_id,
            workflow_id=workflow_id,
            name=step_data.name,
            step_type=step_data.step_type,
            action=step_data.action,
            config=step_data.config,
            sort_order=i,
        )
        db.add(step)

    await db.commit()
    return await get_workflow(workflow_id, db)


@router.put("/{workflow_id}", response_model=WorkflowRead)
async def update_workflow(
    workflow_id: str,
    data: WorkflowUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    result = await db.execute(select(Workflow).where(Workflow.id == workflow_id))
    workflow = result.scalar_one_or_none()
    if not workflow:
        raise HTTPException(404, detail="Workflow not found")

    if data.name is not None:
        workflow.name = data.name
    if data.entity_type is not None:
        workflow.entity_type = data.entity_type
    if data.description is not None:
        workflow.description = data.description
    if data.trigger_event is not None:
        workflow.trigger_event = data.trigger_event
    if data.is_active is not None:
        workflow.is_active = data.is_active

    if data.steps is not None:
        await db.execute(delete(WorkflowStep).where(WorkflowStep.workflow_id == workflow_id))
        for i, step_data in enumerate(data.steps):
            step_id = f"WFS-{int(time.time() * 1000)}-{i}"
            step = WorkflowStep(
                id=step_id,
                workflow_id=workflow_id,
                name=step_data.name,
                step_type=step_data.step_type,
                action=step_data.action,
                config=step_data.config,
                sort_order=i,
            )
            db.add(step)

    await db.commit()
    return await get_workflow(workflow_id, db)


@router.delete("/{workflow_id}", status_code=204)
async def delete_workflow(
    workflow_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    result = await db.execute(select(Workflow).where(Workflow.id == workflow_id))
    workflow = result.scalar_one_or_none()
    if not workflow:
        raise HTTPException(404, detail="Workflow not found")
    await db.execute(delete(WorkflowStep).where(WorkflowStep.workflow_id == workflow_id))
    await db.delete(workflow)
    await db.commit()
