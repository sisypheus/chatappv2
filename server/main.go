package main

import (
	"log"
	"net/http"
	"os"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type Subscription struct {
	conn *Connection
	room string
}

type User struct {
	id   string
	name string
}

type Connection struct {
	ws   *websocket.Conn
	send chan []byte
	user User
}

func genUserId() string {
	uid := uuid.NewString()
	return uid
}

var h = Hub{
	broadcast:  make(chan Message),
	register:   make(chan Subscription),
	unregister: make(chan Subscription),
	rooms:      make(map[string]map[*Connection]bool),
}

func serveWs(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	vars := mux.Vars(r)
	name := r.URL.Query().Get("name")
	if name == "" {
		return
	}
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	user := &User{id: genUserId(), name: name}
	conn := &Connection{send: make(chan []byte, 256), ws: ws, user: *user}
	sub := Subscription{conn, vars["room"]}
	h.register <- sub
	go sub.writePump()
	sub.readPump()
}

func main() {
	maxOpenFiles()

	go h.Run()
	r := mux.NewRouter()
	r.HandleFunc("/{room}", serveWs)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	err := http.ListenAndServe(":"+port, r)

	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
