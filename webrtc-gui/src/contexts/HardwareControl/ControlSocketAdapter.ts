import { InputPayload, OutputPayload } from "./types";

export class ControlSocketAdapter {
  private url: string;
  ws: WebSocket | null = null;
  state: OutputPayload = {};
  private onUpdate: (outputs: OutputPayload) => void;
  private reconnectAttempts = 0;
  private maxReconnects = 3;
  private reconnecting = false;

  constructor(url: string, onUpdate: (outputs: OutputPayload) => void) {
    this.url = url;
    this.onUpdate = onUpdate;
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log(`ControlSocket WS connected: ${this.url}`);
      this.reconnectAttempts = 0;
      this.reconnecting = false;
    };

    this.ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.outputs) {
          this.state = { ...this.state, ...data.outputs };
          this.onUpdate(this.state);
        }
      } catch (e) {
        console.warn("ControlSocketAdapter parse error:", e);
      }
    };

    this.ws.onclose = () => {
      console.warn(`ControlSocket WS disconnected: ${this.url}`);
      this.handleDisconnect();
    };

    this.ws.onerror = (e) => {
      console.warn(`ControlSocket WS error: ${this.url}`, e);
      // Optional: could force close to trigger disconnect handling
      if (this.ws?.readyState === WebSocket.OPEN) this.ws.close();
    };
  }

  private handleDisconnect() {
    if (this.reconnecting) return;
    this.reconnecting = true;

    const tryReconnect = async () => {
      while (this.reconnectAttempts < this.maxReconnects) {
        this.reconnectAttempts++;
        console.log(`Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnects}`);
        try {
          this.connect();
          // wait a bit to see if it opens
          await new Promise((res) => setTimeout(res, 1000));
          if (this.ws?.readyState === WebSocket.OPEN) {
            console.log("Reconnected successfully");
            return;
          }
        } catch {
          // ignore
        }
      }

      console.warn("Failed to reconnect, marking WS as disconnected");
      this.reconnecting = false;
      this.ws = null;
    };

    tryReconnect();
  }

  sendInput(payload: InputPayload) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ inputs: payload }));
    }
  }

  close() {
    this.ws?.close();
    this.ws = null;
  }
}