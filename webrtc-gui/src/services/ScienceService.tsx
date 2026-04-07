const getHttpUrl = (wsUrl: string) => {
  return wsUrl
    .replace(/^ws:/, "http:")
    .replace(/^wss:/, "https:")
    .replace(/\/ws$/, "");
};

const ScienceService = {
  async setDrillSpeed(
    getEndpointsOfService: (s: string) => string[],
    speed: number,
  ) {

    const response = await fetch(`${getEndpointsOfService('science')[0]}/drill/speed/${speed}`, {
      method: "POST",
    });

    console.log("SET DRILL SPEED")
    if (!response.ok) throw new Error(`Drill Error: ${response.statusText}`);
    return response.json();
  },

  async setStepperStep(
    getEndpointsOfService: (s: string) => string[],
    motorId: number,
    speed: number, // The number of channels on this board
  ) {
    const response = await fetch(`${getEndpointsOfService('science')[0]}/steppers/${motorId}/${speed}`, {
      method: "POST",
    });
    if (!response.ok) throw new Error(`Science Error: ${response.statusText}`);

    console.log("SET STEPPER STEP")

    return true;
  },

  async estop(
    getEndpointsOfService: (s: string) => string[],
  ) {

    const response = await fetch(`${getEndpointsOfService('science')[0]}/science/estop`, {
      method: "POST",
    });

    if (!response.ok) throw new Error(`Science Error: ${response.statusText}`);
    return response.json();
  },

  async setHeatpad(
    getEndpointsOfService: (s: string) => string[],
    toggleState: number,
  ) {
    const response = await fetch(`${getEndpointsOfService('science')[0]}/heatpad/${toggleState}`, {
      method: "POST",
    });
    if (!response.ok) throw new Error(`Science Error: ${response.statusText}`);
    return response.json();
  },

  //   async setInterval(
  //     currentEndpoint: string,
  //     getEndpointsOfService: (s: string) => string[],
  //     interval: number,
  //   ) {
  //     const baseUrl = this.getApiUrl(currentEndpoint, getEndpointsOfService);

  //     const response = await fetch(`${baseUrl}/can/polling/${interval}`, {
  //       method: "POST",
  //     });

  //     if (!response.ok) throw new Error(`PDB Error: ${response.statusText}`);
  //     return response.json();
  //   },
};

export default ScienceService;
