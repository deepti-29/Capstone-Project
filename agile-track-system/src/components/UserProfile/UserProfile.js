import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('employee');
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5001/users');
        if (user?.role === 'admin') {
          setUsers(response.data.filter((u) => u?.role !== 'admin'));
        } else {
          setSelectedUser(user);
          fetchTasks(user?.id);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        alert('Failed to fetch users');
      }
    };
    fetchUsers();
  }, [user, navigate]);

  const fetchTasks = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:5001/tasks?assignedTo=${userId}`
      );
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      alert('Failed to fetch tasks');
    }
  };

  const handleGetHistory = (userId) => {
    setSelectedUser(users.find((u) => u?.id === userId));
    fetchTasks(userId);
  };

  const handleAddUser = async (event) => {
    event.preventDefault();
    try {
      await axios.post('http://localhost:5001/users', {
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
      });

      const updatedUsers = await axios.get('http://localhost:5001/users');
      setUsers(updatedUsers.data.filter((u) => u?.role !== 'admin'));
      setShowForm(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('employee');
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user');
    }
  };

  return (
    <div className='user-profile-container'>
      <h2>User Profiles</h2>
      {user?.role === 'admin' && (
        <div>
          <button
            onClick={() => setShowForm(!showForm)}
            className='add-user-btn'
          >
            {showForm ? 'Cancel' : 'Add New User'}
          </button>
          {showForm && (
            <form
              onSubmit={handleAddUser}
              className='user-form'
            >
              <div className='form-group'>
                <label>Name:</label>
                <input
                  type='text'
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                />
              </div>
              <div className='form-group'>
                <label>Email:</label>
                <input
                  type='email'
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
              </div>
              <div className='form-group'>
                <label>Password:</label>
                <input
                  type='password'
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  required
                />
              </div>
              <div className='form-group'>
                <label>Role:</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  required
                >
                  <option value='employee'>Employee</option>
                  <option value='admin'>Admin</option>
                </select>
              </div>
              <button
                type='submit'
                className='submit-button'
              >
                Create User
              </button>
            </form>
          )}
          <ul className='user-list'>
            {users.map((u) => (
              <li
                key={u?.id}
                className='user-item'
              >
                <div>
                  <strong>Name:</strong> {u?.name} <br />
                  <strong>Email:</strong> {u?.email}
                </div>
                <button
                  onClick={() => handleGetHistory(u?.id)}
                  className='history-btn'
                >
                  Get History
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {user?.role !== 'admin' && (
        <div>
          <h3>Tasks Worked By {user?.name}</h3>
          <ul className='task-list'>
            {tasks.map((task) => (
              <li
                key={task.id}
                className='task-item'
              >
                <strong>Title:</strong> {task.title} <br />
                <strong>Description:</strong> {task.description} <br />
                <strong>Status:</strong> {task.status}
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedUser && user?.role === 'admin' && (
        <div>
          <h3>Tasks Worked By {selectedUser.name}</h3>
          <ul className='task-list'>
            {tasks.map((task) => (
              <li
                key={task.id}
                className='task-item'
              >
                <strong>Title:</strong> {task.title} <br />
                <strong>Description:</strong> {task.description} <br />
                <strong>Status:</strong> {task.status}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
