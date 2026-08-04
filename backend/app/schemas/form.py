from datetime import datetime
from pydantic import BaseModel, Field


class FieldOptionBase(BaseModel):
    label: str
    value: str
    sort_order: int = 0


class FieldOptionCreate(FieldOptionBase):
    id: str | None = None


class FieldOptionRead(FieldOptionBase):
    id: str
    field_id: str
    is_active: bool = True
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class FormFieldBase(BaseModel):
    field_type: str
    label: str
    placeholder: str = ""
    help_text: str = ""
    default_value: str = ""
    is_required: bool = False
    is_read_only: bool = False
    is_hidden: bool = False
    sort_order: int = 0
    validation_rules: dict = {}
    metadata: dict = {}


class FormFieldCreate(FormFieldBase):
    id: str | None = None
    options: list[FieldOptionCreate] = []


class FormFieldUpdate(BaseModel):
    field_type: str | None = None
    label: str | None = None
    placeholder: str | None = None
    help_text: str | None = None
    default_value: str | None = None
    is_required: bool | None = None
    is_read_only: bool | None = None
    is_hidden: bool | None = None
    sort_order: int | None = None
    validation_rules: dict | None = None
    metadata: dict | None = None
    options: list[FieldOptionCreate] | None = None


class FormFieldRead(FormFieldBase):
    id: str
    section_id: str
    options: list[FieldOptionRead] = []
    is_active: bool = True
    created_at: datetime | None = None
    metadata: dict = Field(default_factory=dict, validation_alias="metadata_")

    model_config = {"from_attributes": True, "populate_by_name": True}


class FormSectionBase(BaseModel):
    name: str
    description: str = ""
    sort_order: int = 0


class FormSectionCreate(FormSectionBase):
    id: str | None = None
    fields: list[FormFieldCreate] = []


class FormSectionUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    sort_order: int | None = None
    fields: list[FormFieldCreate] | None = None


class FormSectionRead(FormSectionBase):
    id: str
    form_id: str
    fields: list[FormFieldRead] = []
    is_active: bool = True
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class FormBase(BaseModel):
    name: str
    entity_type: str
    description: str = ""


class FormCreate(FormBase):
    sections: list[FormSectionCreate] = []


class FormUpdate(BaseModel):
    name: str | None = None
    entity_type: str | None = None
    description: str | None = None
    is_active: bool | None = None
    sections: list[FormSectionCreate] | None = None


class FormRead(FormBase):
    id: str
    is_active: bool = True
    sections: list[FormSectionRead] = []
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
