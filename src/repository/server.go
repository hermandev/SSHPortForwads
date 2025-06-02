package repository

import (
	"SSHPortForwads/src/config"
	"SSHPortForwads/src/models"
)

// CreateServer inserts a new server record
func CreateServer(s *models.Server) (int64, error) {
	stmt := `
	INSERT INTO server (name, desc, ip, ssh_user, ssh_pass, ssh_key, ssh_port, db_port, local_port, con_status)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	res, err := config.GetDB().Exec(stmt, s.Name, s.Desc, s.IP, s.SSHUser, s.SSHPass, s.SSHKey, s.SSHPort, s.DBPort, s.LocalPort, s.ConStatus)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

// GetServerByID retrieves a server by ID
func GetServerByID(id int) (*models.Server, error) {
	stmt := `SELECT id, name, desc, ip, ssh_user, ssh_pass, ssh_key, ssh_port, db_port,local_port, con_status FROM server WHERE id = ?`
	row := config.GetDB().QueryRow(stmt, id)

	var s models.Server
	err := row.Scan(&s.ID, &s.Name, &s.Desc, &s.IP, &s.SSHUser, &s.SSHPass, &s.SSHKey, &s.SSHPort, &s.DBPort, &s.LocalPort, &s.ConStatus)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

// GetAllServers retrieves all server records
func GetAllServers() ([]models.Server, error) {
	stmt := `SELECT id, name, desc, ip, ssh_user, ssh_pass, ssh_key, ssh_port, db_port, local_port, con_status FROM server ORDER BY con_status DESC`
	rows, err := config.GetDB().Query(stmt)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var servers []models.Server
	for rows.Next() {
		var s models.Server
		err := rows.Scan(&s.ID, &s.Name, &s.Desc, &s.IP, &s.SSHUser, &s.SSHPass, &s.SSHKey, &s.SSHPort, &s.DBPort, &s.LocalPort, &s.ConStatus)
		if err != nil {
			return nil, err
		}
		servers = append(servers, s)
	}
	return servers, nil
}

// UpdateServer updates an existing server record
func UpdateServer(s *models.Server) error {
	stmt := `
	UPDATE server
	SET name = ?, desc = ?, ip = ?, ssh_user = ?, ssh_pass = ?, ssh_key = ?, ssh_port = ?, db_port = ?,local_port = ?, con_status = ?
	WHERE id = ?
	`
	_, err := config.GetDB().Exec(stmt, s.Name, s.Desc, s.IP, s.SSHUser, s.SSHPass, s.SSHKey, s.SSHPort, s.DBPort, s.LocalPort, s.ConStatus, s.ID)
	return err
}

func UpdatePartialServer(id int, updates map[string]interface{}) error {
	if len(updates) == 0 {
		return nil // Tidak ada perubahan
	}

	query := "UPDATE server SET "
	params := []interface{}{}

	i := 0
	for k, v := range updates {
		if i > 0 {
			query += ", "
		}
		query += k + " = ?"
		params = append(params, v)
		i++
	}
	query += " WHERE id = ?"
	params = append(params, id)

	_, err := config.GetDB().Exec(query, params...)
	return err
}

// DeleteServer deletes a server record by ID
func DeleteServer(id int) error {
	stmt := `DELETE FROM server WHERE id = ?`
	_, err := config.GetDB().Exec(stmt, id)
	return err
}
