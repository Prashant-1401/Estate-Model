import time
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.form import Form
from app.models.form_section import FormSection
from app.models.form_field import FormField
from app.models.field_option import FieldOption
from app.schemas.form import (
    FormCreate,
    FormRead,
    FormUpdate,
    FormSectionCreate,
    FormSectionRead,
    FormFieldCreate,
    FormFieldRead,
    FormUpdate,
)
from app.schemas.common import Page
from app.pagination import paginate
from app.auth import require_role
from app.constants import Role

router = APIRouter(prefix="/api/forms", tags=["forms"])


# ── Form Endpoints ──────────────────────────────────────────────


@router.get("", response_model=Page[FormRead])
async def list_forms(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    entity_type: str = "",
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    stmt = select(Form).order_by(Form.name)
    if entity_type:
        stmt = stmt.where(Form.entity_type == entity_type)
    items, total, pages = await paginate(db, stmt, page, per_page)
    return Page(items=items, total=total, page=page, per_page=per_page, pages=pages)


@router.get("/all", response_model=list[FormRead])
async def list_all_forms(
    entity_type: str = "",
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    stmt = select(Form).where(Form.is_active == True).order_by(Form.name)
    if entity_type:
        stmt = stmt.where(Form.entity_type == entity_type)
    result = await db.execute(stmt)
    forms = result.scalars().all()
    return [FormRead.model_validate(f) for f in forms]


@router.get("/{form_id}", response_model=FormRead)
async def get_form(
    form_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    result = await db.execute(select(Form).where(Form.id == form_id))
    form = result.scalar_one_or_none()
    if not form:
        raise HTTPException(404, detail="Form not found")

    form_data = FormRead.model_validate(form)

    sections_stmt = (
        select(FormSection)
        .where(FormSection.form_id == form_id)
        .order_by(FormSection.sort_order)
    )
    sections_result = await db.execute(sections_stmt)
    sections = sections_result.scalars().all()

    form_data.sections = []
    for section in sections:
        section_data = FormSectionRead.model_validate(section)

        fields_stmt = (
            select(FormField)
            .where(FormField.section_id == section.id)
            .order_by(FormField.sort_order)
        )
        fields_result = await db.execute(fields_stmt)
        fields = fields_result.scalars().all()

        section_data.fields = []
        for field in fields:
            field_data = FormFieldRead.model_validate(field)

            options_stmt = (
                select(FieldOption)
                .where(FieldOption.field_id == field.id)
                .order_by(FieldOption.sort_order)
            )
            options_result = await db.execute(options_stmt)
            field_data.options = [FieldOptionRead.model_validate(o) for o in options_result.scalars().all()]

            section_data.fields.append(field_data)

        form_data.sections.append(section_data)

    return form_data


@router.get("/{form_id}/render", response_model=FormRead)
async def render_form(
    form_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Form).where(Form.id == form_id, Form.is_active == True))
    form = result.scalar_one_or_none()
    if not form:
        raise HTTPException(404, detail="Form not found or inactive")

    form_data = FormRead.model_validate(form)

    sections_stmt = (
        select(FormSection)
        .where(FormSection.form_id == form_id, FormSection.is_active == True)
        .order_by(FormSection.sort_order)
    )
    sections_result = await db.execute(sections_stmt)
    sections = sections_result.scalars().all()

    form_data.sections = []
    for section in sections:
        section_data = FormSectionRead.model_validate(section)

        fields_stmt = (
            select(FormField)
            .where(FormField.section_id == section.id, FormField.is_active == True, FormField.is_hidden == False)
            .order_by(FormField.sort_order)
        )
        fields_result = await db.execute(fields_stmt)
        fields = fields_result.scalars().all()

        section_data.fields = []
        for field in fields:
            field_data = FormFieldRead.model_validate(field)

            options_stmt = (
                select(FieldOption)
                .where(FieldOption.field_id == field.id, FieldOption.is_active == True)
                .order_by(FieldOption.sort_order)
            )
            options_result = await db.execute(options_stmt)
            field_data.options = [FieldOptionRead.model_validate(o) for o in options_result.scalars().all()]

            section_data.fields.append(field_data)

        form_data.sections.append(section_data)

    return form_data


@router.post("", response_model=FormRead, status_code=201)
async def create_form(
    data: FormCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    form_id = f"FRM-{int(time.time() * 1000)}"
    form = Form(
        id=form_id,
        name=data.name,
        entity_type=data.entity_type,
        description=data.description,
    )
    db.add(form)
    await db.flush()

    for section_data in data.sections:
        section_id = f"SEC-{int(time.time() * 1000)}-{section_data.name[:4].upper()}"
        section = FormSection(
            id=section_id,
            form_id=form_id,
            name=section_data.name,
            description=section_data.description,
            sort_order=section_data.sort_order,
        )
        db.add(section)
        await db.flush()

        for field_data in section_data.fields:
            field_id = f"FLD-{int(time.time() * 1000)}-{field_data.label[:4].upper()}"
            field = FormField(
                id=field_id,
                section_id=section_id,
                field_type=field_data.field_type,
                label=field_data.label,
                placeholder=field_data.placeholder,
                help_text=field_data.help_text,
                default_value=field_data.default_value,
                is_required=field_data.is_required,
                is_read_only=field_data.is_read_only,
                is_hidden=field_data.is_hidden,
                sort_order=field_data.sort_order,
                validation_rules=field_data.validation_rules,
                metadata_=field_data.metadata,
            )
            db.add(field)
            await db.flush()

            for opt_data in field_data.options:
                opt_id = f"OPT-{int(time.time() * 1000)}-{opt_data.value[:4].upper()}"
                option = FieldOption(
                    id=opt_id,
                    field_id=field_id,
                    label=opt_data.label,
                    value=opt_data.value,
                    sort_order=opt_data.sort_order,
                )
                db.add(option)

    await db.commit()
    return await get_form(form_id, db)


@router.put("/{form_id}", response_model=FormRead)
async def update_form(
    form_id: str,
    data: FormUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    result = await db.execute(select(Form).where(Form.id == form_id))
    form = result.scalar_one_or_none()
    if not form:
        raise HTTPException(404, detail="Form not found")

    if data.name is not None:
        form.name = data.name
    if data.entity_type is not None:
        form.entity_type = data.entity_type
    if data.description is not None:
        form.description = data.description
    if data.is_active is not None:
        form.is_active = data.is_active

    if data.sections is not None:
        await db.execute(delete(FormField).where(FormField.section_id.in_(
            select(FormSection.id).where(FormSection.form_id == form_id)
        )))
        await db.execute(delete(FieldOption).where(FieldOption.field_id.in_(
            select(FormField.id).where(FormField.section_id.in_(
                select(FormSection.id).where(FormSection.form_id == form_id)
            ))
        )))
        await db.execute(delete(FormSection).where(FormSection.form_id == form_id))

        for section_data in data.sections:
            section_id = f"SEC-{int(time.time() * 1000)}-{section_data.name[:4].upper()}"
            section = FormSection(
                id=section_id,
                form_id=form_id,
                name=section_data.name,
                description=section_data.description,
                sort_order=section_data.sort_order,
            )
            db.add(section)
            await db.flush()

            for field_data in section_data.fields:
                field_id = f"FLD-{int(time.time() * 1000)}-{field_data.label[:4].upper()}"
                field = FormField(
                    id=field_id,
                    section_id=section_id,
                    field_type=field_data.field_type,
                    label=field_data.label,
                    placeholder=field_data.placeholder,
                    help_text=field_data.help_text,
                    default_value=field_data.default_value,
                    is_required=field_data.is_required,
                    is_read_only=field_data.is_read_only,
                    is_hidden=field_data.is_hidden,
                    sort_order=field_data.sort_order,
                    validation_rules=field_data.validation_rules,
                    metadata_=field_data.metadata,
                )
                db.add(field)
                await db.flush()

                for opt_data in field_data.options:
                    opt_id = f"OPT-{int(time.time() * 1000)}-{opt_data.value[:4].upper()}"
                    option = FieldOption(
                        id=opt_id,
                        field_id=field_id,
                        label=opt_data.label,
                        value=opt_data.value,
                        sort_order=opt_data.sort_order,
                    )
                    db.add(option)

    await db.commit()
    return await get_form(form_id, db)


@router.delete("/{form_id}", status_code=204)
async def delete_form(
    form_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    result = await db.execute(select(Form).where(Form.id == form_id))
    form = result.scalar_one_or_none()
    if not form:
        raise HTTPException(404, detail="Form not found")

    await db.execute(delete(FormField).where(FormField.section_id.in_(
        select(FormSection.id).where(FormSection.form_id == form_id)
    )))
    await db.execute(delete(FieldOption).where(FieldOption.field_id.in_(
        select(FormField.id).where(FormField.section_id.in_(
            select(FormSection.id).where(FormSection.form_id == form_id)
        ))
    )))
    await db.execute(delete(FormSection).where(FormSection.form_id == form_id))
    await db.delete(form)
    await db.commit()
