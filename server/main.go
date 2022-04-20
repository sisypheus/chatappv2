package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func main() {
	r := mux.NewRouter()

	r.HandleFunc("/", wsEndpoint)

	s := &http.Server{
		Addr:    ":8080",
		Handler: r,
	}

	s.ListenAndServe()
}

func wsEndpoint(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
	}

	err = ws.WriteMessage(1, []byte("Hello, Client!"))
	if err != nil {
		log.Println(err)
	}
	go reader(ws)
}

func reader(ws *websocket.Conn) {
	for {
		messageType, p, err := ws.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}
		log.Println("Received: ", string(p))
		err = ws.WriteMessage(messageType, []byte("Message received"))
		if err != nil {
			log.Println(err)
			return
		}
	}
}
