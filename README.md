# mobile-automation

Here’s a step-by-step guide to set up an Appium mobile automation framework for Android and iOS using WebdriverIO, and run the same automated scripts for different devices in GitHub Actions.

1. Decide the execution model first

Before creating the framework, decide where devices will exist.

GitHub Actions can run jobs on Ubuntu, Windows, or macOS runners, and matrix jobs can run the same workflow multiple times with different variables. But GitHub Actions by itself does not magically provide your real phones. For mobile testing, you typically use either:

emulators/simulators started on the runner,

self-hosted runners with real devices attached, or

a cloud device farm.

For interviews, this is an excellent point to mention.

2. Install prerequisites on your local machine

Install:

Node.js

Java JDK

Android Studio for Android SDK/emulators

Xcode for iOS simulators on macOS

Appium 2

WebdriverIO project dependencies

WebdriverIO’s current docs show the latest major version as 9.x, and their Appium setup docs recommend using the Appium ecosystem tooling such as npx appium-installer to help with setup. Appium’s modern capability model also requires Appium-specific capabilities to use the appium: prefix.

Typical local setup:

mkdir mobile-automation
cd mobile-automation
npm init -y
npm install --save-dev @wdio/cli webdriverio @wdio/local-runner @wdio/mocha-framework @wdio/spec-reporter @wdio/appium-service appium

Then install Appium drivers you need:

appium driver install uiautomator2
appium driver install xcuitest

That driver-based install model is part of Appium 2’s architecture.

3. Create the WebdriverIO project

Initialize a WDIO config:

npx wdio config

Choose:

local runner

mocha or cucumber

spec reporter

Appium service

WebdriverIO’s configuration file is the central place for runner settings, specs, services, and capabilities. The Appium service is designed to help start and manage Appium when using WebdriverIO.

4. Create a clean project structure

Use a structure like this:

mobile-automation/
  .github/
    workflows/
      mobile.yml
  apps/
    android/
      app-debug.apk
    ios/
      MyApp.app
  config/
    devices.js
  test/
    specs/
      login.e2e.js
    pageobjects/
      login.page.js
  wdio.conf.js
  package.json

This keeps:

test code separate from device config

Android and iOS app binaries in one place

GitHub workflow separate from framework code

5. Externalize device capabilities

This is the most important design step.

Do not hardcode device details in test files. Put them in config/devices.js.

Example:

const path = require('path');

module.exports = {
  android_pixel_7: {
    platformName: 'Android',
    'appium:deviceName': 'Pixel 7',
    'appium:platformVersion': '14',
    'appium:automationName': 'UiAutomator2',
    'appium:app': path.resolve(__dirname, '../apps/android/app-debug.apk'),
    'appium:autoGrantPermissions': true,
    'appium:noReset': false
  },

  ios_iphone_15: {
    platformName: 'iOS',
    'appium:deviceName': 'iPhone 15',
    'appium:platformVersion': '17.0',
    'appium:automationName': 'XCUITest',
    'appium:app': path.resolve(__dirname, '../apps/ios/MyApp.app'),
    'appium:autoAcceptAlerts': true,
    'appium:noReset': false
  }
};

Appium’s official capabilities guide says Appium-specific extension capabilities must be namespaced with appium:.

6. Make the WDIO config dynamic

Your wdio.conf.js should read a device key from an environment variable and load the matching capability.

Example:

const devices = require('./config/devices');

const deviceKey = process.env.DEVICE_KEY;

if (!deviceKey || !devices[deviceKey]) {
  throw new Error(`Invalid or missing DEVICE_KEY: ${deviceKey}`);
}

exports.config = {
  runner: 'local',
  specs: ['./test/specs/**/*.js'],
  maxInstances: 1,

  hostname: '127.0.0.1',
  port: 4723,
  path: '/',

  capabilities: [devices[deviceKey]],

  logLevel: 'info',
  framework: 'mocha',
  reporters: ['spec'],

  mochaOpts: {
    ui: 'bdd',
    timeout: 120000
  },

  services: [
    ['appium', {
      command: 'appium'
    }]
  ]
};

This pattern works well because WebdriverIO treats capabilities as the target environment definition, while GitHub Actions can inject different environment values for each matrix job.

7. Add your test scripts

Create shared specs in test/specs.

Example:

describe('App launch', () => {
  it('should launch the app', async () => {
    const source = await browser.getPageSource();
    console.log(source.slice(0, 500));
  });
});

Then use page objects for maintainability.

Example login.page.js:

class LoginPage {
  get username() {
    return $('~username');
  }

  get password() {
    return $('~password');
  }

  get loginBtn() {
    return $('~login');
  }

  async login(user, pass) {
    await this.username.setValue(user);
    await this.password.setValue(pass);
    await this.loginBtn.click();
  }
}

module.exports = new LoginPage();
8. Add npm scripts

In package.json:

{
  "scripts": {
    "test:mobile": "wdio run wdio.conf.js"
  }
}

Now you can run locally like this:

DEVICE_KEY=android_pixel_7 npm run test:mobile

or

DEVICE_KEY=ios_iphone_15 npm run test:mobile
9. Verify local execution before GitHub Actions

Do this first:

confirm Android emulator or device is visible

confirm iOS simulator or device is available

confirm app launches manually

confirm Appium driver is installed

run one Android test locally

run one iOS test locally

This saves a lot of CI debugging time.

10. Create the GitHub Actions workflow

GitHub Actions matrix strategy lets one job definition run multiple times using different values. That is exactly what you need for “same scripts, different devices.”

Create .github/workflows/mobile.yml:

name: Mobile Automation

on:
  workflow_dispatch:
  push:
    branches: [ main ]
  pull_request:

jobs:
  mobile-tests:
    strategy:
      fail-fast: false
      matrix:
        include:
          - platform: android
            device_key: android_pixel_7
            runner: ubuntu-latest

          - platform: ios
            device_key: ios_iphone_15
            runner: macos-latest

    runs-on: ${{ matrix.runner }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Install Appium
        run: npm install -g appium

      - name: Install Appium drivers
        run: |
          appium driver install uiautomator2
          appium driver install xcuitest

      - name: Run Android tests
        if: matrix.platform == 'android'
        env:
          DEVICE_KEY: ${{ matrix.device_key }}
        run: |
          echo "Start Android emulator or connect Android device here"
          npm run test:mobile

      - name: Run iOS tests
        if: matrix.platform == 'ios'
        env:
          DEVICE_KEY: ${{ matrix.device_key }}
        run: |
          echo "Boot iOS simulator or connect iOS simulator/device here"
          npm run test:mobile

GitHub’s docs confirm matrix jobs and runner selection through runs-on, and hosted runners are available for Ubuntu and macOS.

11. Decide how devices are supplied in CI

You now need one of these setups.

Option A: Self-hosted runner with real devices

Best for teams with physical Android and iPhones connected to a Mac mini or lab machine.

GitHub supports self-hosted runners, which you manage yourself. This is often the most realistic choice for stable mobile CI.

Option B: Hosted runner + emulator/simulator

You can boot:

Android emulator on Ubuntu or macOS

iOS simulator on macOS

This is fine for smoke/regression suites, though setup is usually more involved.

Option C: Cloud device farm

Same framework, but capabilities point to BrowserStack/Sauce Labs/AWS Device Farm instead of a local Appium server.

For interviews, mention that the framework stays almost the same; only the execution environment changes.

12. Add secrets and environment config

If using:

cloud device farms

private app downloads

API keys

test credentials

store them in GitHub Secrets, then inject them into the workflow with secrets.*. GitHub Actions supports workflow contexts including matrix, env, and secrets.

13. Make device coverage scalable

As the number of devices grows, update only matrix.include and config/devices.js.

Example:

matrix:
  include:
    - platform: android
      device_key: android_pixel_7
      runner: ubuntu-latest
    - platform: android
      device_key: android_samsung_s23
      runner: ubuntu-latest
    - platform: ios
      device_key: ios_iphone_15
      runner: macos-latest
    - platform: ios
      device_key: ios_iphone_14
      runner: macos-latest

That way the same test suite runs against all targets without duplicating test code.

14. Add reporting and artifacts

In CI, always upload:

Appium logs

screenshots on failure

test reports

Example:

      - name: Upload logs
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: logs-${{ matrix.device_key }}
          path: |
            appium.log
            reports/
            screenshots/

Because matrix jobs run independently and order is not guaranteed, make artifact names unique per device. GitHub’s workflow syntax docs explicitly warn about matrix-job ordering and unique outputs.

15. Best-practice framework rules

Use these rules from the start:

keep one common test codebase

keep capabilities external

use Page Object Model

keep platform-specific locators isolated

avoid hardcoding app paths and device values

use matrix jobs for device coverage

use self-hosted runners when you need real-device stability

16. Interview-ready explanation

You can explain your setup like this:

“I build a shared WebdriverIO + Appium framework for Android and iOS. The tests and page objects are reusable, and all device-specific capabilities are stored in a separate config file using Appium’s appium: namespaced capabilities. In GitHub Actions, I use a matrix strategy so the same workflow runs multiple times with different device keys. Each job loads the correct capabilities and executes the same scripts on the selected Android or iOS target.”

17. Recommended implementation order

Follow this order:

Set up Node, Appium, Android Studio, Xcode locally.

Create the WebdriverIO project.

Add Android and iOS app binaries.

Create devices.js.

Make wdio.conf.js dynamic using DEVICE_KEY.

Run one Android script locally.

Run one iOS script locally.

Add GitHub Actions workflow with matrix.

Connect emulators, simulators, self-hosted runners, or device farm.

Add reporting, screenshots, and artifacts.

Next, I can give you a complete ready-to-use sample project with:

package.json

wdio.conf.js

devices.js

sample page object

sample test

mobile.yml for GitHub Actions

