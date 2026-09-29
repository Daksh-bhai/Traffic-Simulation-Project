<?php
class Database {
    private $host = "localhost";
    private $db_name = "traffic_system";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            // PDO stands for php data object which is inbuild class in php which help to set connection to mysql,sqlite etc securely
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            //  This helps in catching and debugging errors easily.
            $this->conn->exec("set names utf8");
            // character encoding to utf8 to allow database to use a wide range of characters
        } catch(PDOException $e) {
            echo "Connection error: " . $e->getMessage();
        }
        
        return $this->conn;
    }
}
?> 