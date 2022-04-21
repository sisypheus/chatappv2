package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func newHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

var Hubs = make(map[string]*Hub)

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
}

type Client struct {
	hub  *Hub
	conn *websocket.Conn
	send chan []byte
	User
}

type User struct {
	id   string
	name string
}

func main() {
	r := mux.NewRouter()

	r.HandleFunc("/{room}", wsEndpoint)

	s := &http.Server{
		Addr:    ":8080",
		Handler: r,
	}

	log.Fatal(s.ListenAndServe())
}

func GenUserId() string {
	uuid := uuid.NewString()
	return uuid
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			clientId := client.id
			for client := range h.clients {
				msg := []byte("some one join room (ID: " + clientId + ")")
				client.send <- msg
			}

			h.clients[client] = true

		case client := <-h.unregister:
			clientId := client.id
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			for client := range h.clients {
				msg := []byte("some one leave room (ID:" + clientId + ")")
				client.send <- msg
			}
		case userMessage := <-h.broadcast:
			var data map[string][]byte
			json.Unmarshal(userMessage, &data)

			for client := range h.clients {
				if client.id == string(data["id"]) {
					continue
				}
				select {
				case client.send <- data["message"]:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

func wsEndpoint(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	ws, err := upgrader.Upgrade(w, r, nil)
	vars := mux.Vars(r)
	if err != nil {
		log.Println(err)
		return
	}

	var hub *Hub
	if _, ok := Hubs[vars["room"]]; ok {
		hub = Hubs[vars["room"]]
	} else {
		hub = newHub()
		Hubs[vars["room"]] = hub
		go hub.run()
	}
	user := User{GenUserId(), "test"}
	client := &Client{hub, ws, make(chan []byte), user}
	client.hub.register <- client

	go client.writePump()
	go client.readPump()
	client.send <- []byte("Welcome to the room " + vars["room"])
}

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 512
)

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		message = bytes.TrimSpace(bytes.Replace(message, newline, space, -1))
		data := map[string][]byte{
			"message": message,
			"id":      []byte(c.id),
		}
		userMessage, err := json.Marshal(data)
		if err != nil {
			log.Println(err)
			return
		}
		c.hub.broadcast <- userMessage
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write(newline)
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
