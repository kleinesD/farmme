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
  /* if (process.env.NODE_ENV === 'development' && displays.length > 1) {
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
  }*/
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



  contentWindow.loadURL('http://127.0.0.1:604/warehouse/add-inventory/');
  contentWindow.loadURL('http://127.0.0.1:604/warehouse/edit-inventory/638f05bb4353feb473ad622d/');
  contentWindow.loadURL('http://127.0.0.1:604/add-reminder');
  contentWindow.loadURL('http://127.0.0.1:604/distribution/all-products');
  contentWindow.loadURL('http://127.0.0.1:604/distribution/add-order');
  contentWindow.loadURL('http://127.0.0.1:604/distribution/?start=2023-03-06T18:10:26.040Z');
  contentWindow.loadURL('http://127.0.0.1:604/herd/');
  contentWindow.loadURL('http://127.0.0.1:604/feed/sample/edit/652fd3a080804169f6efea4b');
  contentWindow.loadURL('http://127.0.0.1:604/feed/record/edit/653224d737d09684fad2b4ec');
  contentWindow.loadURL('http://127.0.0.1:604/feed/sample/');
  contentWindow.loadURL('http://127.0.0.1:604/feed/record/');
  contentWindow.loadURL('http://127.0.0.1:604/feed/');
  contentWindow.loadURL('http://127.0.0.1:604/edit-reminder/65b0b43a94091d06bb6912a7');
  contentWindow.loadURL('http://127.0.0.1:604/distribution/add-order');
  contentWindow.loadURL('http://127.0.0.1:604/herd/all-animals/?filter=all');
  contentWindow.loadURL('http://127.0.0.1:604/vet');
  contentWindow.loadURL('http://127.0.0.1:604/herd/write-off-animal/multiple?animals=31207,31432,31365');
  contentWindow.loadURL('http://127.0.0.1:604/herd/edit-lactation/62a5ab01ed2710258c3ea856/0');
  contentWindow.loadURL('http://127.0.0.1:604/herd/animal-card/628c8e193108dae81ddad038');
  contentWindow.loadURL('http://127.0.0.1:604/vet/start-scheme/multiple?animals=5026');
  contentWindow.loadURL('http://127.0.0.1:604/herd/all-animals/?filter=all');
  contentWindow.loadURL('http://127.0.0.1:604/vet/add-scheme');
  contentWindow.loadURL('http://127.0.0.1:604/vet/history');
  contentWindow.loadURL('http://127.0.0.1:604/');
  

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