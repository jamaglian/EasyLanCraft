const { app, BrowserWindow, ipcMain, ipcRenderer, Menu } = require('electron')
var natUpnp = require('nat-upnp')
var client = natUpnp.createClient();
var win;
  /*https://www.christianengvall.se/electron-packager-tutorial/*/
const createWindow =  () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: __dirname + '/icon.png',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  })
  //win.setMenuBarVisibility(false)
  Menu.setApplicationMenu(null);
  win.removeMenu(true)
  //win.webContents.openDevTools()
  win.loadFile('index.html')
  win.webContents.on('did-finish-load', function() {
    client.externalIp(function(err, ip) {
      if(err){
        win.webContents.send("retornar-erro", "Erro: Tente checar os serviços UPNP em seu roteador e tente novamente.", true);
      }else{
        win.webContents.send("preencher-ipext", ip);
        //console.log(ip);
        var address,
            ifaces = require('os').networkInterfaces();
        for (var dev in ifaces) {
            ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === false ? address = details.address: undefined);
        }
        win.webContents.send("preencher-ipint", address);
        client.getMappings( function(err, results) {
          if(err){
            win.webContents.send("retornar-erro", "Erro: Erro ao obter as portas que já foram abertas, você pode tentar usar o programa mas não poderá fechar as portas.", false);
          }else{
            //console.log(results);
            win.webContents.send("preencher-portstable", results);
          }
        });
      }
    });
  });
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
ipcMain.on('close-me', (evt, arg) => {
  app.quit()
})
ipcMain.on('fechar-porta', (evt, arg) => {
  client.portUnmapping({
    public: arg,
    private: arg,
    protocol: "TCP"
  }, function(err) {
    if(err){
      win.webContents.send("retornar-erro", "Erro: Erro ao fechar a porta.", false);
    }else{
      client.getMappings( function(err, results) {
        if(err){
          win.webContents.send("retornar-erro", "Erro: Erro ao obter as portas que já foram abertas, você pode tentar usar o programa mas não poderá fechar as portas.", false);
        }else{
          //console.log(results);
          win.webContents.send("preencher-portstable", results);
          win.webContents.send("retornar-erro","A porta " + arg + " foi fechada!", false);
        }
      });
    }
  });
})
ipcMain.on('abrir-porta', (evt, arg) => {
  client.portMapping({
    public: arg,
    private: arg,
    protocol: "TCP"
  }, function(err) {
    if(err){
      win.webContents.send("retornar-erro", "Erro: Erro ao fechar a porta.", false);
    }else{
      client.getMappings( function(err, results) {
        if(err){
          win.webContents.send("retornar-erro", "Erro: Erro ao obter as portas que já foram abertas, você pode tentar usar o programa mas não poderá fechar as portas.", false);
        }else{
          //console.log(results);
          win.webContents.send("preencher-portstable", results);
          win.webContents.send("retornar-erro","A porta " + arg + " foi aberta!", false);
        }
      });
    }
  });
})
