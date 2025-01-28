# Web BLE Heart Rate Zone Monitor
Connect your BLE Heart Rate device and support advanced fitness features, like, Heart Rate Zone.

Implementation depends on [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API), which currently only supports Chromium-based browsers.

- Demo site: https://hrz.aries0d0f.me

![image](https://github.com/user-attachments/assets/cd2f5292-4d8f-4bf1-8289-e00ad146862f)

## Features
- Connect a Bluetooth Heart Rate device and monitor your heart rate in real-time.
- View your currently activated Heart Rate Zone during your training.
- Timer for recording how long you stay in each afford stage.
- Privacy first, Your data are only processed inside your browser locally; we only store your preferences settings, of course, inside your browser locally.
- It can be used with the **OFFLINE** environment after your first load. Thanks to the PWA features.
- It is free and will always be free, no account or registration is needed. Besides, this project is an open-source project and is welcome for those who want to contribute.

## How to use
Open the demo site in a supported browser, connect your Bluetooth device, and enjoy.

- If you are using it on a **Desktop environment**, (e.g. Linux, Mac, Windows), Chrome, Edge, Arc, or any other Chromium-based browsers should work fine.
- If you are an **Android user**, Chrome or other Chromium-based browsers should work fine (but I haven't tested it yet IRL 'cause lack of the device).
- If you are an **iOS/iPadOS user**, it is recommended to use [Bluefy](https://apps.apple.com/us/app/bluefy-web-ble-browser/id1492822055) browser which is a Safari wrapper but with Web Bluetooth API support.

![](https://github.com/user-attachments/assets/1bebd59c-7b31-4108-a9b2-dbfdc6bf125b)
*A real use case screenshot, run on iPadOS (using [Bluefy](https://apps.apple.com/us/app/bluefy-web-ble-browser/id1492822055)), accompanied with a Virtual Cycling platform called "Rouvy".*

## Develop
- Clone repo
- Install dependencies
  ```shell
  pnpm install
  ```
- Start dev server
  ```
  pnpm run dev
  ```
