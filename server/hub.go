package main

type Hub struct {
	rooms      map[string]map[*Connection]bool
	broadcast  chan Message
	register   chan Subscription
	unregister chan Subscription
}


func (h *Hub) Run() {
	for {
		select {
		case s := <-h.register:
			connections := h.rooms[s.room]
			if connections == nil {
				connections = make(map[*Connection]bool)
				h.rooms[s.room] = connections
			}
			h.rooms[s.room][s.conn] = true
			sendToRoomExcept(s.room, []byte(s.conn.user.name+" joined the room"), s.conn)
		case s := <-h.unregister:
			connections := h.rooms[s.room]
			if connections != nil {
				if _, ok := connections[s.conn]; ok {
					delete(connections, s.conn)
					close(s.conn.send)
					if len(connections) == 0 {
						delete(h.rooms, s.room)
					}
				}
			}
			sendToRoomExcept(s.room, []byte(s.conn.user.name+" left the room"), s.conn)
		case m := <-h.broadcast:
			connections := h.rooms[m.room]
			for c := range connections {
				if c.user.id != m.id {
					select {
					case c.send <- m.data:
					default:
						close(c.send)
						delete(connections, c)
						if len(connections) == 0 {
							delete(h.rooms, m.room)
						}
					}
				}
			}
		}
	}
}