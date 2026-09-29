class Mutex {
  constructor() {
    this.locked = false;
    this.waiting = [];
  }

  lock() {
    return new Promise(resolve => {
      if (!this.locked) {
        this.locked = true;
        resolve();
      } else {
        this.waiting.push(resolve);
      }
    });
  }

  unlock() {
    if (this.waiting.length > 0) {
      const nextResolve = this.waiting.shift();
      nextResolve();
    } else {
      this.locked = false;
    }
  }
}

class DeadlockVehicle {
  constructor(id, x, y, speed, direction) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.direction = direction; // 0: east, 1: south, 2: west, 3: north
    this.path = [];
    this.pathLength = 0;
  }
}

class DeadlockIntersection {
  constructor(id) {
    this.id = id;
    this.mutex = new Mutex();
  }

  async tryEnter(vehicleId) {
    await this.mutex.lock();
    return true;
  }

  exit() {
    this.mutex.unlock();
  }
}

class DeadlockTrafficSystem {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.vehicles = [];
    this.intersections = [];
    this.nextVehicleId = 0;
    this.MAX_VEHICLES = 100;
    this.MAX_INTERSECTIONS = 100;
    this.MAX_PATH_LENGTH = 50;

    for (let i = 0; i < this.MAX_INTERSECTIONS; i++) {
      this.intersections.push(new DeadlockIntersection(i));
    }

    this.available = new Array(this.MAX_INTERSECTIONS).fill(1);
    this.maximum = Array.from({ length: this.MAX_VEHICLES }, () => new Array(this.MAX_INTERSECTIONS).fill(0));
    this.allocation = Array.from({ length: this.MAX_VEHICLES }, () => new Array(this.MAX_INTERSECTIONS).fill(0));
    this.need = Array.from({ length: this.MAX_VEHICLES }, () => new Array(this.MAX_INTERSECTIONS).fill(0));
  }

  addVehicle(x, y, speed, direction, path = []) {
    if (this.vehicles.length >= this.MAX_VEHICLES || path.length > this.MAX_PATH_LENGTH) {
      console.warn('Cannot add vehicle: limit reached or path too long');
      return;
    }

    const id = this.nextVehicleId++;
    const vehicle = new DeadlockVehicle(id, x, y, speed, direction);
    vehicle.path = path.slice(0, this.MAX_PATH_LENGTH);
    vehicle.pathLength = vehicle.path.length;

    for (let p of vehicle.path) {
      if (p < this.MAX_INTERSECTIONS) {
        this.maximum[id][p] = 1;
        this.need[id][p] = 1;
      }
    }

    this.vehicles.push(vehicle);
  }

  async update() {
    for (let vehicle of this.vehicles) {
      if (vehicle.pathLength > 0) {
        const target = vehicle.path[0];
        const intersection = this.intersections[target];
        const entered = await intersection.tryEnter(vehicle.id);
        if (entered) {
          this.allocation[vehicle.id][target] = 1;
          this.need[vehicle.id][target] = 0;
          this.available[target] = 0;

          // Move vehicle
          switch (vehicle.direction) {
            case 0: vehicle.x += vehicle.speed; break; // east
            case 1: vehicle.y += vehicle.speed; break; // south
            case 2: vehicle.x -= vehicle.speed; break; // west
            case 3: vehicle.y -= vehicle.speed; break; // north
          }

          intersection.exit();
          this.allocation[vehicle.id][target] = 0;
          this.available[target] = 1;

          vehicle.path.shift();
          vehicle.pathLength--;
        }
      }
    }

    return this.detectDeadlocks();
  }

  applyBankersAlgorithm() {
    const work = this.available.slice();
    const finish = new Array(this.vehicles.length).fill(false);
    const safeSequence = [];

    while (safeSequence.length < this.vehicles.length) {
      let found = false;
      for (let i = 0; i < this.vehicles.length; i++) {
        if (!finish[i]) {
          let canAllocate = true;
          for (let j = 0; j < this.MAX_INTERSECTIONS; j++) {
            if (this.need[i][j] > work[j]) {
              canAllocate = false;
              break;
            }
          }
          if (canAllocate) {
            for (let j = 0; j < this.MAX_INTERSECTIONS; j++) {
              work[j] += this.allocation[i][j];
            }
            finish[i] = true;
            safeSequence.push(i);
            found = true;
          }
        }
      }

      if (!found) {
        console.warn("Deadlock detected!");
        return false;
      }
    }

    console.log("Safe state achieved");
    return true;
  }

  detectDeadlocks() {
    return this.applyBankersAlgorithm();
  }
}

// Optional: export for module use
// export { DeadlockVehicle, DeadlockIntersection, DeadlockTrafficSystem };