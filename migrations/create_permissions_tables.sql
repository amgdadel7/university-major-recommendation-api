-- Permissions Table - جدول الصلاحيات
;
CREATE TABLE IF NOT EXISTS Permissions (
    PermissionID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Description TEXT NULL,
    Module VARCHAR(50) NOT NULL,
    Action VARCHAR(50) NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_module_action (Module, Action),
    INDEX idx_module (Module)
) ENGINE=InnoDB;

-- Roles Table - جدول الأدوار
CREATE TABLE IF NOT EXISTS Roles (
    RoleID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL UNIQUE,
    Description TEXT NULL,
    IsCustom BOOLEAN DEFAULT TRUE,
    IsDefault BOOLEAN DEFAULT FALSE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_default (IsDefault)
) ENGINE=InnoDB;

-- RolePermissions Table - جدول ربط الأدوار بالصلاحيات
CREATE TABLE IF NOT EXISTS RolePermissions (
    RolePermissionID INT AUTO_INCREMENT PRIMARY KEY,
    RoleID INT NOT NULL,
    PermissionID INT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID) ON DELETE CASCADE,
    FOREIGN KEY (PermissionID) REFERENCES Permissions(PermissionID) ON DELETE CASCADE,
    UNIQUE KEY uq_role_permission (RoleID, PermissionID),
    INDEX idx_role (RoleID),
    INDEX idx_permission (PermissionID)
) ENGINE=InnoDB;

-- UserRoles Table - جدول ربط المستخدمين بالأدوار
CREATE TABLE IF NOT EXISTS UserRoles (
    UserRoleID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    UserType ENUM('student', 'teacher', 'admin', 'university') NOT NULL,
    RoleID INT NOT NULL,
    AssignedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    AssignedBy INT NULL,
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID) ON DELETE CASCADE,
    INDEX idx_user (UserID, UserType),
    INDEX idx_role (RoleID)
) ENGINE=InnoDB;

