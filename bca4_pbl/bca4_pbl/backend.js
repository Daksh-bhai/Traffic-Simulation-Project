const STOP_DISTANCE = 80;
const SAFE_DISTANCE = 45;
const ROAD_WIDTH = 100;
const INTERSECTION_MARGIN = 40; // Distance to consider vehicle in intersection
const TURN_RADIUS = 40;

class TrafficSystemVehicle {
  constructor(x, y, speed, color, direction) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.color = color;
    this.direction = direction;
    this.isInIntersection = false;
  }

  move(intersection, vehicleList) {
    const light = intersection.lights.find(l =>
      (this.direction === "horizontal" && l.direction === "horizontal") ||
      (this.direction === "vertical" && l.direction === "vertical")
    );

    const dx = this.x - intersection.x;
    const dy = this.y - intersection.y;
    const margin = 15;
    
    // Check if vehicle is in intersection
    this.isInIntersection = Math.abs(dx) < INTERSECTION_MARGIN && Math.abs(dy) < INTERSECTION_MARGIN;
    
    // Check if vehicle is approaching intersection
    const approaching = this.direction === "horizontal"
      ? (Math.abs(dx) < STOP_DISTANCE && Math.abs(dx) > margin && Math.abs(dy) < ROAD_WIDTH / 2)
      : (Math.abs(dy) < STOP_DISTANCE && Math.abs(dy) > margin && Math.abs(dx) < ROAD_WIDTH / 2);

    // Check if vehicle has crossed intersection
    const crossed = this.direction === "horizontal" 
      ? (dx > margin && Math.abs(dy) < ROAD_WIDTH / 2)
      : (dy > margin && Math.abs(dx) < ROAD_WIDTH / 2);

    // Stop at red light if approaching and not crossed
    if (approaching && light.state === "red" && !crossed) {
      return;
    }

    // Check for vehicles ahead
    const frontVehicle = this.findFrontVehicle(vehicleList);
    if (frontVehicle && this.isTooClose(frontVehicle)) {
      return;
    }

    // Prevent vehicles from entering intersection if it's occupied
    if (approaching && !crossed && this.isIntersectionOccupied(vehicleList, intersection)) {
      return;
    }

    this.moveStraight();
  }

  isIntersectionOccupied(vehicleList, intersection) {
    for (const other of vehicleList) {
      if (other === this) continue;
      
      const otherDx = other.x - intersection.x;
      const otherDy = other.y - intersection.y;
      
      if (Math.abs(otherDx) < INTERSECTION_MARGIN && Math.abs(otherDy) < INTERSECTION_MARGIN) {
        return true;
      }
    }
    return false;
  }

  moveStraight() {
    if (this.direction === "horizontal") {
      this.x += this.speed;
    } else {
      this.y += this.speed;
    }
  }

  findFrontVehicle(vehicleList) {
    let closest = null;
    let minDistance = Infinity;

    for (const other of vehicleList) {
      if (other === this || other.direction !== this.direction) continue;

      if (this.direction === "horizontal") {
        const ahead = other.x > this.x;
        const sameLane = Math.abs(this.y - other.y) < 5;
        const dist = other.x - this.x;
        if (ahead && sameLane && dist < minDistance) {
          minDistance = dist;
          closest = other;
        }
      } else {
        const ahead = other.y > this.y;
        const sameLane = Math.abs(this.x - other.x) < 5;
        const dist = other.y - this.y;
        if (ahead && sameLane && dist < minDistance) {
          minDistance = dist;
          closest = other;
        }
      }
    }

    return closest;
  }

  isTooClose(other) {
    return this.direction === "horizontal"
      ? (other.x - this.x) < SAFE_DISTANCE
      : (other.y - this.y) < SAFE_DISTANCE;
  }

  draw() {
    // Draw car shadow (bigger)
    push();
    noStroke();
    fill(0, 60);
    if (this.direction === "horizontal") {
      ellipse(this.x + 20, this.y + 18, 44, 16);
    } else {
      ellipse(this.x, this.y + 32, 16, 44);
    }
    pop();

    // Draw car body (bigger, more realistic)
    push();
    stroke(40);
    strokeWeight(2);
    fill(this.color);
    if (this.direction === "horizontal") {
      rect(this.x, this.y - 16, 40, 32, 10);
      // Windows
      fill(200, 230, 255);
      rect(this.x + 8, this.y - 8, 14, 14, 3);
      rect(this.x + 24, this.y - 8, 10, 14, 3);
      // Wheels
      fill(30);
      ellipse(this.x + 8, this.y + 24, 10, 10);
      ellipse(this.x + 32, this.y + 24, 10, 10);
      // Headlights
      fill(255, 255, 180, 200);
      ellipse(this.x + 40, this.y - 8, 6, 10);
      ellipse(this.x + 40, this.y + 16, 6, 10);
      // Taillights
      fill(255, 60, 60, 200);
      ellipse(this.x, this.y - 8, 6, 10);
      ellipse(this.x, this.y + 16, 6, 10);
    } else {
      rect(this.x - 16, this.y, 32, 40, 10);
      // Windows
      fill(200, 230, 255);
      rect(this.x - 8, this.y + 8, 14, 14, 3);
      rect(this.x - 8, this.y + 24, 14, 10, 3);
      // Wheels
      fill(30);
      ellipse(this.x - 12, this.y + 8, 10, 10);
      ellipse(this.x + 12, this.y + 32, 10, 10);
      // Headlights
      fill(255, 255, 180, 200);
      ellipse(this.x - 8, this.y + 40, 10, 6);
      ellipse(this.x + 8, this.y + 40, 10, 6);
      // Taillights
      fill(255, 60, 60, 200);
      ellipse(this.x - 8, this.y, 10, 6);
      ellipse(this.x + 8, this.y, 10, 6);
    }
    pop();
  }
}

class TrafficSystemTrafficLight {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.state = "red";
    this.direction = direction;
  }

  draw() {
    // Light pole: thin vertical rectangle
    fill(60);
    rect(this.x - 4, this.y, 8, 60);
    // Highlighted, glowing traffic light bulb (bigger, brighter)
    let bulbColor = this.state === "red" ? color(255,0,0) : color(0,255,0);
    let glowColor = this.state === "red" ? color(255,0,0,120) : color(0,255,0,120);
    // Glow effect
    push();
    noStroke();
    for (let g = 48; g >= 32; g -= 4) {
      fill(red(glowColor), green(glowColor), blue(glowColor), 60 - (48-g)*2);
      ellipse(this.x, this.y, g, g);
    }
    pop();
    // Bulb
    stroke(255);
    strokeWeight(3);
    fill(bulbColor);
    ellipse(this.x, this.y, 32, 32);
    // White highlight for glass effect
    noStroke();
    fill(255,255,255,120);
    ellipse(this.x-8, this.y-8, 12, 8);
  }
}

class TrafficSystemIntersection {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.activeDirection = "horizontal";
    this.timer = 0;
    this.lights = [
      new TrafficSystemTrafficLight(x - 100, y, "horizontal"),
      new TrafficSystemTrafficLight(x + 100, y, "horizontal"),
      new TrafficSystemTrafficLight(x, y - 100, "vertical"),
      new TrafficSystemTrafficLight(x, y + 100, "vertical")
    ];
    this.minGreenTime = 60;
    this.maxGreenTime = 180;
    this.yellowTime = 30;
    this.currentState = "green"; // green, yellow, or red
    this.stateTimer = 0;
  }

  update(vehicleList) {
    const hCount = this.countVehicles(vehicleList, "horizontal");
    const vCount = this.countVehicles(vehicleList, "vertical");

    this.timer++;
    this.stateTimer++;

    // Handle state transitions
    if (this.currentState === "green") {
      const shouldChange = (this.activeDirection === "horizontal" && this.timer > this.minGreenTime && (vCount > hCount || this.timer > this.maxGreenTime)) ||
                          (this.activeDirection === "vertical" && this.timer > this.minGreenTime && (hCount > vCount || this.timer > this.maxGreenTime));
      
      if (shouldChange) {
        this.currentState = "yellow";
        this.stateTimer = 0;
      }
    } else if (this.currentState === "yellow") {
      if (this.stateTimer >= this.yellowTime) {
        this.currentState = "red";
        this.stateTimer = 0;
        this.activeDirection = this.activeDirection === "horizontal" ? "vertical" : "horizontal";
        this.timer = 0;
      }
    } else if (this.currentState === "red") {
      if (this.stateTimer >= 10) { // Short delay before turning green
        this.currentState = "green";
        this.stateTimer = 0;
      }
    }

    // Update light states
    this.lights.forEach(light => {
      if (light.direction === this.activeDirection) {
        light.state = this.currentState === "yellow" ? "red" : this.currentState;
      } else {
        light.state = "red";
      }
    });
  }

  countVehicles(vehicleList, direction) {
    let count = 0;
    for (const v of vehicleList) {
      if (v.direction !== direction) continue;
      const dx = abs(v.x - this.x);
      const dy = abs(v.y - this.y);
      
      if (direction === "horizontal") {
        // Count vehicles on both sides of the intersection
        if (dx < STOP_DISTANCE && abs(v.y - this.y) < ROAD_WIDTH / 2) {
          count++;
        }
      } else if (direction === "vertical") {
        // Count vehicles on both sides of the intersection
        if (dy < STOP_DISTANCE && abs(v.x - this.x) < ROAD_WIDTH / 2) {
          count++;
        }
      }
    }
    return count;
  }

  draw() {
    fill(100);
    rect(this.x - 40, this.y - 40, 80, 80);
    this.lights.forEach(light => light.draw());
  }
}

// Optional: export for modular JS environments
// Uncomment if using ES modules
// export { TrafficSystemVehicle, TrafficSystemTrafficLight, TrafficSystemIntersection };