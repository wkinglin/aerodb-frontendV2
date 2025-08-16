import { app as o, BrowserWindow as s, ipcMain as t } from "electron";
import { fileURLToPath as d } from "node:url";
import n from "node:path";
const r = n.dirname(d(import.meta.url));
process.env.APP_ROOT = n.join(r, "..");
const i = process.env.VITE_DEV_SERVER_URL, w = n.join(process.env.APP_ROOT, "dist-electron"), a = n.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = i ? n.join(process.env.APP_ROOT, "public") : a;
let e;
function l() {
  e = new s({
    icon: n.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    frame: !1,
    // 移除原生标题栏
    titleBarStyle: "hidden",
    // 隐藏标题栏
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: n.join(r, "preload.mjs"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
    // fullscreen: true,
  }), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), i ? e.loadURL(i) : e.loadFile(n.join(a, "index.html")), e.webContents.openDevTools();
}
o.on("window-all-closed", () => {
  process.platform !== "darwin" && (o.quit(), e = null);
});
o.on("activate", () => {
  s.getAllWindows().length === 0 && l();
});
o.whenReady().then(l);
t.on("window-min", () => {
  e && e.minimize();
});
t.on("window-max", () => {
  e && (e.isMaximized() ? e.unmaximize() : e.maximize());
});
t.on("window-close", () => {
  e && e.close();
});
export {
  w as MAIN_DIST,
  a as RENDERER_DIST,
  i as VITE_DEV_SERVER_URL
};
