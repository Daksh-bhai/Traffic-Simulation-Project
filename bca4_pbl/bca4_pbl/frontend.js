let intersection;
let vehicles = [];
let deadlockSystem;

let isRunning = false;// 30% chance of turning at intersection

window.onload = function () {
  document.getElementById('start').addEventListener('click', () => {
    isRunning = true;
    loop();
  });

  document.getElementById('stop').addEventListener('click', () => {
    isRunning = false;
    noLoop();
  });

  document.getElementById('clear').addEventListener('click', () => {
    vehicles = [];
    document.getElementById('vehicle-count').textContent = '0';
    document.getElementById('light-status').textContent = 'Red';
    document.getElementById('deadlock-status').textContent = 'Safe';
  });
};

function setup() {
  const canvas = createCanvas(1000, 800);
  canvas.parent('canvas-container');

  intersection = new TrafficSystemIntersection(width / 2, height / 2);
  deadlockSystem = new DeadlockTrafficSystem(width, height);

  vehicles = [
    new TrafficSystemVehicle(100, height / 2 - 20, 2, color(255, 0, 0), "horizontal"),
    new TrafficSystemVehicle(width / 2 - 20, 100, 2, color(0, 0, 255), "vertical")
  ];

  // Initialize deadlock system with initial vehicles
  vehicles.forEach((v, index) => {
    const direction = v.direction === "horizontal" ? 0 : 1;
    deadlockSystem.addVehicle(v.x, v.y, v.speed, direction, [index]);
  });

  frameRate(30);
  noLoop();
}

function draw() {
  if (!isRunning) return;

  background(220);

  // Add new vehicles periodically
  if (frameCount % 120 === 0 && vehicles.length < 30) {
    const dir = random(["horizontal", "vertical"]);
    const newVehicle = dir === "horizontal"
      ? new TrafficSystemVehicle(-40, height / 2 - 20, 2, color(random(255), 0, 0), "horizontal")
      : new TrafficSystemVehicle(width / 2 - 20, -40, 2, color(0, 0, random(255)), "vertical");
     
    vehicles.push(newVehicle);
    
    // Add to deadlock system
    const direction = dir === "horizontal" ? 0 : 1;
    deadlockSystem.addVehicle(newVehicle.x, newVehicle.y, newVehicle.speed, direction, [vehicles.length - 1]);
  }

  // Draw roads
  fill(50);
  rect(0, height / 2 - ROAD_WIDTH / 2, width, ROAD_WIDTH);
  rect(width / 2 - ROAD_WIDTH / 2, 0, ROAD_WIDTH, height);

  // Draw road markings
  drawRoadMarkings();

  // Update intersection and vehicles
  intersection.update(vehicles);
  intersection.draw();

  const mainLight = intersection.lights[0];
  document.getElementById("light-status").textContent =
    mainLight.state.charAt(0).toUpperCase() + mainLight.state.slice(1);

  // Update and draw vehicles
  vehicles.forEach(v => {
    v.move(intersection, vehicles);
    v.draw();
  });

  // Update vehicle count
  document.getElementById("vehicle-count").textContent = vehicles.length;

  // Update deadlock system and status
  const isDeadlockFree = deadlockSystem.update();
  document.getElementById("deadlock-status").textContent = isDeadlockFree ? "Safe" : "Warning: Potential Deadlock";
  if (!isDeadlockFree) {
    document.getElementById("deadlock-status").style.color = "#e74c3c";
  } else {
    document.getElementById("deadlock-status").style.color = "#2ecc71";
  }
}

function drawRoadMarkings() {
  stroke(255);
  strokeWeight(2);

  // Draw horizontal lane dividers
  for (let x = 0; x < width; x += 40) {
    line(x, height / 2, x + 20, height / 2);
  }

  // Draw vertical lane dividers
  for (let y = 0; y < height; y += 40) {
    line(width / 2, y, width / 2, y + 20);
  }
}