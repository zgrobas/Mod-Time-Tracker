<?php
/**
 * MOD Tracker - Backend API (MySQL Persistent - Multi-user Independent Tracking)
 */

error_reporting(0);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$host = 'localhost'; 
$db   = 'mod_tracker_db';
$user = 'mod_user';
$pass = '^k256Ops7'; 
$charset = 'utf8mb4';

try {
    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    echo json_encode(["error" => "DB_CONNECTION_FAILED", "details" => $e->getMessage()]);
    exit;
}

try {
    // 1. Tabla de Usuarios
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY, 
        username VARCHAR(100) UNIQUE, 
        password VARCHAR(255), 
        role VARCHAR(20), 
        avatar_seed VARCHAR(100), 
        last_login DATETIME, 
        project_order TEXT
    ) ENGINE=InnoDB;");

    // 2. Tabla de Proyectos (Metadatos Globales)
    $pdo->exec("CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(50) PRIMARY KEY, 
        creator_id VARCHAR(50), 
        name VARCHAR(255), 
        category VARCHAR(255), 
        color VARCHAR(50), 
        is_global TINYINT(1) DEFAULT 0, 
        is_active TINYINT(1) DEFAULT 1
    ) ENGINE=InnoDB;");

    // Asegurar columnas para compatibilidad con versiones previas
    try { $pdo->exec("ALTER TABLE projects ADD COLUMN creator_id VARCHAR(50) AFTER id"); } catch (Exception $e) {}
    try { $pdo->exec("ALTER TABLE projects ADD COLUMN is_global TINYINT(1) DEFAULT 0"); } catch (Exception $e) {}
    try { $pdo->exec("ALTER TABLE projects ADD COLUMN is_active TINYINT(1) DEFAULT 1"); } catch (Exception $e) {}

    // 3. NUEVA Tabla de Rastreo Individual por Usuario
    $pdo->exec("CREATE TABLE IF NOT EXISTS user_projects (
        user_id VARCHAR(50),
        project_id VARCHAR(50),
        running_since VARCHAR(50) NULL, 
        current_day_seconds INT DEFAULT 0,
        hidden_by_user TINYINT(1) DEFAULT 0,
        PRIMARY KEY (user_id, project_id)
    ) ENGINE=InnoDB;");

    // 4. Tabla de Logs Históricos
    $pdo->exec("CREATE TABLE IF NOT EXISTS logs (
        id VARCHAR(50) PRIMARY KEY, 
        user_id VARCHAR(50), 
        project_id VARCHAR(50), 
        project_name VARCHAR(255), 
        date_str VARCHAR(50), 
        duration_seconds INT, 
        status VARCHAR(50), 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;");

    // Usuario Admin por defecto
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = 'Admin'");
    $stmt->execute();
    if ($stmt->fetchColumn() == 0) {
        $pdo->prepare("INSERT INTO users (id, username, password, role, avatar_seed, last_login, project_order) VALUES (?,?,?,?,?,?,?)")
            ->execute(['admin-001', 'Admin', '123456789', 'ADMIN', 'admin-default', date('Y-m-d H:i:s'), '[]']);
    }
} catch (Exception $e) {}

$action = $_GET['action'] ?? 'status';

switch($action) {
    case 'status':
        echo json_encode(["status" => "online", "db" => "ok", "server_time" => date('c')]);
        break;

    case 'get_users':
        echo json_encode($pdo->query("SELECT * FROM users")->fetchAll());
        break;
    
    case 'save_user':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO users (id, username, password, role, avatar_seed, last_login, project_order) VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE username=VALUES(username), password=VALUES(password), role=VALUES(role), last_login=VALUES(last_login), project_order=VALUES(project_order)");
        $stmt->execute([$data['id'], $data['username'], $data['password'], $data['role'], $data['avatarSeed'], $data['lastLogin'], json_encode($data['projectOrder'] ?? [])]);
        echo json_encode(["status" => "ok"]);
        break;

    case 'get_projects':
        $requestUserId = $_GET['userId'] ?? 'none';
        $stmt = $pdo->prepare("
            SELECT 
                p.*, 
                up.running_since, 
                up.current_day_seconds,
                up.hidden_by_user
            FROM projects p
            LEFT JOIN user_projects up ON p.id = up.project_id AND up.user_id = ?
            WHERE p.is_active = 1 OR p.creator_id = ? OR (SELECT role FROM users WHERE id = ?) = 'ADMIN'
        ");
        $stmt->execute([$requestUserId, $requestUserId, $requestUserId]);
        echo json_encode($stmt->fetchAll());
        break;

    case 'save_project':
        $data = json_decode(file_get_contents('php://input'), true);
        $userId = $data['userId'] ?? null;
        
        $pdo->beginTransaction();
        
        $stmtP = $pdo->prepare("INSERT INTO projects (id, creator_id, name, category, color, is_global, is_active) VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name), category=VALUES(category), color=VALUES(color), is_global=VALUES(is_global), is_active=VALUES(is_active)");
        $stmtP->execute([
            $data['id'], 
            $data['creatorId'] ?? $userId, 
            $data['name'], 
            $data['category'], 
            $data['color'], 
            $data['isGlobal'] ? 1 : 0, 
            ($data['isActive'] === false) ? 0 : 1
        ]);

        if ($userId) {
            $stmtUP = $pdo->prepare("INSERT INTO user_projects (user_id, project_id, running_since, current_day_seconds, hidden_by_user) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE running_since=VALUES(running_since), current_day_seconds=VALUES(current_day_seconds), hidden_by_user=VALUES(hidden_by_user)");
            $stmtUP->execute([
                $userId,
                $data['id'],
                $data['runningSince'] ?? null,
                $data['currentDaySeconds'] ?? 0,
                isset($data['isHiddenForUser']) ? ($data['isHiddenForUser'] ? 1 : 0) : 0
            ]);
        }
        
        $pdo->commit();
        echo json_encode(["status" => "ok"]);
        break;

    case 'delete_project':
        $id = $_GET['id'] ?? '';
        if ($id) {
            $pdo->beginTransaction();
            $pdo->prepare("DELETE FROM logs WHERE project_id = ?")->execute([$id]);
            $pdo->prepare("DELETE FROM user_projects WHERE project_id = ?")->execute([$id]);
            $pdo->prepare("DELETE FROM projects WHERE id = ?")->execute([$id]);
            $pdo->commit();
            echo json_encode(["status" => "ok"]);
        } else {
            echo json_encode(["error" => "ID_REQUIRED"]);
        }
        break;

    case 'get_logs':
        $userId = $_GET['userId'] ?? null;
        if ($userId) {
            $stmt = $pdo->prepare("SELECT * FROM logs WHERE user_id = ? ORDER BY created_at DESC");
            $stmt->execute([$userId]);
            echo json_encode($stmt->fetchAll());
        } else {
            echo json_encode($pdo->query("SELECT * FROM logs ORDER BY created_at DESC")->fetchAll());
        }
        break;

    case 'save_log':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO logs (id, user_id, project_id, project_name, date_str, duration_seconds, status) VALUES (?,?,?,?,?,?,?)");
        $stmt->execute([$data['id'], $data['userId'], $data['projectId'], $data['projectName'], $data['date'], $data['durationSeconds'], $data['status']]);
        echo json_encode(["status" => "ok"]);
        break;

    case 'delete_log':
        $id = $_GET['id'] ?? '';
        $stmt = $pdo->prepare("DELETE FROM logs WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["status" => "ok"]);
        break;

    default:
        http_response_code(404);
        echo json_encode(["error" => "Acción no válida"]);
        break;
}
?>