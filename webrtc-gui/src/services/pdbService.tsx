const getHttpUrl = (wsUrl: string) => {
  return wsUrl
    .replace(/^ws:/, "http:")
    .replace(/^wss:/, "https:")
    .replace(/\/ws$/, "");
};

const PDBService = {
  async toggleChannel(
    getEndpointsOfService: (s: string) => string[],
    board: string,
    channel: number,
    enable: boolean,
  ) {
    const boardRoute = board === "switch" ? "switch1" : board;
    const state = enable ? 1 : 0;

    const response = await fetch(
      `${getEndpointsOfService('pdb')[0]}/${boardRoute}/channel/${channel}/${state}`,
      {
        method: "POST",
      },
    );

    if (!response.ok) throw new Error(`PDB Error: ${response.statusText}`);
    return response.json();
  },
  async toggleAll(
    getEndpointsOfService: (s: string) => string[],
    board: string,
    count: number, // The number of channels on this board
    enable: boolean,
  ) {
    const boardRoute = board === "switch" ? "switch1" : board;
    const state = enable ? 1 : 0;

    // Create an array of fetch promises
    const tasks = Array.from({ length: count }, (_, i) =>
      fetch(`${getEndpointsOfService('pdb')[0]}/${boardRoute}/channel/${i}/${state}`, {
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
    getEndpointsOfService: (s: string) => string[],
  ) {
    const response = await fetch(
      `${getEndpointsOfService('pdb')[0]}/bms/estop`,
      {
        method: "POST",
      },
    );

    if (!response.ok) throw new Error(`PDB Error: ${response.statusText}`);
    return response.json();
  },

  async setInterval(
    getEndpointsOfService: (s: string) => string[],
    interval: number,
  ) {
    const response = await fetch(`${getEndpointsOfService('pdb')[0]}/pdb/can/polling/${interval}`, {
      method: "POST",
    });

    if (!response.ok) throw new Error(`PDB Error: ${response.statusText}`);
    return response.json();
  }
};

export default PDBService;
