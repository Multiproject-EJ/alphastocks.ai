import { test, expect } from '@playwright/test'
import { DEVICE_PRESETS } from '../src/devtools/presets'

/**
 * Screenshot capture workflow for mobile QA
 * Captures screenshots of the game in various device presets and states
 */

test.describe('Mobile Device Screenshots', () => {
  // Enable devtools for all tests
  test.use({
    baseURL: 'http://localhost:5173/board-game-v3/?devtools=1',
  })

  // Create artifacts directory for screenshots
  const screenshotDir = 'artifacts/screenshots'

  for (const preset of DEVICE_PRESETS) {
    test.describe(`${preset.name} (${preset.width}x${preset.height})`, () => {
      test.use({
        viewport: {
          width: preset.width,
          height: preset.height,
        },
        deviceScaleFactor: preset.dpr,
      })

      test('board idle state', async ({ page }) => {
        // Navigate to the app
        await page.goto('/')

        // Wait for the app to load
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000) // Wait for animations

        // Take screenshot
        await page.screenshot({
          path: `${screenshotDir}/${preset.id}-idle.png`,
          fullPage: true,
        })
      })

      test('after roll action', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000)

        // Try to find and click the roll button
        // Look for the compact dice button or any roll button
        const rollButton = page.locator('button').filter({ hasText: /roll|dice/i }).first()
        
        if (await rollButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          await rollButton.click()
          await page.waitForTimeout(3000) // Wait for roll animation and movement
        }

        // Take screenshot
        await page.screenshot({
          path: `${screenshotDir}/${preset.id}-after-roll.png`,
          fullPage: true,
        })
      })

      test('with modal open', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000)

        // Try to open a modal (settings, shop, or any visible modal trigger)
        const settingsButton = page.locator('button').filter({ hasText: /settings|⚙️/i }).first()
        const shopButton = page.locator('button').filter({ hasText: /shop|🛒/i }).first()
        
        // Try settings first
        if (await settingsButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          await settingsButton.click()
          await page.waitForTimeout(1000)
        } else if (await shopButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          await shopButton.click()
          await page.waitForTimeout(1000)
        }

        // Take screenshot
        await page.screenshot({
          path: `${screenshotDir}/${preset.id}-modal-open.png`,
          fullPage: true,
        })
      })
    })
  }

  test('devtools overlay visible', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Try to find and click the devtools toggle button
    const devtoolsButton = page.locator('button').filter({ hasText: /🔧/ }).first()
    
    if (await devtoolsButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await devtoolsButton.click()
      await page.waitForTimeout(500)

      // Take screenshot with devtools overlay open
      await page.screenshot({
        path: `${screenshotDir}/devtools-overlay.png`,
        fullPage: true,
      })
    }
  })

  test('device preview panel', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Try to find and click the device preview toggle button
    const devicePreviewButton = page.locator('button').filter({ hasText: /📱/ }).first()
    
    if (await devicePreviewButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await devicePreviewButton.click()
      await page.waitForTimeout(500)

      // Take screenshot with device preview panel open
      await page.screenshot({
        path: `${screenshotDir}/device-preview-panel.png`,
        fullPage: true,
      })
    }
  })
})
