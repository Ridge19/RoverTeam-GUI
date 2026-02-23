import { InputPayload, OutputPayload } from "./types";

export class ControlSocketAdapter {
  ws: WebSocket;
  state: OutputPayload = {};
  private onUpdate: (outputs: OutputPayload) => void;

  constructor(url: string, onUpdate: (outputs: OutputPayload) => void) {
    this.ws = new WebSocket(url);
    this.onUpdate = onUpdate;

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
      console.warn(`ControlSocket WS disconnected: ${url}`);
    };

    this.ws.onerror = (e) => {
      console.warn(`ControlSocket WS error: ${url}`, e);
    };
  }

  sendInput(payload: InputPayload) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ inputs: payload }));
    }
  }

  close() {
    this.ws.close();
  }
}