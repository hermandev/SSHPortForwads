package models

type Server struct {
	ID        int     `json:"id"`
	Name      string  `json:"name"`
	Desc      *string `json:"desc,omitempty"` // nullable
	IP        string  `json:"ip"`
	SSHUser   string  `json:"ssh_user"`
	SSHPass   *string `json:"ssh_pass,omitempty"` // nullable
	SSHKey    *string `json:"ssh_key,omitempty"`  // nullable
	SSHPort   int     `json:"ssh_port"`
	DBPort    int     `json:"db_port"`
	LocalPort int     `json:"local_port"`
	ConStatus *int    `json:"con_status,omitempty"` // nullable, 0 = disconnect, 1 = connect
}
