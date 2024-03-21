import React, { useState, useEffect } from "react";
import "./App.css";

function Task({ task, onMoveLeft, onMoveRight, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(task.content);

  const handleMoveLeft = () => {
    if (onMoveLeft && task.column > 1) {
      onMoveLeft(task.id);
    }
  };

  const handleMoveRight = () => {
    if (onMoveRight && task.column < 3) {
      onMoveRight(task.id);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditedContent(task.content);
  };

  const handleSaveEdit = () => {
    if (editedContent.trim() !== "") {
      onEdit(task.id, editedContent);
      setEditing(false);
    }
  };

  const handleDelete = () => {
    onDelete(task.id);
  };

  return (
      <div className="task">
        {editing ? (
            <>
              <input
                  type="text"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
              />
              <button onClick={handleSaveEdit}>Save</button>
              <button onClick={handleCancelEdit}>Cancel</button>
            </>
        ) : (
            <>
              {task.content}
              <div>
                <button onClick={handleMoveLeft} disabled={task.column === 1}>
                  ←
                </button>
                <button onClick={handleMoveRight} disabled={task.column === 3}>
                  →
                </button>
                <button onClick={handleEdit}>Edit</button>
                <button onClick={handleDelete}>Delete</button>
              </div>
            </>
        )}
      </div>
  );
}

function Column({
                  title,
                  tasks,
                  onTaskCreate,
                  onMoveLeft,
                  onMoveRight,
                  onEdit,
                  deleteTask,
                }) {
  const [newTaskContent, setNewTaskContent] = useState("");

  const handleTaskCreate = () => {
    if (newTaskContent.trim() !== "") {
      onTaskCreate(newTaskContent);
      setNewTaskContent("");
    }
  };

  return (
      <div className="column">
        <h2>{title}</h2>
        {tasks.map((task) => (
            <Task
                key={task.id}
                task={task}
                onMoveLeft={onMoveLeft}
                onMoveRight={onMoveRight}
                onDelete={deleteTask}
                onEdit={onEdit}
            />
        ))}
        <div className="new-task">
          <input
              type="text"
              value={newTaskContent}
              onChange={(e) => setNewTaskContent(e.target.value)}
              placeholder="New task"
          />
          <button onClick={handleTaskCreate}>Add Task</button>
        </div>
      </div>
  );
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState({
    1: [],
    2: [],
    3: [],
  });

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    const savedColumns = localStorage.getItem("columns");

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }

    if (savedColumns) {
      setColumns(JSON.parse(savedColumns));
    }
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("tasks", JSON.stringify(tasks));
      console.log(localStorage.getItem("tasks"));
    } else {
      localStorage.removeItem("tasks"); // Удаляем из localStorage, если массив пуст
    }
  }, [tasks]);

  useEffect(() => {
    const hasTasks = Object.values(columns).some(column => column.length > 0);
    if (hasTasks) {
      localStorage.setItem("columns", JSON.stringify(columns));
      console.log(localStorage.getItem("columns"));
    } else {
      localStorage.removeItem("columns");
    }
  }, [columns]);

  const createTask = (content, column) => {
    const newTask = {
      id: tasks.length + 1,
      content,
      column,
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);

    setColumns((prevColumns) => ({
      ...prevColumns,
      [column]: [...prevColumns[column], newTask],
    }));
  };

  const moveTask = (taskId, direction) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const newColumn = task.column + direction;
        const validColumn = Math.max(1, Math.min(3, newColumn));
        return {
          ...task,
          column: validColumn,
        };
      }
      return task;
    });
    setTasks(updatedTasks);
    const taskToMove = updatedTasks.find((task) => task.id === taskId);
    const targetColumn = taskToMove.column;
    if (columns[targetColumn]) {
      setColumns((prevColumns) => ({
        ...prevColumns,
        [targetColumn]: [...prevColumns[targetColumn], taskToMove],
        [targetColumn - direction]: prevColumns[
        targetColumn - direction
            ].filter((task) => task.id !== taskId),
      }));
    }
  };

  const editTask = (taskId, newContent) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          content: newContent,
        };
      }
      return task;
    });
    setTasks(updatedTasks);
    for (const column in columns) {
      setColumns((prevColumns) => ({
        ...prevColumns,
        [column]: prevColumns[column].map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              content: newContent,
            };
          }
          return task;
        }),
      }));
    }
  };

  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
    for (const column in columns) {
      setColumns((prevColumns) => ({
        ...prevColumns,
        [column]: prevColumns[column].filter((task) => task.id !== taskId),
      }));
    }
  };

  return (
      <div className="app">
        <h1>Task Tracker</h1>
        <div className="columns-container">
          <Column
              title="To Do"
              tasks={columns[1]}
              onTaskCreate={(content) => createTask(content, 1)}
              onMoveLeft={(taskId) => moveTask(taskId, -1)}
              onMoveRight={(taskId) => moveTask(taskId, 1)}
              deleteTask={deleteTask}
              onEdit={editTask}
          />
          <Column
              title="In Progress"
              tasks={columns[2]}
              onTaskCreate={(content) => createTask(content, 2)}
              onMoveLeft={(taskId) => moveTask(taskId, -1)}
              onMoveRight={(taskId) => moveTask(taskId, 1)}
              deleteTask={deleteTask}
              onEdit={editTask}
          />
          <Column
              title="Done"
              tasks={columns[3]}
              onTaskCreate={(content) => createTask(content, 3)}
              onMoveLeft={(taskId) => moveTask(taskId, -1)}
              onMoveRight={(taskId) => moveTask(taskId, 1)}
              deleteTask={deleteTask}
              onEdit={editTask}
          />
        </div>
      </div>
  );
}

export default App;
