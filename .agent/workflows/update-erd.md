---
description: enforce maintenance of erd.md whenever models or migrations change
---

# Workflow: Maintain ERD Documentation

Every time a change is made to the database schema (via `backend/models/domain.py` or any files in `backend/migrations/versions/`), the Mermaid ERD in `docs/erd.md` must be updated to reflect the current state of the application's core data model.

### Steps:

1. **Identify Changes**: Review the modifications in `backend/models/domain.py` or the latest migration script.
2. **Open ERD**: Open `docs/erd.md`.
3. **Update Diagram**: 
    - Add/remove entities to match the classes in `domain.py`.
    - Update field names and types.
    - Ensure relationships (one-to-many, many-to-one) correctly represent the `Relationship` and `foreign_key` definitions in SQLModel.
4. **Commit Changes**: Save `docs/erd.md` as part of the same task that modified the schema.

### Mermaid Syntax Reference:
- `||--o{` for One-to-Many.
- `uuid id PK` for primary keys.
- `uuid other_id FK` for foreign keys.
- Common types: `string`, `int`, `datetime`, `json`, `uuid`, `bool`.
