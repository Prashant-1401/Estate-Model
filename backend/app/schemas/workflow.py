from datetime import datetime
from pydantic import BaseModel


class WorkflowStepBase(BaseModel):
    name: str
    step_type: str
    action: str
    config: dict = {}
    sort_order: int = 0


class WorkflowStepCreate(WorkflowStepBase):
    id: str | None = None


class WorkflowStepRead(WorkflowStepBase):
    id: str
    workflow_id: str
    is_active: bool = True
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class WorkflowBase(BaseModel):
    name: str
    entity_type: str
    description: str = ""
    trigger_event: str


class WorkflowCreate(WorkflowBase):
    steps: list[WorkflowStepCreate] = []


class WorkflowUpdate(BaseModel):
    name: str | None = None
    entity_type: str | None = None
    description: str | None = None
    trigger_event: str | None = None
    is_active: bool | None = None
    steps: list[WorkflowStepCreate] | None = None


class WorkflowRead(WorkflowBase):
    id: str
    is_active: bool = True
    steps: list[WorkflowStepRead] = []
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
