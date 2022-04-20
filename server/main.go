package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	fmt.Println("Hello, World!")
	r := mux.NewRouter();

	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello, World!")
	})

	s := &http.Server{
		Addr: ":8080",
		Handler: r,
	}

	s.ListenAndServe()
}
