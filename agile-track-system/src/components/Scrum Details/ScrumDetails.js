import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import './ScrumDetails.css';

const ScrumDetails = ({ scrum }) => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5001/tasks?scrumId=${scrum.id}`
        );
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        alert('Failed to fetch tasks');
      }
    };

    fetchTasks();
  }, [scrum.id, user, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5001/users');
        const scrumUsers = response.data.filter((u) =>
          tasks.some((task) => task.assignedTo === u.id)
        );
        setUsers(scrumUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        alert('Failed to fetch users');
      }
    };

    if (tasks.length > 0) {
      fetchUsers();
    }
  }, [tasks]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      await axios.patch(`http://localhost:5001/tasks/${taskId}`, {
        status: newStatus,
        history: [
          ...task.history,
          {
            status: newStatus,
            date: new Date().toISOString().split('T')[0],
          },
        ],
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status');
    }
  };

  return (
    <div className='scrum-details'>
      <h3>Scrum Details for {scrum.name}</h3>
      <h4>Tasks</h4>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <strong>{task.title}:</strong> {task.description} -{' '}
            <em>{task.status}</em>
            {user?.role === 'admin' && (
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
              >
                <option value='To Do'>To Do</option>
                <option value='In Progress'>In Progress</option>
                <option value='Done'>Done</option>
              </select>
            )}
          </li>
        ))}
      </ul>
      <h4>Users</h4>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScrumDetails;
