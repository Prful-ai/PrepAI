import { useState, useEffect, useRef, useCallback } from "react";

export interface LiveSocketConfig {
  url?: string;
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
}

export class LiveSocketManager {
  private socket: WebSocket | null = null;
  private url: string;
  private config: LiveSocketConfig;
  private reconnectCount = 0;
  private reconnectTimer: any = null;
  private isIntentionalClose = false;

  constructor(url: string, config: LiveSocketConfig = {}) {
    this.url = url;
    this.config = {
      reconnectAttempts: 5,
      reconnectInterval: 3000,
      autoConnect: false,
      ...config,
    };

    if (this.config.autoConnect) {
      this.connect();
    }
  }

  /**
   * Establishes the WebSocket connection to the orchestration server.
   */
  public connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isIntentionalClose = false;
    try {
      this.socket = new WebSocket(this.url);

      // Support binary types for routing raw audio array buffers
      this.socket.binaryType = "arraybuffer";

      this.socket.onopen = (event: Event) => {
        this.reconnectCount = 0;
        if (this.config.onOpen) {
          this.config.onOpen(event);
        }
      };

      this.socket.onmessage = (event: MessageEvent) => {
        if (this.config.onMessage) {
          this.config.onMessage(event);
        }
      };

      this.socket.onerror = (event: Event) => {
        if (this.config.onError) {
          this.config.onError(event);
        }
      };

      this.socket.onclose = (event: CloseEvent) => {
        if (this.config.onClose) {
          this.config.onClose(event);
        }

        // Automatic reconnection logic if the close wasn't intentional
        if (!this.isIntentionalClose) {
          this.handleReconnect();
        }
      };
    } catch (error) {
      console.error("Failed to establish WebSocket connection:", error);
      this.handleReconnect();
    }
  }

  /**
   * Safe auto-reconnection loop.
   */
  private handleReconnect(): void {
    const maxAttempts = this.config.reconnectAttempts ?? 5;
    const interval = this.config.reconnectInterval ?? 3000;

    if (this.reconnectCount < maxAttempts) {
      this.reconnectCount++;
      console.log(`Attempting reconnect ${this.reconnectCount}/${maxAttempts} in ${interval}ms...`);
      
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
      }
      
      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, interval);
    } else {
      console.warn("Max WebSocket reconnection attempts reached.");
    }
  }

  /**
   * Closes the active WebSocket connection intentionally.
   */
  public disconnect(): void {
    this.isIntentionalClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Pipes raw audio array buffers, TypedArrays, or Blobs down the wire.
   * @param data The raw audio data chunk to be sent
   */
  public sendAudioChunk(data: ArrayBuffer | ArrayBufferView | Blob): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn("Cannot send audio chunk. WebSocket is not open.");
      return false;
    }

    try {
      this.socket.send(data);
      return true;
    } catch (err) {
      console.error("Error sending audio chunk over WebSocket:", err);
      return false;
    }
  }

  /**
   * Utility to send JSON-structured text messages to the orchestration server.
   * @param payload Structured message payload
   */
  public sendMessage(payload: any): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn("Cannot send message. WebSocket is not open.");
      return false;
    }

    try {
      const text = typeof payload === "string" ? payload : JSON.stringify(payload);
      this.socket.send(text);
      return true;
    } catch (err) {
      console.error("Error sending string message over WebSocket:", err);
      return false;
    }
  }

  /**
   * Gets the current readyState of the WebSocket.
   */
  public getReadyState(): number {
    return this.socket ? this.socket.readyState : WebSocket.CLOSED;
  }
}

/**
 * Custom React hook to easily utilize the WebSocket connection for real-time audio orchestration.
 * 
 * @param url The orchestration WebSocket endpoint URL
 * @param config Optional configuration parameters and lifecycle hooks
 */
export function useLiveSocket(url: string, config: LiveSocketConfig = {}) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const managerRef = useRef<LiveSocketManager | null>(null);

  // Store active stable callbacks through refs to prevent sub-subscription resets
  const callbacksRef = useRef({
    onOpen: config.onOpen,
    onMessage: config.onMessage,
    onClose: config.onClose,
    onError: config.onError,
  });

  useEffect(() => {
    callbacksRef.current = {
      onOpen: config.onOpen,
      onMessage: config.onMessage,
      onClose: config.onClose,
      onError: config.onError,
    };
  }, [config.onOpen, config.onMessage, config.onClose, config.onError]);

  useEffect(() => {
    if (!url) return;

    const manager = new LiveSocketManager(url, {
      reconnectAttempts: config.reconnectAttempts,
      reconnectInterval: config.reconnectInterval,
      onOpen: (e) => {
        setIsConnected(true);
        if (callbacksRef.current.onOpen) callbacksRef.current.onOpen(e);
      },
      onMessage: (e) => {
        if (callbacksRef.current.onMessage) callbacksRef.current.onMessage(e);
      },
      onClose: (e) => {
        setIsConnected(false);
        if (callbacksRef.current.onClose) callbacksRef.current.onClose(e);
      },
      onError: (e) => {
        if (callbacksRef.current.onError) callbacksRef.current.onError(e);
      },
    });

    managerRef.current = manager;

    if (config.autoConnect !== false) {
      manager.connect();
    }

    return () => {
      manager.disconnect();
    };
  }, [url, config.reconnectAttempts, config.reconnectInterval, config.autoConnect]);

  const connect = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.connect();
    }
  }, []);

  const disconnect = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.disconnect();
    }
  }, []);

  const sendAudioChunk = useCallback((data: ArrayBuffer | ArrayBufferView | Blob) => {
    if (managerRef.current) {
      return managerRef.current.sendAudioChunk(data);
    }
    return false;
  }, []);

  const sendMessage = useCallback((payload: any) => {
    if (managerRef.current) {
      return managerRef.current.sendMessage(payload);
    }
    return false;
  }, []);

  return {
    isConnected,
    connect,
    disconnect,
    sendAudioChunk,
    sendMessage,
  };
}
