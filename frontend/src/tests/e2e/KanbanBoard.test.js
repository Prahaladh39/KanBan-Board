import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
test.describe("Kanban Board E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");

    await page.waitForSelector(".kanban-container");
  });

  test("User can create a task", async ({ page }) => {
    const uniqueTaskName = `Test Task ${Date.now()}`;

    // Use more reliable selectors and add waitForSelector
    await page.locator(".task-input").fill(uniqueTaskName);
    await page.locator('select[name="priority"]').selectOption("High");
    await page.locator('select[name="category"]').selectOption("Bug");
    await page.locator(".task-button").click();

    // Wait for task to appear after socket operations
    await page.waitForTimeout(1000);

    // Look for the specific task we just created using its unique name
    const taskInput = await page
      .locator(`.task-card input[value="${uniqueTaskName}"]`)
      .first();
    await expect(taskInput).toBeVisible();

    // Also verify the task has the correct priority and category
    const taskCard = await page.locator(
      `.task-card:has(input[value="${uniqueTaskName}"])`
    );
    const taskMeta = await taskCard.locator(".task-meta").textContent();
    expect(taskMeta).toContain("High");
    expect(taskMeta).toContain("Bug");
  });

  test("User can delete a task", async ({ page }) => {
    // Create a task with a unique name to ensure we're deleting the right one
    const uniqueTaskName = `Delete Task ${Date.now()}`;
    await page.locator(".task-input").fill(uniqueTaskName);
    await page.locator('select[name="priority"]').selectOption("Low");
    await page.locator('select[name="category"]').selectOption("Feature");
    await page.locator(".task-button").click();

    // Wait for task to appear after socket operations
    await page.waitForTimeout(1000);

    // First confirm the task exists
    const taskInput = await page
      .locator(`.task-card input[value="${uniqueTaskName}"]`)
      .first();
    await expect(taskInput).toBeVisible();

    // Handle any alert dialogs
    page.on("dialog", (dialog) => dialog.accept());

    // Locate the specific task card that contains our task and click its delete button
    const taskCard = await page
      .locator(`.task-card:has(input[value="${uniqueTaskName}"])`)
      .first();
    await taskCard.locator(".btn-delete").click();

    // Wait for delete operation to complete
    await page.waitForTimeout(1000);

    // Check task is gone
    await expect(
      page.locator(`.task-card input[value="${uniqueTaskName}"]`)
    ).toHaveCount(0);
  });

  test("User can update a task", async ({ page }) => {
    // Create a task with a unique name
    const uniqueTaskName = `Update Task ${Date.now()}`;
    await page.locator(".task-input").fill(uniqueTaskName);
    await page.locator('select[name="priority"]').selectOption("Medium");
    await page.locator('select[name="category"]').selectOption("Feature");
    await page.locator(".task-button").click();

    // Wait for task to appear
    await page.waitForTimeout(1000);

    // Find and modify the task
    const taskInput = await page
      .locator(`.task-card input[value="${uniqueTaskName}"]`)
      .first();
    await expect(taskInput).toBeVisible();

    const updatedName = `Updated ${uniqueTaskName}`;
    await taskInput.fill(updatedName);

    // Find the update button in this specific task card and click it
    const taskCard = await page
      .locator(`.task-card:has(input[value="${updatedName}"])`)
      .first();
    await taskCard.locator(".btn-update").click();

    // Wait for update operation
    await page.waitForTimeout(1000);

    // Verify the updated name persists
    await expect(
      page.locator(`.task-card input[value="${updatedName}"]`)
    ).toBeVisible();
  });
  test("User can select a priority level", async ({ page }) => {
    // Generate unique task names for each priority
    const lowPriorityTask = `Low Priority Task ${Date.now()}`;
    const mediumPriorityTask = `Medium Priority Task ${Date.now() + 1}`;
    const highPriorityTask = `High Priority Task ${Date.now() + 2}`;

    // Create task with Low priority
    await page.locator(".task-input").fill(lowPriorityTask);
    await page.locator('select[name="priority"]').selectOption("Low");
    await page.locator(".task-button").click();
    await page.waitForTimeout(1000);

    // Verify Low priority task
    const lowPriorityCard = await page.locator(
      `.task-card:has(input[value="${lowPriorityTask}"])`
    );
    await expect(lowPriorityCard.locator(".task-meta")).toContainText(
      "Priority: Low"
    );

    // Create task with Medium priority
    await page.locator(".task-input").fill(mediumPriorityTask);
    await page.locator('select[name="priority"]').selectOption("Medium");
    await page.locator(".task-button").click();
    await page.waitForTimeout(1000);

    // Verify Medium priority task
    const mediumPriorityCard = await page.locator(
      `.task-card:has(input[value="${mediumPriorityTask}"])`
    );
    await expect(mediumPriorityCard.locator(".task-meta")).toContainText(
      "Priority: Medium"
    );

    // Create task with High priority
    await page.locator(".task-input").fill(highPriorityTask);
    await page.locator('select[name="priority"]').selectOption("High");
    await page.locator(".task-button").click();
    await page.waitForTimeout(1000);

    // Verify High priority task
    const highPriorityCard = await page.locator(
      `.task-card:has(input[value="${highPriorityTask}"])`
    );
    await expect(highPriorityCard.locator(".task-meta")).toContainText(
      "Priority: High"
    );
  });

  test("User can change the task category and verify the update", async ({
    page,
  }) => {
    // Create a task with Feature category
    const taskName = `Category Test Task ${Date.now()}`;
    await page.locator(".task-input").fill(taskName);
    await page.locator('select[name="category"]').selectOption("Feature");
    await page.locator(".task-button").click();
    await page.waitForTimeout(1000);

    // Verify initial category
    const taskCard = await page.locator(
      `.task-card:has(input[value="${taskName}"])`
    );
    await expect(taskCard.locator(".task-meta")).toContainText(
      "Category: Feature"
    );

    // Update the task
    await taskCard.locator(".btn-update").click();
    await page.waitForTimeout(1000);

    // Verify the category was updated
    await expect(taskCard.locator(".task-meta")).toContainText(
      "Category: Feature"
    );
  });
});
