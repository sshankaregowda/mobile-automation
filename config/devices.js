import { resolve } from 'path';

export const android_pixel_7 = {
     platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'Medium Phone',
    'appium:platformVersion': '16',
    'appium:app': './app/android/ApiDemos-debug.apk',
    'appium:autoGrantPermissions': true,
    'appium:newCommandTimeout': 120,
    'appium:adbExecTimeout': 120000,
    'appium:androidInstallTimeout': 120000,
    'appium:uiautomator2ServerInstallTimeout': 120000
  }
export const ios_iphone_17 = {
    platformName: 'iOS',
    'appium:deviceName': 'iPhone 17',
    'appium:platformVersion': '26.3',
    'appium:automationName': 'XCUITest',
    'appium:app': resolve(__dirname, '../app/ios/UIKitCatalog 2.app'),
    'appium:autoAcceptAlerts': true,
    'appium:noReset': false
};

export const ios_iphone_17_ci = {
    platformName: 'iOS',
    'appium:deviceName': 'iPhone 17',
    'appium:platformVersion': '26.2',
    'appium:automationName': 'XCUITest',
    'appium:app': resolve(__dirname, '../app/ios/UIKitCatalog 2.app'),
    'appium:autoAcceptAlerts': true,
    'appium:noReset': false,
    'appium:isHeadless': true,
    'appium:simulatorStartupTimeout': 300000,
    'appium:wdaLaunchTimeout': 300000,
    'appium:wdaConnectionTimeout': 300000,
    'appium:wdaStartupRetries': 4,
    'appium:wdaStartupRetryInterval': 20000,
    'appium:showXcodeLog': true
  }