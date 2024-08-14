import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let mainWindow;
let loginModal;
let lyricModal;

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1427,
    height: 845,
    minWidth: 713,
    minHeight: 422,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    backgroundColor: 'rgba(0,0,0,0)', // 背景
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: false,
      nodeIntegration: true,
      webSecurity: false
    }
  })

  // mainWindow.webContents.openDevTools();

  mainWindow.setAspectRatio(1.6889);

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: "/"
    })
  }
}

// 登录窗体
ipcMain.on('open-loginModal', (_, path) => {
  if (loginModal) return;
  const width = 375;
  const height = 500;
  loginModal = new BrowserWindow({
    parent: BrowserWindow.getFocusedWindow() || undefined,
    // modal: true,
    frame: false,
    width: width,
    height: height,
    autoHideMenuBar: true, // 是否显示菜单栏
    transparent: true,
    hasShadow: true, // 阴影
    resizable: false,
    webPreferences: {
      webviewTag: true,
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  // loginModal.webContents.openDevTools();

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    loginModal.loadURL(process.env['ELECTRON_RENDERER_URL'] + "/#" + path);
  } else {
    loginModal.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: path
    })
  }
});

ipcMain.on("close-loginModal", () => {
  loginModal.close();
  loginModal = null;
})

ipcMain.on("loginModal-send", (_, cookie) => {
  mainWindow.send("mainWindow-on", cookie)
})

// 歌词窗体
ipcMain.on('open-lyricModal', (_, path) => {
  if (lyricModal) return;
  const width = 600;
  const height = 200;
  lyricModal = new BrowserWindow({
    // parent: BrowserWindow.getFocusedWindow() || undefined,
    // modal: true,
    frame: false,
    width: width,
    height: height,
    autoHideMenuBar: true, // 是否显示菜单栏
    transparent: true,
    // alwaysOnTop: true,
    // hasShadow: true, // 阴影
    // resizable: false,
    webPreferences: {
      webviewTag: true,
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  lyricModal.webContents.openDevTools();
  lyricModal.setAlwaysOnTop(true, "screen-saver");

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    lyricModal.loadURL(process.env['ELECTRON_RENDERER_URL'] + "/#" + path);
  } else {
    lyricModal.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: path
    })
  }

});

ipcMain.on("lock-lyricModal", (_, flag) => {
  if (flag == 1) {
    lyricModal.setIgnoreMouseEvents(true, {
      forward: true
    });
  } else {
    lyricModal.setIgnoreMouseEvents(false);
  }

})

ipcMain.on("close-lyricModal", () => {
  lyricModal.close();
  lyricModal = null;
})

ipcMain.on("mainWindow-send", (_, lyricItem) => {
  lyricModal.send("lyricModal-on", lyricItem)
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
