const getHttpUrl = (wsUrl: string) => {
  return wsUrl
    .replace(/^ws:/, "http:")
    .replace(/^wss:/, "https:")
    .replace(/\/ws$/, "");
};

const PDBService = {
  getApiUrl(
    telemetryWsUrl: string,
    getEndpointsOfService: (s: string) => string[],
  ) {
    try {
      // 1. Extract the hostname from the active telemetry connection
      const activeHost = new URL(telemetryWsUrl.replace(/^ws/, "http"))
        .hostname;

      // 2. Get all discovered "pdb" services
      const pdbEndpoints = getEndpointsOfService("pdb");

      // 3. Find the pdb service that matches the active host
      const match = pdbEndpoints.find((url) => url.includes(activeHost));

      // 4. Return the matched URL (e.g., http://192.168.40.2:5000) or fallback
      return match || `http://${activeHost}:5000`;
    } catch (e) {
      return "http://localhost:5000";
    }
  },
  async toggleChannel(
    currentEndpoint: string,
    getEndpointsOfService: (s: string) => string[],
    board: string,
    channel: number,
    enable: boolean,
  ) {
    const baseUrl = this.getApiUrl(currentEndpoint, getEndpointsOfService);
    const boardRoute = board === "switch" ? "switch1" : board;
    const state = enable ? 1 : 0;

    const response = await fetch(
      `${baseUrl}/${boardRoute}/channel/${channel}/${state}`,
      {
        method: "POST",
      },
    );

    if (!response.ok) throw new Error(`PDB Error: ${response.statusText}`);
    return response.json();
  },
  async toggleAll(
    currentEndpoint: string,
    getEndpointsOfService: (s: string) => string[],
    board: string,
    count: number, // The number of channels on this board
    enable: boolean,
  ) {
    const baseUrl = this.getApiUrl(currentEndpoint, getEndpointsOfService);
    const boardRoute = board === "switch" ? "switch1" : board;
    const state = enable ? 1 : 0;

    // Create an array of fetch promises
    const tasks = Array.from({ length: count }, (_, i) =>
      fetch(`${baseUrl}/${boardRoute}/channel/${i}/${state}`, {
        method: "POST",
      }),
    );

    // Wait for ALL of them to complete in parallel
    const results = await Promise.all(tasks);

    // Check if any single request failed
    if (results.some((r) => !r.ok)) {
      throw new Error("One or more channels failed to toggle.");
    }

    return true;
  },
  async estop(
    currentEndpoint: string,
    getEndpointsOfService: (s: string) => string[],
  ) {
    const baseUrl = this.getApiUrl(currentEndpoint, getEndpointsOfService);

    const response = await fetch(
      `${baseUrl}/bms/estop`,
      {
        method: "POST",
      },
    );

    if (!response.ok) throw new Error(`PDB Error: ${response.statusText}`);
    return response.json();
  },

  async setInterval(
    currentEndpoint: string,
    getEndpointsOfService: (s: string) => string[],
    interval: number,
  ) {
    const baseUrl = this.getApiUrl(currentEndpoint, getEndpointsOfService);

    const response = await fetch(`${baseUrl}/pdb/can/polling/${interval}`, {
      method: "POST",
    });

    if (!response.ok) throw new Error(`PDB Error: ${response.statusText}`);
    return response.json();
  }
};

export default PDBService;
