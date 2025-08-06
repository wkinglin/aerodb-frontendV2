const globalWebSocket = {
    ws: null as WebSocket | null,

    path: "ws://127.0.0.1:9090/",

    setWs(newWs: WebSocket) {
        this.ws = newWs
    },

    open() {
        if (this.ws) {
            this.ws.onopen && this.ws.onopen(new Event('open'))
        }
    },

    close() {
        if (this.ws) {
            this.ws.close()
        }
    },

    send(message: string) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(message)
        } else {
            console.warn("WebSocket 未连接，无法发送消息")
        }
    },

    // 初始化全局 WebSocket 连接
    initGlobalWebSocket() {
        try {
            // 创建 WebSocket 连接
            const socket = new WebSocket(this.path)

            // 设置连接成功的回调
            socket.onopen = () => {
                console.log("全局 WebSocket 连接成功")
            }

            // 设置连接错误的回调
            socket.onerror = () => {
                console.log("全局 WebSocket 连接错误")
                // 连接失败后尝试重连
                setTimeout(() => {
                    console.log("尝试重新连接 WebSocket...")
                    this.initGlobalWebSocket()
                }, 10000)
            }

            // 设置连接关闭的回调
            socket.onclose = () => {
                console.log("全局 WebSocket 连接已关闭")
                setTimeout(() => {
                    console.log("尝试重新连接 WebSocket...")
                    this.initGlobalWebSocket()
                }, 10000)
            }

            // 将 WebSocket 实例保存到全局对象中
            this.setWs(socket)
        } catch (error) {
            console.error("WebSocket 初始化失败:", error)
        }
    }
}

export default globalWebSocket