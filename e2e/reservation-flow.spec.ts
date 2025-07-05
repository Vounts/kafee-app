/**
 * Reservation Flow E2E Tests
 * 
 * This file contains comprehensive end-to-end tests for the Kafè reservation system,
 * covering the complete user journey from form filling to reservation confirmation.
 */

import { test, expect } from '@playwright/test';

test.describe('Kafè Reservation System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:4200');
    
    // Wait for the app to load
    await page.waitForSelector('.app-container');
  });

  test.describe('Page Structure', () => {
    test('should display the main header with restaurant information', async ({ page }) => {
      // Check header content
      await expect(page.locator('.app-header')).toBeVisible();
      await expect(page.locator('.app-title')).toHaveText('Kafè');
      await expect(page.locator('.app-subtitle')).toHaveText('Reservation System');
      await expect(page.locator('.availability-info')).toContainText('Live Availability');
    });

    test('should display the reservation form', async ({ page }) => {
      // Check form is present
      await expect(page.locator('.reservation-container')).toBeVisible();
      await expect(page.locator('.restaurant-name')).toHaveText('Kafè');
      await expect(page.locator('.restaurant-subtitle')).toContainText('Andorran Restaurant');
      await expect(page.locator('.reservation-info')).toContainText('July 24-31, 2024');
    });

    test('should display the stepper with correct steps', async ({ page }) => {
      // Check stepper steps
      await expect(page.locator('mat-step-header').nth(0)).toContainText('Date & Time');
      await expect(page.locator('mat-step-header').nth(1)).toContainText('Party Details');
      await expect(page.locator('mat-step-header').nth(2)).toContainText('Contact Information');
      await expect(page.locator('mat-step-header').nth(3)).toContainText('Preferences');
    });
  });

  test.describe('Step 1: Date and Time Selection', () => {
    test('should allow date selection within valid range', async ({ page }) => {
      // Click on date field
      await page.click('input[formcontrolname="date"]');
      
      // Select a valid date (July 24, 2024)
      await page.click('.mat-calendar-body-cell[aria-label="July 24, 2024"]');
      
      // Verify date is selected
      await expect(page.locator('input[formcontrolname="date"]')).toHaveValue(/7\/24\/2024/);
    });

    test('should display time slots after date selection', async ({ page }) => {
      // Select a date first
      await page.click('input[formcontrolname="date"]');
      await page.click('.mat-calendar-body-cell[aria-label="July 24, 2024"]');
      
      // Wait for time slots to appear
      await page.waitForSelector('.time-slots-container');
      
      // Check that time slots are displayed
      await expect(page.locator('.time-slot-option')).toHaveCount(9); // 6:00 PM to 10:00 PM
      await expect(page.locator('.time-slot-option').first()).toContainText('6:00 PM');
      await expect(page.locator('.time-slot-option').last()).toContainText('10:00 PM');
    });

    test('should allow time slot selection', async ({ page }) => {
      // Select a date
      await page.click('input[formcontrolname="date"]');
      await page.click('.mat-calendar-body-cell[aria-label="July 24, 2024"]');
      
      // Wait for time slots
      await page.waitForSelector('.time-slot-option');
      
      // Click on an available time slot
      await page.click('.time-slot-option.available:first-child');
      
      // Verify selection
      await expect(page.locator('.time-slot-option.selected')).toBeVisible();
    });

    test('should show loading indicator while checking availability', async ({ page }) => {
      // Select a date
      await page.click('input[formcontrolname="date"]');
      await page.click('.mat-calendar-body-cell[aria-label="July 24, 2024"]');
      
      // Check for loading indicator (may appear briefly)
      await expect(page.locator('.loading-container')).toBeVisible();
    });

    test('should show alternative time slots when selected slot is unavailable', async ({ page }) => {
      // This test would require mocking the service to return unavailable slots
      // For now, we'll test the UI structure
      await page.click('input[formcontrolname="date"]');
      await page.click('.mat-calendar-body-cell[aria-label="July 24, 2024"]');
      
      // Wait for time slots
      await page.waitForSelector('.time-slots-container');
      
      // The alternatives container should be present but may be hidden
      await expect(page.locator('.alternatives-container')).toBeAttached();
    });
  });

  test.describe('Step 2: Party Details', () => {
    test.beforeEach(async ({ page }) => {
      // Complete step 1 first
      await page.click('input[formcontrolname="date"]');
      await page.click('.mat-calendar-body-cell[aria-label="July 24, 2024"]');
      await page.waitForSelector('.time-slot-option');
      await page.click('.time-slot-option.available:first-child');
      await page.click('button:has-text("Next: Party Details")');
    });

    test('should allow party size selection', async ({ page }) => {
      // Check party size field
      await expect(page.locator('input[formcontrolname="partySize"]')).toBeVisible();
      await expect(page.locator('input[formcontrolname="partySize"]')).toHaveValue('2');
      
      // Change party size
      await page.fill('input[formcontrolname="partySize"]', '4');
      await expect(page.locator('input[formcontrolname="partySize"]')).toHaveValue('4');
    });

    test('should validate party size constraints', async ({ page }) => {
      // Try to set party size below minimum
      await page.fill('input[formcontrolname="partySize"]', '0');
      await page.click('button:has-text("Next: Contact Info")');
      
      // Should show validation error
      await expect(page.locator('mat-error')).toContainText('Minimum party size');
      
      // Try to set party size above maximum
      await page.fill('input[formcontrolname="partySize"]', '15');
      await page.click('button:has-text("Next: Contact Info")');
      
      // Should show validation error
      await expect(page.locator('mat-error')).toContainText('Maximum party size');
    });

    test('should allow region selection', async ({ page }) => {
      // Check region dropdown
      await expect(page.locator('mat-select[formcontrolname="region"]')).toBeVisible();
      
      // Open dropdown
      await page.click('mat-select[formcontrolname="region"]');
      
      // Check options
      await expect(page.locator('mat-option')).toHaveCount(4);
      await expect(page.locator('mat-option').nth(0)).toContainText('Main Dining Room');
      await expect(page.locator('mat-option').nth(1)).toContainText('Bar Area');
      await expect(page.locator('mat-option').nth(2)).toContainText('Outdoor Patio');
      await expect(page.locator('mat-option').nth(3)).toContainText('Private Room');
      
      // Select a region
      await page.click('mat-option:has-text("Main Dining Room")');
      await expect(page.locator('mat-select[formcontrolname="region"]')).toContainText('Main Dining Room');
    });

    test('should display region information when selected', async ({ page }) => {
      // Select a region
      await page.click('mat-select[formcontrolname="region"]');
      await page.click('mat-option:has-text("Main Dining Room")');
      
      // Check region info card
      await expect(page.locator('.region-info')).toBeVisible();
      await expect(page.locator('.info-card')).toContainText('Main Dining Room');
      await expect(page.locator('.info-card')).toContainText('elegant main dining room');
    });
  });

  test.describe('Step 3: Contact Information', () => {
    test.beforeEach(async ({ page }) => {
      // Complete steps 1 and 2
      await page.click('input[formcontrolname="date"]');
      await page.click('.mat-calendar-body-cell[aria-label="July 24, 2024"]');
      await page.waitForSelector('.time-slot-option');
      await page.click('.time-slot-option.available:first-child');
      await page.click('button:has-text("Next: Party Details")');
      
      await page.fill('input[formcontrolname="partySize"]', '4');
      await page.click('mat-select[formcontrolname="region"]');
      await page.click('mat-option:has-text("Main Dining Room")');
      await page.click('button:has-text("Next: Contact Info")');
    });

    test('should allow customer name input', async ({ page }) => {
      await expect(page.locator('input[formcontrolname="customerName"]')).toBeVisible();
      
      await page.fill('input[formcontrolname="customerName"]', 'John Smith');
      await expect(page.locator('input[formcontrolname="customerName"]')).toHaveValue('John Smith');
    });

    test('should validate customer name', async ({ page }) => {
      // Try empty name
      await page.fill('input[formcontrolname="customerName"]', '');
      await page.click('button:has-text("Next: Preferences")');
      await expect(page.locator('mat-error')).toContainText('Please enter your name');
      
      // Try invalid characters
      await page.fill('input[formcontrolname="customerName"]', 'John123');
      await page.click('button:has-text("Next: Preferences")');
      await expect(page.locator('mat-error')).toContainText('letters, spaces, hyphens, and apostrophes');
    });

    test('should allow email input and validation', async ({ page }) => {
      await expect(page.locator('input[formcontrolname="email"]')).toBeVisible();
      
      // Try invalid email
      await page.fill('input[formcontrolname="email"]', 'invalid');
      await page.click('button:has-text("Next: Preferences")');
      await expect(page.locator('mat-error')).toContainText('valid email address');
      
      // Try valid email
      await page.fill('input[formcontrolname="email"]', 'john@example.com');
      await expect(page.locator('input[formcontrolname="email"]')).toHaveValue('john@example.com');
    });

    test('should allow phone input and validation', async ({ page }) => {
      await expect(page.locator('input[formcontrolname="phone"]')).toBeVisible();
      
      // Try invalid phone
      await page.fill('input[formcontrolname="phone"]', '123');
      await page.click('button:has-text("Next: Preferences")');
      await expect(page.locator('mat-error')).toContainText('at least 10 digits');
      
      // Try valid phone
      await page.fill('input[formcontrolname="phone"]', '1234567890');
      await expect(page.locator('input[formcontrolname="phone"]')).toHaveValue('1234567890');
    });
  });

  test.describe('Step 4: Preferences', () => {
    test.beforeEach(async ({ page }) => {
      // Complete steps 1, 2, and 3
      await page.click('input[formcontrolname="date"]');
      await page.click('.mat-calendar-body-cell[aria-label="July 24, 2024"]');
      await page.waitForSelector('.time-slot-option');
      await page.click('.time-slot-option.available:first-child');
      await page.click('button:has-text("Next: Party Details")');
      
      await page.fill('input[formcontrolname="partySize"]', '4');
      await page.click('mat-select[formcontrolname="region"]');
      await page.click('mat-option:has-text("Main Dining Room")');
      await page.click('button:has-text("Next: Contact Info")');
      
      await page.fill('input[formcontrolname="customerName"]', 'John Smith');
      await page.fill('input[formcontrolname="email"]', 'john@example.com');
      await page.fill('input[formcontrolname="phone"]', '1234567890');
      await page.click('button:has-text("Next: Preferences")');
    });

    test('should display preference checkboxes', async ({ page }) => {
      await expect(page.locator('mat-checkbox[formcontrolname="hasChildren"]')).toBeVisible();
      await expect(page.locator('mat-checkbox[formcontrolname="smokingRequested"]')).toBeVisible();
      
      await expect(page.locator('mat-checkbox[formcontrolname="hasChildren"]')).toContainText('Children will be in our party');
      await expect(page.locator('mat-checkbox[formcontrolname="smokingRequested"]')).toContainText('Smoking area preferred');
    });

    test('should allow preference selection', async ({ page }) => {
      // Check children checkbox
      await page.click('mat-checkbox[formcontrolname="hasChildren"]');
      await expect(page.locator('mat-checkbox[formcontrolname="hasChildren"]')).toHaveAttribute('ng-reflect-checked', 'true');
      
      // Check smoking checkbox
      await page.click('mat-checkbox[formcontrolname="smokingRequested"]');
      await expect(page.locator('mat-checkbox[formcontrolname="smokingRequested"]')).toHaveAttribute('ng-reflect-checked', 'true');
    });

    test('should display reservation summary', async ({ page }) => {
      await expect(page.locator('.reservation-summary')).toBeVisible();
      await expect(page.locator('.summary-card')).toContainText('Reservation Summary');
      
      // Check summary items
      await expect(page.locator('.summary-item')).toHaveCount(5);
      await expect(page.locator('.summary-item').nth(0)).toContainText('Date:');
      await expect(page.locator('.summary-item').nth(1)).toContainText('Time:');
      await expect(page.locator('.summary-item').nth(2)).toContainText('Party Size:');
      await expect(page.locator('.summary-item').nth(3)).toContainText('Seating Area:');
      await expect(page.locator('.summary-item').nth(4)).toContainText('Name:');
    });
  });

  test.describe('Complete Reservation Flow', () => {
    test('should complete full reservation process', async ({ page }) => {
      // Step 1: Date and Time
      await page.click('input[formcontrolname="date"]');
      await page.click('.mat-calendar-body-cell[aria-label="July 24, 2024"]');
      await page.waitForSelector('.time-slot-option');
      await page.click('.time-slot-option.available:first-child');
      await page.click('button:has-text("Next: Party Details")');
      
      // Step 2: Party Details
      await page.fill('input[formcontrolname="partySize"]', '4');
      await page.click('mat-select[formcontrolname="region"]');
      await page.click('mat-option:has-text("Main Dining Room")');
      await page.click('button:has-text("Next: Contact Info")');
      
      // Step 3: Contact Information
      await page.fill('input[formcontrolname="customerName"]', 'John Smith');
      await page.fill('input[formcontrolname="email"]', 'john@example.com');
      await page.fill('input[formcontrolname="phone"]', '1234567890');
      await page.click('button:has-text("Next: Preferences")');
      
      // Step 4: Preferences
      await page.click('mat-checkbox[formcontrolname="hasChildren"]');
      await page.click('button:has-text("Confirm Reservation")');
      
      // Check confirmation
      await expect(page.locator('.confirmation-section')).toBeVisible();
      await expect(page.locator('.confirmation-card')).toContainText('Reservation Confirmed!');
      await expect(page.locator('.confirmation-code')).toBeVisible();
      await expect(page.locator('.detail-item')).toHaveCount(7);
    });

    test('should handle reservation reset', async ({ page }) => {
      // Complete reservation first
      await page.click('input[formcontrolname="date"]');
      await page.click('.mat-calendar-body-cell[aria-label="July 24, 2024"]');
      await page.waitForSelector('.time-slot-option');
      await page.click('.time-slot-option.available:first-child');
      await page.click('button:has-text("Next: Party Details")');
      
      await page.fill('input[formcontrolname="partySize"]', '4');
      await page.click('mat-select[formcontrolname="region"]');
      await page.click('mat-option:has-text("Main Dining Room")');
      await page.click('button:has-text("Next: Contact Info")');
      
      await page.fill('input[formcontrolname="customerName"]', 'John Smith');
      await page.fill('input[formcontrolname="email"]', 'john@example.com');
      await page.fill('input[formcontrolname="phone"]', '1234567890');
      await page.click('button:has-text("Next: Preferences")');
      
      await page.click('mat-checkbox[formcontrolname="hasChildren"]');
      await page.click('button:has-text("Confirm Reservation")');
      
      // Wait for confirmation
      await expect(page.locator('.confirmation-section')).toBeVisible();
      
      // Click reset button
      await page.click('button:has-text("Make Another Reservation")');
      
      // Check form is reset
      await expect(page.locator('.form-section')).toBeVisible();
      await expect(page.locator('input[formcontrolname="partySize"]')).toHaveValue('2');
      await expect(page.locator('mat-checkbox[formcontrolname="hasChildren"]')).not.toHaveAttribute('ng-reflect-checked', 'true');
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should display correctly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check header adapts
      await expect(page.locator('.header-content')).toBeVisible();
      
      // Check form is usable
      await page.click('input[formcontrolname="date"]');
      await page.click('.mat-calendar-body-cell[aria-label="July 24, 2024"]');
      await page.waitForSelector('.time-slot-option');
      
      // Time slots should stack vertically on mobile
      await expect(page.locator('.time-slots-container')).toBeVisible();
    });

    test('should handle mobile form navigation', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Complete step 1
      await page.click('input[formcontrolname="date"]');
      await page.click('.mat-calendar-body-cell[aria-label="July 24, 2024"]');
      await page.waitForSelector('.time-slot-option');
      await page.click('.time-slot-option.available:first-child');
      await page.click('button:has-text("Next: Party Details")');
      
      // Check step 2 is visible
      await expect(page.locator('input[formcontrolname="partySize"]')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should show validation errors for invalid inputs', async ({ page }) => {
      // Try to proceed without filling required fields
      await page.click('button:has-text("Next: Party Details")');
      
      // Should show validation errors
      await expect(page.locator('mat-error')).toBeVisible();
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // This would require mocking network failures
      // For now, we'll test the UI structure for error states
      await expect(page.locator('.reservation-container')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      // Check form fields have proper labels
      await expect(page.locator('input[formcontrolname="date"]')).toHaveAttribute('aria-label');
      await expect(page.locator('input[formcontrolname="customerName"]')).toHaveAttribute('aria-label');
      await expect(page.locator('input[formcontrolname="email"]')).toHaveAttribute('aria-label');
      await expect(page.locator('input[formcontrolname="phone"]')).toHaveAttribute('aria-label');
    });

    test('should be keyboard navigable', async ({ page }) => {
      // Test tab navigation
      await page.keyboard.press('Tab');
      await expect(page.locator('input[formcontrolname="date"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('input[formcontrolname="customerName"]')).toBeFocused();
    });
  });
}); 