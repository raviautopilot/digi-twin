import { test, expect } from '@playwright/test';

test.describe('Configuration Page CRUD Operations', () => {
  // Generate random strings to make records unique and isolated per run
  const rand = Math.random().toString(36).substring(7).toUpperCase();
  const moduleCode = `T_MOD_${rand}`;
  const typeCode = `T_TYP_${rand}`;
  const valCode1 = `T_VL1_${rand}`;
  const valCode2 = `T_VL2_${rand}`;

  test.beforeEach(async ({ page }) => {
    // Log browser console messages
    page.on('console', msg => {
      console.log(`BROWSER CONSOLE [${msg.type()}]:`, msg.text());
    });

    // Log network responses that are not successful
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`NETWORK ERROR RESPONSE [${response.status()}] ${response.url()}`);
      }
    });

    // Navigate directly to the Configuration Page
    await page.goto('/config');
    // Verify the page title to ensure it's loaded
    await expect(page.locator('h1')).toContainText('Configuration Control Plane');
  });

  test('should successfully execute CRUD workflow across Modules, Types, Values and Dependencies', async ({ page }) => {
    // ==========================================
    // 1. MODULES TAB (CRUD)
    // ==========================================
    console.log('Starting Modules CRUD for:', moduleCode);
    
    // Tab click
    await page.locator('[testid="config-tab-modules"]').click();

    // Create
    await page.locator('[testid="config-add-btn"]').click();
    await page.locator('[testid="module-form-code-input"]').fill(moduleCode);
    await page.locator('[testid="module-form-name-input"]').fill(`Test Module Name ${rand}`);
    await page.locator('[testid="module-form-desc-input"]').fill('Test Module Description');
    await page.locator('[testid="config-drawer-submit-btn"]').click();
    
    // Wait for drawer to close
    await expect(page.locator('[testid="config-drawer-close-btn"]')).toBeHidden();

    // Verify creation in table
    await page.locator('[testid="config-search-input"]').fill(moduleCode);
    await expect(page.locator('table')).toContainText(moduleCode);

    // Edit/Update
    await page.locator(`[testid="config-edit-btn-${moduleCode}"]`).click();
    await page.locator('[testid="module-form-name-input"]').fill(`Updated Module Name ${rand}`);
    await page.locator('[testid="config-drawer-submit-btn"]').click();
    
    // Wait for drawer to close
    await expect(page.locator('[testid="config-drawer-close-btn"]')).toBeHidden();
    
    // Verify update
    await expect(page.locator('table')).toContainText(`Updated Module Name ${rand}`);
    await page.locator('[testid="config-search-input"]').fill('');

    // ==========================================
    // 2. CONFIG TYPES TAB (CRUD)
    // ==========================================
    console.log('Starting Config Types CRUD for:', typeCode);

    // Tab click
    await page.locator('[testid="config-tab-types"]').click();

    // Create
    await page.locator('[testid="config-add-btn"]').click();
    await page.locator('[testid="type-form-code-input"]').fill(typeCode);
    await page.locator('[testid="type-form-module-select"]').selectOption({ value: moduleCode });
    await page.locator('[testid="type-form-name-input"]').fill(`Test Type Name ${rand}`);
    await page.locator('[testid="type-form-desc-input"]').fill('Test Type Description');
    await page.locator('[testid="config-drawer-submit-btn"]').click();
    
    // Wait for drawer to close
    await expect(page.locator('[testid="config-drawer-close-btn"]')).toBeHidden();

    // Verify creation in table
    await page.locator('[testid="config-search-input"]').fill(typeCode);
    await expect(page.locator('table')).toContainText(typeCode);

    // Edit/Update
    await page.locator(`[testid="config-edit-btn-${typeCode}"]`).click();
    await page.locator('[testid="type-form-name-input"]').fill(`Updated Type Name ${rand}`);
    await page.locator('[testid="config-drawer-submit-btn"]').click();
    
    // Wait for drawer to close
    await expect(page.locator('[testid="config-drawer-close-btn"]')).toBeHidden();

    // Verify update
    await expect(page.locator('table')).toContainText(`Updated Type Name ${rand}`);
    await page.locator('[testid="config-search-input"]').fill('');

    // ==========================================
    // 3. CONFIG VALUES TAB (CRUD)
    // ==========================================
    console.log('Starting Config Values CRUD for:', valCode1, 'and', valCode2);

    // Tab click
    await page.locator('[testid="config-tab-values"]').click();

    // Create Value 1
    await page.locator('[testid="config-add-btn"]').click();
    await page.locator('[testid="value-form-code-input"]').fill(valCode1);
    await page.locator('[testid="value-form-type-select"]').selectOption({ value: typeCode });
    await page.locator('[testid="value-form-value-input"]').fill('First Value Content');
    await page.locator('[testid="value-form-desc-input"]').fill('Value 1 Description');
    await page.locator('[testid="config-drawer-submit-btn"]').click();
    
    // Wait for drawer to close
    await expect(page.locator('[testid="config-drawer-close-btn"]')).toBeHidden();

    // Verify creation
    await page.locator('[testid="config-search-input"]').fill(valCode1);
    await expect(page.locator('table')).toContainText(valCode1);
    await page.locator('[testid="config-search-input"]').fill('');

    // Create Value 2
    await page.locator('[testid="config-add-btn"]').click();
    await page.locator('[testid="value-form-code-input"]').fill(valCode2);
    await page.locator('[testid="value-form-type-select"]').selectOption({ value: typeCode });
    await page.locator('[testid="value-form-value-input"]').fill('Second Value Content');
    await page.locator('[testid="value-form-desc-input"]').fill('Value 2 Description');
    await page.locator('[testid="config-drawer-submit-btn"]').click();
    
    // Wait for drawer to close
    await expect(page.locator('[testid="config-drawer-close-btn"]')).toBeHidden();

    // Verify creation
    await page.locator('[testid="config-search-input"]').fill(valCode2);
    await expect(page.locator('table')).toContainText(valCode2);

    // Edit/Update Value 2
    await page.locator(`[testid="config-edit-btn-${valCode2}"]`).click();
    await page.locator('[testid="value-form-value-input"]').fill('Updated Second Value Content');
    await page.locator('[testid="config-drawer-submit-btn"]').click();
    
    // Wait for drawer to close
    await expect(page.locator('[testid="config-drawer-close-btn"]')).toBeHidden();

    // Verify update
    await expect(page.locator('table')).toContainText('Updated Second Value Content');
    await page.locator('[testid="config-search-input"]').fill('');

    // ==========================================
    // 4. DEPENDENCIES TAB (CRUD)
    // ==========================================
    console.log('Starting Dependencies CRUD');

    // Tab click
    await page.locator('[testid="config-tab-dependencies"]').click();

    // Create Dependency (valCode1 -> valCode2)
    await page.locator('[testid="config-add-btn"]').click();
    await page.locator('[testid="dep-form-parent-select"]').selectOption({ value: valCode1 });
    await page.locator('[testid="dep-form-child-select"]').selectOption({ value: valCode2 });
    await page.locator('[testid="dep-form-type-input"]').fill('REQUIRES');
    await page.locator('[testid="config-drawer-submit-btn"]').click();
    
    // Wait for drawer to close
    await expect(page.locator('[testid="config-drawer-close-btn"]')).toBeHidden();

    // Verify creation
    await page.locator('[testid="config-search-input"]').fill(valCode1);
    await expect(page.locator('table')).toContainText(valCode1);
    await expect(page.locator('table')).toContainText(valCode2);

    // Edit/Update Dependency
    await page.locator(`[testid="config-edit-btn-${valCode1}-${valCode2}"]`).click();
    await page.locator('[testid="dep-form-type-input"]').fill('COMPATIBLE');
    await page.locator('[testid="config-drawer-submit-btn"]').click();
    
    // Wait for drawer to close
    await expect(page.locator('[testid="config-drawer-close-btn"]')).toBeHidden();

    // Verify update
    await expect(page.locator('table')).toContainText('COMPATIBLE');

    // Delete Dependency
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await page.locator(`[testid="config-delete-btn-${valCode1}-${valCode2}"]`).click();

    // Verify deletion
    await expect(page.locator('body')).not.toContainText(valCode2);
    await page.locator('[testid="config-search-input"]').fill('');

    // ==========================================
    // 5. CLEANUP / DELETE CREATED ENTITIES
    // ==========================================
    console.log('Starting cleanup');

    // Delete Value 2
    await page.locator('[testid="config-tab-values"]').click();
    await page.locator('[testid="config-search-input"]').fill(valCode2);
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await page.locator(`[testid="config-delete-btn-${valCode2}"]`).click();
    await expect(page.locator('body')).not.toContainText(valCode2);
    await page.locator('[testid="config-search-input"]').fill('');

    // Delete Value 1
    await page.locator('[testid="config-search-input"]').fill(valCode1);
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await page.locator(`[testid="config-delete-btn-${valCode1}"]`).click();
    await expect(page.locator('body')).not.toContainText(valCode1);
    await page.locator('[testid="config-search-input"]').fill('');

    // Delete Type
    await page.locator('[testid="config-tab-types"]').click();
    await page.locator('[testid="config-search-input"]').fill(typeCode);
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await page.locator(`[testid="config-delete-btn-${typeCode}"]`).click();
    await expect(page.locator('body')).not.toContainText(typeCode);
    await page.locator('[testid="config-search-input"]').fill('');

    // Delete Module
    await page.locator('[testid="config-tab-modules"]').click();
    await page.locator('[testid="config-search-input"]').fill(moduleCode);
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await page.locator(`[testid="config-delete-btn-${moduleCode}"]`).click();
    await expect(page.locator('body')).not.toContainText(moduleCode);
    await page.locator('[testid="config-search-input"]').fill('');
  });
});
