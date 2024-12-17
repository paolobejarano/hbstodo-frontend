import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null); // Edit mode task ID
  const [editFields, setEditFields] = useState({
    title: "",
    detail: "",
    state: "",
    due_date: "",
  }); // Fields for editing

  const API_URL = process.env.REACT_APP_API_URL;

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Add a new task
  const addTask = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(API_URL, {
        title,
        detail,
        due_date: dueDate,
        state: "PENDING",
      });
      setTasks([...tasks, response.data]);
      setTitle("");
      setDetail("");
      setDueDate("");
      setError("");
    } catch (error) {
      setError(error.response?.data?.title || "Failed to add task.");
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Update task
  const updateTask = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}`, editFields);
      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, ...editFields } : task
        )
      );
      setEditingTaskId(null);
      setEditFields({ title: "", detail: "", state: "", due_date: "" });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Enter edit mode and populate fields
  const handleEditClick = (task) => {
    setEditingTaskId(task.id);
    setEditFields({
      title: task.title,
      detail: task.detail,
      state: task.state,
      due_date: task.due_date || "",
    });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const pendingTasks = tasks.filter((task) => task.state === "PENDING");
  const inProgressTasks = tasks.filter((task) => task.state === "IN_PROGRESS");
  const completedTasks = tasks.filter((task) => task.state === "COMPLETED");

  const renderTask = (task) => (
    <div key={task.id} className={`task-card ${task.state.toLowerCase()}`}>
      {editingTaskId === task.id ? (
        <>
          <input
            type="text"
            value={editFields.title}
            onChange={(e) =>
              setEditFields({ ...editFields, title: e.target.value })
            }
            placeholder="Title"
          />
          <input
            type="text"
            value={editFields.detail}
            onChange={(e) =>
              setEditFields({ ...editFields, detail: e.target.value })
            }
            placeholder="Detail"
          />
          <input
            type="date"
            value={editFields.due_date}
            onChange={(e) =>
              setEditFields({ ...editFields, due_date: e.target.value })
            }
          />
          <select
            value={editFields.state}
            onChange={(e) =>
              setEditFields({ ...editFields, state: e.target.value })
            }
          >
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <button onClick={() => updateTask(task.id)}>Save</button>
          <button onClick={() => setEditingTaskId(null)}>Cancel</button>
        </>
      ) : (
        <>
          <strong>{task.title}</strong>
          <p>{task.detail}</p>
          <p>Due Date: {task.due_date || "N/A"}</p>
          <div>
            <button onClick={() => handleEditClick(task)}>Edit</button>
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="app">
      <h1>Task Manager</h1>

      {/* Add Task Form */}
      <form onSubmit={addTask} className="form">
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Task Detail"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          required
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
        <button type="submit">Add Task</button>
      </form>
      {error && <p className="error">{error}</p>}

      {/* Task Columns */}
      <div className="task-columns">
        <div className="task-column">
          <h2>Pending</h2>
          {pendingTasks.map(renderTask)}
        </div>
        <div className="task-column">
          <h2>In Progress</h2>
          {inProgressTasks.map(renderTask)}
        </div>
        <div className="task-column">
          <h2>Completed</h2>
          {completedTasks.map(renderTask)}
        </div>
      </div>
    </div>
  );
}

export default App;