import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Note {
  _id: string;
  text: string;
}

interface Todo {
  _id: string;
  title: string;
  notes: Note[];
  newNote: string; // Add this property
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  todos: Todo[] = [];
  newTodo: Todo = {
    _id: '',
    title: '',
    notes: [],
    newNote: ''
  };
  newNote: Note = {
    _id: '',
    text: '',
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchTodos();
  }

  fetchTodos(): void {
    this.http.get<Todo[]>('http://localhost:3000/api/todos').subscribe(
      (todos) => {
        this.todos = todos.map((todo) => ({ ...todo, newNote: '' })); // Initialize newNote for each Todo
      },
      (error) => {
        console.error('Error retrieving Todos:', error);
      }
    );
  }
  

  addTodo(): void {
    if (this.newTodo.title.trim() !== '') {
      this.http
        .post<Todo>('http://localhost:3000/api/todos', this.newTodo)
        .subscribe(
          (todo) => {
            this.todos.push(todo);
            this.newTodo.title = '';
          },
          (error) => {
            console.error('Error adding Todo:', error);
          }
        );
    }
  }

  addNoteButtonClick(todo: Todo): void {
    if (todo.newNote.trim() !== '') {
      const newNote: Note = { _id: '', text: todo.newNote };
      this.http
        .post<Todo>(
          `http://localhost:3000/api/todos/${todo._id}/notes`,
          { text: todo.newNote }
        )
        .subscribe(
          (updatedTodo) => {
            const index = this.todos.findIndex((t) => t._id === updatedTodo._id);
            if (index !== -1) {
              this.todos[index] = { ...updatedTodo, newNote: '' }; // Reset newNote after adding note
            }
          },
          (error) => {
            console.error('Error adding Note:', error);
          }
        );
    }
  }
  
  
  
  editNoteClick(note: Note): void {
    const newText = prompt('Enter the new note text:', note.text);
    if (newText !== null && newText.trim() !== '') {
      this.http
        .put<Todo>(
          `http://localhost:3000/api/todos/${note._id}/notes/${note._id}`,
          { text: newText }
        )
        .subscribe(
          (updatedTodo) => {
            const todoIndex = this.todos.findIndex((t) =>
              t.notes.some((n) => n._id === note._id)
            );
            if (todoIndex !== -1) {
              const noteIndex = this.todos[todoIndex].notes.findIndex(
                (n) => n._id === note._id
              );
              if (noteIndex !== -1) {
                this.todos[todoIndex].notes[noteIndex].text = newText;
              }
            }
          },
          (error) => {
            console.error('Error editing Note:', error);
          }
        );
    }
  }

  editTitleClick(todo: Todo): void {
    const newTitle = prompt('Enter the new title:', todo.title);
    if (newTitle !== null && newTitle.trim() !== '') {
      this.http
        .put<Todo>(`http://localhost:3000/api/todos/${todo._id}`, {
          ...todo,
          title: newTitle,
        })
        .subscribe(
          (updatedTodo) => {
            const index = this.todos.findIndex((t) => t._id === updatedTodo._id);
            if (index !== -1) {
              this.todos[index].title = newTitle;
            }
          },
          (error) => {
            console.error('Error editing Title:', error);
          }
        );
    }
  }

  deleteCardClick(todo: Todo): void {
    console.log('Deleting Todo:', todo._id);
    console.log('Before deletion:', this.todos);
    
    this.http
      .delete(`http://localhost:3000/api/todos/${todo._id}`)
      .subscribe(
        () => {
          const index = this.todos.findIndex((t) => t._id === todo._id);
          if (index !== -1) {
            this.todos.splice(index, 1); // Remove the deleted todo from the array
            console.log('After deletion:', this.todos);
          }
        },
        (error) => {
          console.error('Error deleting Todo:', error);
          console.log('Error Response:', error.error.message);
        }        
      );
  }
}

