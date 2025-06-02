export namespace models {
	
	export class Server {
	    id: number;
	    name: string;
	    desc?: string;
	    ip: string;
	    ssh_user: string;
	    ssh_pass?: string;
	    ssh_key?: string;
	    ssh_port: number;
	    db_port: number;
	    local_port: number;
	    con_status?: number;
	
	    static createFrom(source: any = {}) {
	        return new Server(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.desc = source["desc"];
	        this.ip = source["ip"];
	        this.ssh_user = source["ssh_user"];
	        this.ssh_pass = source["ssh_pass"];
	        this.ssh_key = source["ssh_key"];
	        this.ssh_port = source["ssh_port"];
	        this.db_port = source["db_port"];
	        this.local_port = source["local_port"];
	        this.con_status = source["con_status"];
	    }
	}

}

