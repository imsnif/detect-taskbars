'use strict'

const electron = require('electron')
const BrowserWindow = electron.BrowserWindow
const rendererVal = require('electron-renderer-value')

function testWindow (bounds) {
  const ipcMain = electron.ipcMain
  const win = new BrowserWindow({
    y: bounds.y,
    x: bounds.x,
    frame: false,
    skipTaskbar: true
  })
  win.loadURL(`file://${__dirname}/index.html`)
  win.maximize()
  const changedBounds = win.getContentBounds()
  return new Promise(resolve => win.on('maximize', () => {win.minimize(); resolve()}))
  .then(() => rendererVal(win.webContents, '{width: window.outerWidth, height: window.outerHeight}'))
  .then(size => {
    win.close()
    return Object.assign({}, size, {x: changedBounds.x, y: changedBounds.y})
  })
  .catch(e => console.error('e:', e))
}

function findBars (bounds, workArea) {
  if (workArea.y > bounds.y) {
    return ({
      id: 'topBar',
      width: workArea.width,
      height: workArea.y - bounds.y,
      x: 0,
      y: 0
    })
  }
  if (bounds.y - workArea.y + bounds.height - workArea.height > 0) {
    return ({
      id: 'bottomBar',
      width: workArea.width,
      height: bounds.height - workArea.height,
      y: workArea.height,
      x: 0
    })
  }
  if (workArea.x > bounds.x) {
    return ({
      id: 'leftBar',
      width: workArea.x - bounds.x,
      height: workArea.height,
      x: 0,
      y: 0
    })
  }
  if (bounds.x - workArea.x + bounds.width - workArea.width > 0) {
    return ({
      id: 'rightBar',
      width: bounds.x - workArea.x + bounds.width - workArea.width,
      height: workArea.height,
      x: workArea.width,
      y: 0
    })
  }
}

module.exports = function detectTaskbars (bounds) {
  return testWindow(bounds)
  .then((workArea) => findBars(bounds, workArea))
  .catch(e => console.error(e))
}
