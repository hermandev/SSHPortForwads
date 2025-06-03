package main

import (
	"SSHPortForwads/src/config"
	"SSHPortForwads/src/models"
	"SSHPortForwads/src/repository"
	"context"
	"fmt"
	"io"
	"net"
	"strconv"
	"sync"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.org/x/crypto/ssh"
)

type SSHForwarder struct {
	Server   models.Server
	StopChan chan struct{}
}

type StatusMessage struct {
	ID      int    `json:"id"`
	Error   bool   `json:"error"`
	Message string `json:"message"`
}

// App struct
type App struct {
	ctx         context.Context
	mu          sync.Mutex
	forwardings map[string]*SSHForwarder
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		forwardings: make(map[string]*SSHForwarder),
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	config.InitDB()
	a.ctx = ctx
}

func (a *App) SaveConnection(c models.Server) error {
	_, err := repository.CreateServer(&c)
	if err != nil {
		return err
	}
	return nil
}

func (a *App) UpdateConnection(c models.Server) error {
	err := repository.UpdateServer(&c)
	if err != nil {
		return err
	}
	return nil
}

func (a *App) DeleteConnection(id int) error {
	a.StopSSHForward(id)
	err := repository.DeleteServer(id)
	if err != nil {
		return err
	}
	return nil
}

func (a *App) LoadConnections() ([]models.Server, error) {
	conns, err := repository.GetAllServers()
	return conns, err
}

func (a *App) StartSSHForward(id int) {
	fmt.Println("Start SSH Forwarding")

	c, err := repository.GetServerByID(id)
	if err != nil {
		runtime.EventsEmit(a.ctx, "status", StatusMessage{ID: id, Error: true, Message: fmt.Sprintf("Failed to fetch server: %v", err)})
		return
	}

	ID := strconv.Itoa(c.ID)
	localPort := strconv.Itoa(c.LocalPort)
	remotePort := strconv.Itoa(c.DBPort)

	a.mu.Lock()
	if _, exists := a.forwardings[ID]; exists {
		a.mu.Unlock()
		runtime.EventsEmit(a.ctx, "status", StatusMessage{ID: id, Error: true, Message: fmt.Sprintf("[%s] is already active", c.Name)})
		repository.UpdatePartialServer(c.ID, map[string]interface{}{"con_status": 1})
		return
	}
	stopChan := make(chan struct{})
	a.forwardings[ID] = &SSHForwarder{Server: *c, StopChan: stopChan}
	a.mu.Unlock()

	var authMethod ssh.AuthMethod
	if c.SSHKey != nil && *c.SSHKey != "" {
		key := []byte(*c.SSHKey)
		parsedKey, err := ssh.ParsePrivateKey(key)
		if err != nil {
			runtime.EventsEmit(a.ctx, "status", StatusMessage{ID: id, Error: true, Message: fmt.Sprintf("[%s] Failed to parse SSH key: %v", c.Name, err)})
			return
		}
		authMethod = ssh.PublicKeys(parsedKey)
	} else if c.SSHPass != nil && *c.SSHPass != "" {
		authMethod = ssh.Password(*c.SSHPass)
	} else {
		runtime.EventsEmit(a.ctx, "status", StatusMessage{ID: id, Error: true, Message: fmt.Sprintf("[%s] No authentication method", c.Name)})
		return
	}

	sshConfig := &ssh.ClientConfig{
		User:            c.SSHUser,
		Auth:            []ssh.AuthMethod{authMethod},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
	}
	sshAddress := fmt.Sprintf("%s:%d", c.IP, c.SSHPort)
	client, err := ssh.Dial("tcp", sshAddress, sshConfig)
	if err != nil {
		runtime.EventsEmit(a.ctx, "status", StatusMessage{ID: id, Error: true, Message: fmt.Sprintf("[%s] SSH connection failed: %v", c.Name, err)})
		return
	}

	listenAddress := "127.0.0.1:" + localPort
	listener, err := net.Listen("tcp", listenAddress)
	if err != nil {
		runtime.EventsEmit(a.ctx, "status", StatusMessage{ID: id, Error: true, Message: fmt.Sprintf("[%s] Failed to listen on %s: %v", c.Name, listenAddress, err)})
		client.Close()
		return
	}

	repository.UpdatePartialServer(c.ID, map[string]interface{}{"con_status": 1})
	runtime.EventsEmit(a.ctx, "status", StatusMessage{ID: id, Error: false, Message: fmt.Sprintf("[%s] SSH forwarding started", c.Name)})

	go func() {
		defer client.Close()
		defer listener.Close()

		for {
			select {
			case <-stopChan:
				runtime.EventsEmit(a.ctx, "status", StatusMessage{ID: id, Error: false, Message: fmt.Sprintf("[%s] Forwarding stopped", c.Name)})
				return
			default:
				conn, err := listener.Accept()
				if err != nil {
					runtime.EventsEmit(a.ctx, "status", StatusMessage{ID: id, Error: true, Message: fmt.Sprintf("[%s] Listener error: %v", c.Name, err)})
					continue
				}

				go func() {
					defer conn.Close()

					remoteAddress := "127.0.0.1:" + remotePort
					rconn, err := client.Dial("tcp", remoteAddress)
					if err != nil {
						runtime.EventsEmit(a.ctx, "status", StatusMessage{ID: id, Error: true, Message: fmt.Sprintf("[%s] Failed to connect to %s: %v", c.Name, remoteAddress, err)})
						return
					}
					defer rconn.Close()

					go io.Copy(rconn, conn)
					io.Copy(conn, rconn)
				}()
			}
		}
	}()
}

func (a *App) StopSSHForward(id int) {
	a.mu.Lock()
	defer a.mu.Unlock()

	c, err := repository.GetServerByID(id)
	if err != nil {
		runtime.EventsEmit(a.ctx, "status", StatusMessage{ID: id, Error: true, Message: fmt.Sprintf("Failed to fetch server: %v", err)})
		return
	}

	repository.UpdatePartialServer(c.ID, map[string]interface{}{"con_status": 0})

	ID := strconv.Itoa(id)
	if fw, exists := a.forwardings[ID]; exists {
		close(fw.StopChan)
		delete(a.forwardings, ID)
		runtime.EventsEmit(a.ctx, "status", StatusMessage{ID: id, Error: false, Message: fmt.Sprintf("[%s] Forwarding is stopped", c.Name)})
	} else {
		runtime.EventsEmit(a.ctx, "status", StatusMessage{ID: id, Error: true, Message: fmt.Sprintf("[%s] Forwarding not found or already stopped", c.Name)})
	}
}