# NexusERP Digi-Twin: Findings, Technical Analysis & TODO Roadmap

## 1. Executive Summary

This document captures the architectural findings, technical root-cause analyses, and prioritized action items resulting from refactoring `shared/digi-twin` to match the modern design system and UI layout of `shared/figma-twin-raw` while preserving all existing test IDs, API integrations, and automation contracts.

---

## 2. Completed UI Modernization Achievements

Parity with `shared/figma-twin-raw` has been achieved across all primary views in `shared/digi-twin`:

- [x] **Global Styling & Theme System (`src/index.css`, `index.html`):**
  - Modern dark canvas (`#0a0e17` background, `#0d1421` shell, `#111827` cards, `#1e293b` borders, and `#06b6d4` cyan primary).
  - Google Fonts integration with preconnect headers: **Inter** (interface typography) and **JetBrains Mono** (codes, timestamps, identifiers).
  - Slim dark scrollbars with subtle track borders.
- [x] **Collapsible Navigation Shell (`src/components/Layout.tsx`, `src/App.tsx`):**
  - Collapsible sidebar (`w-52` expanded $\leftrightarrow$ `w-14` collapsed) with distinct icon-only tooltips.
  - Grouped categories: **Preset** (Dashboard), **Core** (CRM, Finance, HR, Manufacturing, Inventory), **Operations** (Schedules, Health, Learning, Shopping), **Custom Modules** (stored in `localStorage`), and **System** (Configuration, Base Entities).
  - Dynamic **+ Add Custom Module** modal with color palette and icon pickers.
  - Top header with search, user badge, and **live health pollers** for Config (port `1705`) and Core (port `1706`) services.
- [x] **Configuration Control Plane (`src/pages/ConfigPage.tsx`):**
  - Wizard breadcrumb trail with context drill-downs (Module $\to$ Type $\to$ Value $\to$ Dependency).
  - 4-Step selector header displaying live record counts for **Modules**, **Types**, **Values**, and **Dependencies**.
  - Monospace `CodeTag`, `StatusBadge` (Active/Inactive), and `DepTypeBadge` (Requires, Excludes, Supersedes, Derived From, Compatible).
  - Slide-over form drawer with dark styling, real-time validation error alerts, and draft session recovery (`localStorage`).
  - Floating toast notification stack with auto-dismissal.
  - 100% preservation of test IDs (`config-tab-*`, `config-add-btn`, `config-search-input`, `config-drawer-*`, form inputs, `config-edit-btn-*`, `config-delete-btn-*`).
- [x] **Modular ERP Views (`src/pages/ModulePage.tsx`, `src/pages/Dashboard.tsx`):**
  - Interactive KPI cards with formatted values and positive/negative trend deltas.
  - Recent activity feed showing actors, actions, targets, and relative timestamps.
  - Interactive data tables with column mappings for CRM, Finance, HR, Manufacturing, Inventory, Schedules, Health, Learning, Shopping, and custom modules.
- [x] **Compilation:** `npm run build` succeeds cleanly with **0 errors**.

---

## 3. Technical Findings & Root Cause Analysis

### Finding 1: PostgreSQL Trigger Soft-Delete Blindspot (SQLSTATE 23503)

- **Source File:** `shared/twin-db/twin-sqls/01_config/triggers/0001_check_fk_references.sql` (and `shared/twin-db/twin-sqls/migration_scripts/V1.0.0__initial_schema.sql`).
- **Trigger Function:** `config.check_foreign_key_references()` attached to `BEFORE UPDATE ON config.cfg_modules`, `cfg_types`, and `cfg_values`.
- **Observed Behavior:**
  When deleting a value that was previously part of a dependency (even after the dependency was deleted), the API returns HTTP 500:
  ```
  Cannot delete/deactivate T_VL2_... because it is referenced by records in config.cfg_dependencies
  ```
- **Technical Reasoning:**
  In `config.check_foreign_key_references()`:
  ```sql
  -- Find all foreign key constraints referencing the current table
  FOR r IN
      SELECT ns.nspname AS referencing_schema, cl.relname AS referencing_table, att.attname AS referencing_column
      ...
  LOOP
      -- DYNAMIC QUERY EXECUTION:
      EXECUTE format(
          'SELECT COUNT(*) FROM %I.%I WHERE %I = $1',
          r.referencing_schema, r.referencing_table, r.referencing_column
      ) INTO v_count USING v_ref_value;

      IF v_count > 0 THEN
          RAISE EXCEPTION 'Cannot delete/deactivate % because it is referenced by records in %.%',
              OLD.code, r.referencing_schema, r.referencing_table
              USING ERRCODE = 'foreign_key_violation';
      END IF;
  END LOOP;
  ```
  The dynamic query executes:
  ```sql
  SELECT COUNT(*) FROM config.cfg_dependencies WHERE child_value_code = $1
  ```
  **Root Cause:** The query counts **ALL** referencing rows regardless of soft-delete status. When a dependency is deleted, its row remains in the table with `deleted_at = CURRENT_TIMESTAMP` and `is_active = FALSE`. The trigger query does not check `AND (deleted_at IS NULL AND is_active = TRUE)`, causing soft-deleted referencing records to block parent deactivations.

---

### Finding 2: React 19 Custom Attribute Console Warnings

- **Observed Behavior:**
  React 19 outputs console errors when custom camelCase props are assigned directly to native HTML elements:
  ```
  React does not recognize the `testId` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `testid` instead.
  ```
- **Technical Reasoning:**
  Native DOM elements do not recognize camelCase custom attributes unless prefixed with `data-` or specified in all-lowercase. Playwright tests query `[testid="..."]` via CSS attribute selector.
- **Resolution:**
  All native HTML elements in `ConfigPage.tsx` and custom components must standardize on lowercase `testid="..."`.

---

### Finding 3: Query Client Cache Invalidation on Delete Operations

- **Source File:** `shared/digi-twin/src/api/config.ts`
- **Observed Behavior:**
  When a row was deleted via the UI, TanStack Query's cache did not immediately reflect the deletion until an explicit background refetch completed.
- **Technical Reasoning:**
  `invalidateQueries` triggers a network refetch, but if a subsequent action occurs before the refetch completes (such as during fast automated tests), stale cache entries remain in memory.
- **Resolution:**
  Implemented optimistic/immediate cache eviction inside `onSuccess`:
  ```typescript
  queryClient.setQueriesData({ queryKey: ['config', entityType] }, (old: any) => {
    return Array.isArray(old) ? old.filter((item: any) => item.id !== id) : old;
  });
  ```

---

## 4. Prioritized Actionable TODO Roadmap

### Phase A: Backend & Database Fixes (Immediate)

- [ ] **TODO-1: Update PostgreSQL Trigger to Respect Soft Deletes**
  - **File:** `shared/twin-db/twin-sqls/01_config/triggers/0001_check_fk_references.sql`
  - **Action:** Modify the dynamic check to verify whether the referencing table contains `deleted_at` or `is_active` columns, and append `WHERE %I = $1 AND (deleted_at IS NULL OR is_active = TRUE)`:
    ```sql
    -- Check only active, non-soft-deleted references
    EXECUTE format(
        'SELECT COUNT(*) FROM %I.%I WHERE %I = $1 AND deleted_at IS NULL AND is_active = TRUE',
        r.referencing_schema, r.referencing_table, r.referencing_column
    ) INTO v_count USING v_ref_value;
    ```
  - **Apply:** Execute the updated trigger function in the running PostgreSQL instance (`localhost:5432`, database `twindb`).

- [ ] **TODO-2: Backend Cascade Soft-Delete or Validation Handler**
  - **File:** `services/rtwin/pkg/repository/pg/cfg_value.go`
  - **Action:** Ensure `DeleteValue` or `DeleteType` can gracefully cascade deactivation to associated dependencies or return descriptive 409 Conflict JSON errors instead of unhandled 500 internal server errors.

---

### Phase B: Frontend UI Polish & Consistency

- [ ] **TODO-3: Standardize All `testid` Attributes in `src/pages/CorePage.tsx`**
  - **File:** `shared/digi-twin/src/pages/CorePage.tsx`
  - **Action:** Replace camelCase `testId` with lowercase `testid` on all buttons and inputs to eliminate React 19 runtime console warnings.

- [ ] **TODO-4: Dynamic Record Count Hooks for Navigation Badges**
  - **File:** `shared/digi-twin/src/components/Layout.tsx`
  - **Action:** Display live record counters next to navigation labels for CRM, Finance, HR, and Configuration in the sidebar.

- [ ] **TODO-5: Dark Theme Polish on Base Entities (`CorePage.tsx`)**
  - **File:** `shared/digi-twin/src/pages/CorePage.tsx`
  - **Action:** Align table row hovering, borders, and modal styles in `CorePage.tsx` with the exact slate/cyan tokens used in `ConfigPage.tsx`.

---

### Phase C: End-to-End Verification & Automation

- [ ] **TODO-6: Run Full End-to-End Playwright Test Suite**
  - **File:** `shared/digi-twin/tests/config.spec.ts`
  - **Command:** `npx playwright test --reporter=list`
  - **Verification:** Verify all 5 stages pass cleanly:
    1. Modules CRUD
    2. Config Types CRUD
    3. Config Values CRUD
    4. Dependencies CRUD
    5. Entity Cleanup / Teardown

- [ ] **TODO-7: Synchronize Knowledge Graph**
  - **Command:** `graphify update .`
  - **Action:** Keep the repository AST knowledge graph synchronized per workspace rules.
