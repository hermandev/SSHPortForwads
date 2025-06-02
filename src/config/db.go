package config

import (
	"database/sql"
	"embed"
	"log"
	"os"
	"path/filepath"
	"sync"

	_ "github.com/mattn/go-sqlite3"
)

//go:embed data.db
var embeddedDB embed.FS

var (
	db   *sql.DB
	once sync.Once
)

func InitDB() {
	once.Do(func() {
		// Simpan database di direktori home user: ~/.sshportforward/data.db
		homeDir, err := os.UserHomeDir()
		if err != nil {
			log.Fatalf("Cannot find user home directory: %v", err)
		}

		appDir := filepath.Join(homeDir, ".sshportforward")
		dbPath := filepath.Join(appDir, "data.db")

		// Buat folder jika belum ada
		if _, err := os.Stat(appDir); os.IsNotExist(err) {
			err = os.MkdirAll(appDir, 0755)
			if err != nil {
				log.Fatalf("Failed to create app directory: %v", err)
			}
		}

		// Jika file database belum ada, copy dari embedded
		if _, err := os.Stat(dbPath); os.IsNotExist(err) {
			data, err := embeddedDB.ReadFile("data.db")
			if err != nil {
				log.Fatalf("Failed to read embedded DB: %v", err)
			}

			err = os.WriteFile(dbPath, data, 0644)
			if err != nil {
				log.Fatalf("Failed to write DB file: %v", err)
			}
		}

		// Buka koneksi ke database
		db, err = sql.Open("sqlite3", dbPath)
		if err != nil {
			log.Fatalf("Failed to connect to SQLite: %v", err)
		}

		createSchema()
	})
}

func GetDB() *sql.DB {
	if db == nil {
		log.Fatal("Database not initialized. Call InitDB() first.")
	}
	return db
}

func createSchema() {
	schema := `
	CREATE TABLE IF NOT EXISTS server (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		desc TEXT,
		ip TEXT NOT NULL,
		ssh_user TEXT NOT NULL,
		ssh_pass TEXT,
		ssh_key TEXT,
		ssh_port INTEGER NOT NULL,
		db_port INTEGER NOT NULL,
		local_port INTEGER NOT NULL,
		con_status INTEGER -- 0 = disconnect, 1 = connect
	);
	`

	_, err := db.Exec(schema)
	if err != nil {
		log.Fatalf("Failed to initialize schema: %v", err)
	}
}
