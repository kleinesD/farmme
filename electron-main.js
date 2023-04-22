const { app, BrowserWindow, BrowserView, screen, ipcMain, session } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');


const expressApp = require('./app');
const server = require('./server');

/* To disable "Passthrough is not supported, GL is disabled, ANGLE is" error. */
app.disableHardwareAcceleration()

let menuWindow, contentWindow, loadingWindow;



const createWindow = () => {

  let ses = session.defaultSession;


  let displays = screen.getAllDisplays()

  /* Showing an app on external screen if there is one and if in development mode */
  if (process.env.NODE_ENV === 'development' && displays.length > 1) {
    contentWindow = new BrowserWindow({
      minWidth: 1200, minHeight: 600,
      x: displays[1].bounds.x, y: displays[1].bounds.y,
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true
      },
      autoHideMenuBar: true,
      backgroundColor: '#f7f0dd',
      show: false
    });
  } else {
    contentWindow = new BrowserWindow({
      minWidth: 1200, minHeight: 600,
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true
      },
      autoHideMenuBar: true,
      backgroundColor: '#f7f0dd',
      show: false
    });
  }



  contentWindow.loadURL('http://127.0.0.1:604/herd/add-milking-result/628d0862aca019349b20c6c8');
  contentWindow.loadURL('http://127.0.0.1:604/vet/add-treatment/62f14e90d51a806f924b0298');
  contentWindow.loadURL('http://127.0.0.1:604/warehouse/add-inventory/');
  contentWindow.loadURL('http://127.0.0.1:604/warehouse/edit-inventory/638f05bb4353feb473ad622d/');
  contentWindow.loadURL('http://127.0.0.1:604/');
  contentWindow.loadURL('http://127.0.0.1:604/add-reminder');
  contentWindow.loadURL('http://127.0.0.1:604/distribution/all-products');
  contentWindow.loadURL('http://127.0.0.1:604/distribution/edit-write-off/64423b63993f4ec9e5670013');
  contentWindow.loadURL('http://127.0.0.1:604/distribution/edit-order/644422c36c5a89f360a597e6');


  contentWindow.maximize();
  contentWindow.show();

  /* const menuView = new BrowserView();
 
    contentWindow.setBrowserView(menuView);
   menuView.setBounds({ x: 0, y: 0, width: 70, height: contentWindow.getContentSize()[1] });
   menuView.setBackgroundColor('#f7f0dd');
   menuView.webContents.loadFile('./public/html/menu2.html'); */

  const preloadView = new BrowserView();

  contentWindow.setBrowserView(preloadView);
  preloadView.setBounds({ x: 0, y: 0, width: contentWindow.getContentSize()[0], height: contentWindow.getContentSize()[1] });
  preloadView.setBackgroundColor('#f7f0dd');
  preloadView.webContents.loadFile('./public/html/preload.html');

  contentWindow.webContents.on('dom-ready', (e) => {
    contentWindow.removeBrowserView(preloadView);
  });

  if (isDev) contentWindow.webContents.openDevTools();




  /*  menuWindow = new BrowserWindow({
     x: 0, y: 0,
     width: 80,
     height: contentWindow.getContentSize()[1],
     webPreferences: {
       contextIsolation: false,
       nodeIntegration: true,
     },
     parent: contentWindow,
     backgroundColor: '#66CD00',
     frame: false,
     resizable: false,
     movable: false,
     focusable: false
   }); 
   console.log(menuWindow.getBounds());*/




  /* contentWindow.on('move', function () {
    let position = contentWindow.getPosition();
    menuWindow.setPosition(position[0], position[1]);
  }); */




  contentWindow.on('closed', () => {
    contentWindow = null;
    menuWindow = null;
    app.quit();
  });
}

/* ipcMain.on('cookie-channel', (e, cookie) => {
  console.log(cookie);
}); */


app.on('ready', createWindow);

app.on('activate', () => {
  if (contentWindow === null) createWindow()
})