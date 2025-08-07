import { computed, onUnmounted } from 'vue'
import globalWebSocket from '@/global'

/**
 * WebSocket组合式函数
 * 提供简化的WebSocket操作接口
 */
export function useWebSocket() {
  // WebSocket状态
  const state = computed(() => globalWebSocket.state)
  const isConnected = computed(() => globalWebSocket.isConnected)

  /**
   * 发送消息
   * @param message 要发送的消息
   * @returns 发送是否成功
   */
  const send = (message: string): boolean => {
    return globalWebSocket.send(message)
  }

  /**
   * 设置消息处理器
   * @param handler 消息处理函数
   */
  const setMessageHandler = (handler: (event: MessageEvent) => void) => {
    globalWebSocket.setMessageHandler(handler)
  }

  /**
   * 发送JSON数据
   * @param data 要发送的数据对象
   * @returns 发送是否成功
   */
  const sendJSON = (data: any): boolean => {
    try {
      return send(JSON.stringify(data))
    } catch (error) {
      console.error('JSON序列化失败:', error)
      return false
    }
  }

  /**
   * 发送命令和数据
   * @param command 命令字符串
   * @param data 数据对象（可选）
   * @returns 发送是否成功
   */
  const sendCommand = (command: string, data?: any): boolean => {
    const commandSent = send(command)
    if (data && commandSent) {
      return sendJSON(data)
    }
    return commandSent
  }

  // 组件卸载时清理消息处理器
  onUnmounted(() => {
    if (globalWebSocket.ws) {
      globalWebSocket.ws.onmessage = null
    }
  })

  return {
    state,
    isConnected,
    send,
    sendJSON,
    sendCommand,
    setMessageHandler
  }
}