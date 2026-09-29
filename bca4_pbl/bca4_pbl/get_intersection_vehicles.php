<?php
header('Content-Type: application/json');
require_once 'database.php';

$database = new Database();
$db = $database->getConnection();

// Get all vehicles and their latest positions
$query = "SELECT 
            v.id,
            v.speed,
            v.direction,
            v.position_x,
            v.position_y,
            v.created_at,
            CASE 
                WHEN v.speed > 3 THEN (v.speed - 3) * 100
                ELSE 0
            END as potential_fine,
            CASE 
                WHEN v.speed > 3 THEN 'Violation'
                ELSE 'Normal'
            END as status,
            TIMESTAMPDIFF(SECOND, v.created_at, NOW()) as time_elapsed
        FROM vehicles v
        WHERE 1
        ORDER BY v.created_at DESC";

try {
    $stmt = $db->prepare($query);
    $stmt->execute();
    $vehicles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate current positions based on time elapsed
    foreach ($vehicles as &$vehicle) {
        $timeElapsed = $vehicle['time_elapsed'];
        $speed = floatval($vehicle['speed']);
        
        // Calculate current position based on direction and speed
        if ($vehicle['direction'] === 'horizontal') {
            $vehicle['current_x'] = $vehicle['position_x'] + ($speed * $timeElapsed);
            $vehicle['current_y'] = $vehicle['position_y'];
        } else {
            $vehicle['current_x'] = $vehicle['position_x'];
            $vehicle['current_y'] = $vehicle['position_y'] + ($speed * $timeElapsed);
        }
        
        // Check if vehicle is in intersection area
        $vehicle['in_intersection'] = 
            ($vehicle['direction'] === 'horizontal' && abs($vehicle['current_x'] - 500) < 50) ||
            ($vehicle['direction'] === 'vertical' && abs($vehicle['current_y'] - 400) < 50);
            
        // Calculate distance from intersection center
        $vehicle['distance_from_center'] = sqrt(
            pow($vehicle['current_x'] - 500, 2) + 
            pow($vehicle['current_y'] - 400, 2)
        );
    }
    
    // Sort vehicles by distance from intersection center
    usort($vehicles, function($a, $b) {
        return $a['distance_from_center'] - $b['distance_from_center'];
    });
    
    echo json_encode([
        'success' => true,
        'vehicles' => $vehicles,
        'timestamp' => date('Y-m-d H:i:s'),
        'update_time' => time()
    ]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 