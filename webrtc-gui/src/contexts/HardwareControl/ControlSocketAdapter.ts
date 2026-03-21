// ControlSocketAdapter.ts

import { InputPayload, OutputPayload } from "./types";

export class ControlSocketAdapter {
  private url: string;
  ws: WebSocket | null = null;
  state: OutputPayload = {};
  private onUpdate: (outputs: OutputPayload) => void;

  constructor(url: string, onUpdate: (outputs: OutputPayload) => void) {
    this.url = url;
    this.onUpdate = onUpdate;
  }

  connect() {
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      return; // already open or connecting
    }

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log(`WS connected: ${this.url}`);
    };

    this.ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.outputs) {
          this.state = { ...this.state, ...data.outputs };
          this.onUpdate(this.state);
        }
      } catch (e) {
        console.warn("WS parse error:", e);
      }
    };

    this.ws.onclose = () => {
      console.warn(`WS closed: ${this.url}`);
      this.ws = null;
    };

    this.ws.onerror = () => {
      console.warn(`WS error: ${this.url}`);
    };
  }

  sendInput(payload: InputPayload) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ inputs: payload }));
    }
  }

  sendEvent(name: string) {
    this.sendInput({ [name]: true });
  }

  close() {
    this.ws?.close();
    this.ws = null;
  }
}