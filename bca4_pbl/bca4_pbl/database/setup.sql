-- Create database if not exists
CREATE DATABASE IF NOT EXISTS traffic_system;
USE traffic_system;

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(50) PRIMARY KEY,
    speed FLOAT,
    direction VARCHAR(20),
    position_x FLOAT,
    position_y FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create violations table
CREATE TABLE IF NOT EXISTS violations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id VARCHAR(50),
    speed FLOAT,
    fine_amount FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- Create vehicle_logs table for tracking history
CREATE TABLE IF NOT EXISTS vehicle_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id VARCHAR(50),
    speed FLOAT,
    direction VARCHAR(20),
    position_x FLOAT,
    position_y FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
); 