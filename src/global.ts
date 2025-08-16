import { reactive } from 'vue'

interface WebSocketState {
    isConnected: boolean
    isReconnecting: boolean
    reconnectCount: number
}

class GlobalWebSocket {
    private _ws: WebSocket | null = null
    private readonly path = "ws://127.0.0.1:9091/"
    private readonly maxReconnectAttempts = 5
    private reconnectTimer: NodeJS.Timeout | null = null
    private currentHandler: ((event: MessageEvent) => void) | null = null

    public state = reactive<WebSocketState>({
        isConnected: false,
        isReconnecting: false,
        reconnectCount: 0
    })

    get instance(): WebSocket | null {
        return this._ws
    }

    get ws(): WebSocket | null {
        return this._ws
    }

    get isConnected(): boolean {
        return this._ws?.readyState === WebSocket.OPEN
    }

    private connect(): Promise<WebSocket> {
        return new Promise((resolve, reject) => {
            const socket = new WebSocket(this.path)

            socket.onopen = () => {
                console.log("全局 WebSocket 连接成功")
                this.state.isConnected = true
                this.state.isReconnecting = false
                this.state.reconnectCount = 0
                resolve(socket)
            }

            socket.onerror = (error) => {
                console.error("WebSocket 连接错误:", error)
                this.state.isConnected = false
                reject(error)
            }

            socket.onclose = () => {
                console.log("全局 WebSocket 连接已关闭")
                this.state.isConnected = false
                this.scheduleReconnect()
            }
        })
    }

    private scheduleReconnect(): void {
        if (this.state.reconnectCount >= this.maxReconnectAttempts) {
            console.error("WebSocket 重连次数超过限制，停止重连")
            return
        }

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
        }

        this.state.isReconnecting = true
        this.reconnectTimer = setTimeout(() => {
            this.state.reconnectCount++
            console.log(`尝试重新连接 WebSocket... (${this.state.reconnectCount}/${this.maxReconnectAttempts})`)
            this.initGlobalWebSocket()
        }, Math.min(1000 * Math.pow(2, this.state.reconnectCount), 30000))
    }

    public async initGlobalWebSocket(): Promise<void> {
        if (this._ws?.readyState === WebSocket.CONNECTING) {
            return
        }

        this.close()

        try {
            this._ws = await this.connect()
            // 重连后恢复当前的消息处理器
            if (this.currentHandler && this._ws) {
                this._ws.onmessage = this.currentHandler
            }
        } catch (error) {
            console.error("WebSocket 初始化失败:", error)
            this.scheduleReconnect()
        }
    }

    public send(message: string): boolean {
        if (this.isConnected && this._ws) {
            this._ws.send(message)
            return true
        } else {
            console.warn("WebSocket 未连接，无法发送消息")
            return false
        }
    }

    public close(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }

        if (this._ws) {
            this._ws.close()
            this._ws = null
        }
        this.state.isConnected = false
        this.state.isReconnecting = false
    }

    public setMessageHandler(handler: (event: MessageEvent) => void): void {
        this.currentHandler = handler
        if (this._ws) {
            this._ws.onmessage = handler
        }
    }

    public clearMessageHandler(): void {
        console.log('清除WebSocket消息处理器')
        this.currentHandler = null
        if (this._ws) {
            this._ws.onmessage = null
        }
    }

    public getCurrentHandler(): ((event: MessageEvent) => void) | null {
        return this.currentHandler
    }
}

const globalWebSocket = new GlobalWebSocket()

export default globalWebSocket