<?php
require_once 'database.php';

class VehicleGenerator {
    private $db;
    private $directions = ['horizontal', 'vertical'];
    private $colors = ['red', 'blue', 'green', 'yellow', 'black', 'white'];
    private $speedLimit = 3;
    private $finePerUnit = 100;

    public function __construct($db) {
        $this->db = $db;
    }

    private function generateRandomId() {
        return 'VEH' . strtoupper(substr(md5(uniqid()), 0, 8));
    }

    private function generateRandomSpeed() {
        // 70% chance of normal speed, 30% chance of speeding
        return rand(0, 100) < 70 ? 
            rand(1, $this->speedLimit) : 
            rand($this->speedLimit + 1, $this->speedLimit + 3);
    }

    private function generateRandomPosition() {
        return [
            'x' => rand(0, 1000),
            'y' => rand(0, 800)
        ];
    }

    public function generateVehicles($count = 10) {
        try {
            for ($i = 0; $i < $count; $i++) {
                $vehicleId = $this->generateRandomId();
                $speed = $this->generateRandomSpeed();
                $direction = $this->directions[array_rand($this->directions)];
                $position = $this->generateRandomPosition();

                // Insert vehicle data
                $query = "INSERT INTO vehicles (id, speed, direction, position_x, position_y) 
                         VALUES (?, ?, ?, ?, ?)";
                $stmt = $this->db->prepare($query);
                $stmt->execute([$vehicleId, $speed, $direction, $position['x'], $position['y']]);

                // Log vehicle data
                $query = "INSERT INTO vehicle_logs (vehicle_id, speed, direction, position_x, position_y) 
                         VALUES (?, ?, ?, ?, ?)";
                $stmt = $this->db->prepare($query);
                $stmt->execute([$vehicleId, $speed, $direction, $position['x'], $position['y']]);

                // Check for speed violation
                if ($speed > $this->speedLimit) {
                    $excessSpeed = $speed - $this->speedLimit;
                    $fineAmount = $excessSpeed * $this->finePerUnit;

                    $query = "INSERT INTO violations (vehicle_id, speed, fine_amount) 
                             VALUES (?, ?, ?)";
                    $stmt = $this->db->prepare($query);
                    $stmt->execute([$vehicleId, $speed, $fineAmount]);
                }
            }
            return true;
        } catch(PDOException $e) {
            echo "Error generating vehicles: " . $e->getMessage();
            return false;
        }
    }
}

// Create database connection
$database = new Database();
$db = $database->getConnection();

// Generate vehicles
$generator = new VehicleGenerator($db);
$success = $generator->generateVehicles(15); // Generate 15 random vehicles

if ($success) {
    echo "Successfully generated random vehicle data!";
} else {
    echo "Error generating vehicle data.";
}
?> 