<?php
require_once 'database.php';

$database = new Database();
$db = $database->getConnection();

// Get vehicle statistics
$query = "SELECT 
            v.id,
            v.speed,
            v.direction,
            v.position_x,
            v.position_y,
            v.created_at,
            COUNT(vio.id) as violation_count,
            SUM(vio.fine_amount) as total_fines,
            MAX(vio.speed) as max_speed
        FROM vehicles v
        LEFT JOIN violations vio ON v.id = vio.vehicle_id
        GROUP BY v.id
        ORDER BY v.created_at DESC";

$stmt = $db->prepare($query);
$stmt->execute();
$vehicles = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Get overall statistics
$statsQuery = "SELECT 
    COUNT(DISTINCT v.id) as total_vehicles,
    COUNT(DISTINCT vio.vehicle_id) as vehicles_with_violations,
    SUM(vio.fine_amount) as total_fines_collected,
    AVG(v.speed) as average_speed
FROM vehicles v
LEFT JOIN violations vio ON v.id = vio.vehicle_id";

$statsStmt = $db->prepare($statsQuery);
$statsStmt->execute();
$stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Traffic System - Vehicle Information</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .violation-alert {
            background-color: #ffebee;
            border-left: 4px solid #f44336;
        }
        .speed-warning {
            color: #f44336;
            font-weight: bold;
        }
        .stats-card {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }
        .stats-value {
            font-size: 24px;
            font-weight: bold;
            color: #2196F3;
        }
    </style>
</head>
<body>
    <div class="container mt-4">
        <h2>Traffic System Dashboard</h2>
        <p>Last updated: <?php echo date('Y-m-d H:i:s'); ?></p>

        <!-- Statistics Cards -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="stats-card">
                    <h5>Total Vehicles</h5>
                    <div class="stats-value"><?php echo $stats['total_vehicles']; ?></div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card">
                    <h5>Vehicles with Violations</h5>
                    <div class="stats-value"><?php echo $stats['vehicles_with_violations']; ?></div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card">
                    <h5>Total Fines</h5>
                    <div class="stats-value">$<?php echo number_format($stats['total_fines_collected'], 2); ?></div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card">
                    <h5>Average Speed</h5>
                    <div class="stats-value"><?php echo number_format($stats['average_speed'], 2); ?></div>
                </div>
            </div>
        </div>
        
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Vehicle ID</th>
                        <th>Speed</th>
                        <th>Direction</th>
                        <th>Position</th>
                        <th>Last Updated</th>
                        <th>Violations</th>
                        <th>Max Speed</th>
                        <th>Total Fines</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($vehicles as $vehicle): ?>
                        <tr class="<?php echo $vehicle['violation_count'] > 0 ? 'violation-alert' : ''; ?>">
                            <td><?php echo htmlspecialchars($vehicle['id']); ?></td>
                            <td class="<?php echo $vehicle['speed'] > 3 ? 'speed-warning' : ''; ?>">
                                <?php echo number_format($vehicle['speed'], 2); ?>
                            </td>
                            <td><?php echo htmlspecialchars($vehicle['direction']); ?></td>
                            <td>
                                (<?php echo number_format($vehicle['position_x'], 2); ?>, 
                                <?php echo number_format($vehicle['position_y'], 2); ?>)
                            </td>
                            <td><?php echo date('Y-m-d H:i:s', strtotime($vehicle['created_at'])); ?></td>
                            <td><?php echo $vehicle['violation_count']; ?></td>
                            <td class="<?php echo $vehicle['max_speed'] > 3 ? 'speed-warning' : ''; ?>">
                                <?php echo number_format($vehicle['max_speed'], 2); ?>
                            </td>
                            <td>$<?php echo number_format($vehicle['total_fines'], 2); ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

        <!-- Generate New Vehicles Button -->
        <div class="mt-4">
            <a href="generate_vehicles.php" class="btn btn-primary">Generate New Vehicles</a>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Auto-refresh the page every 30 seconds
        setTimeout(function() {
            location.reload();
        }, 30000);
    </script>
</body>
</html> 