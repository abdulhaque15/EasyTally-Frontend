import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi';

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    
    const todo = {
      id: Date.now(),
      text: newTodo,
      completed: false,
      createdAt: new Date().toISOString()
    };

    setTodos([...todos, todo]);
    setNewTodo('');
  };

  const handleToggleComplete = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleDeleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const startEditing = (id, text) => {
    setEditingId(id);
    setEditText(text);
  };

  const handleEditTodo = () => {
    if (!editText.trim()) return;
    
    setTodos(todos.map(todo =>
      todo.id === editingId ? { ...todo, text: editText } : todo
    ));
    setEditingId(null);
    setEditText('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  return (
    <div className="todo-container d-flex justify-content-start">
      <div className="todo-card border w-100">
        <h3>What TODO</h3>
        <div className="todo-input-container">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="What needs to be done?"
            onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
            className="todo-input"
          />
          <button onClick={handleAddTodo} className="add-button">
            <FiPlus className="icon" />
          </button>
        </div>

        <div className="todo-list-container">
          {todos.length === 0 ? (
            <div className="empty-state">
              <p>No tasks yet. Add one above!</p>
            </div>
          ) : (
            <ul className="todo-list">
              {todos.map(todo => (
                <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                  {editingId === todo.id ? (
                    <div className="edit-container">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleEditTodo()}
                        className="edit-input"
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button onClick={handleEditTodo} className="save-button">
                          <FiCheck className="icon" />
                        </button>
                        <button onClick={cancelEditing} className="cancel-button">
                          <FiX className="icon" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="todo-content">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => handleToggleComplete(todo.id)}
                          className="checkbox"
                        />
                        <span className="todo-text">{todo.text}</span>
                        <div className="todo-date">
                          {new Date(todo.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="todo-actions">
                        <button 
                          onClick={() => startEditing(todo.id, todo.text)} 
                          className="edit-button"
                        >
                          <FiEdit2 className="icon" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTodo(todo.id)} 
                          className="delete-button"
                        >
                          <FiTrash2 className="icon" />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="todo-footer">
          {todos.length > 0 && (
            <p>
              {todos.filter(t => t.completed).length} of {todos.length} tasks completed
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoApp;