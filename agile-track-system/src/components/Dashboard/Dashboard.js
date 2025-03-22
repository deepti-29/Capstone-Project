import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import ScrumDetails from '../ScrumDetails/ScrumDetails';
import ScrumDetails from '../Scrum Details/ScrumDetails';
import { UserContext } from '../../context/UserContext';
import './Dashboard.css';

const Dashboard = () => {
  const [scrums, setScrums] = useState([]);
  const [selectedScrum, setSelectedScrum] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [newScrumName, setNewScrumName] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('To Do');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchScrums = async () => {
      try {
        const response = await axios.get('http://localhost:5001/scrums');
        setScrums(response.data);
      } catch (error) {
        console.error('Error fetching scrums:', error);
        alert('Failed to fetch scrums');
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5001/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        alert('Failed to fetch users');
      }
    };

    fetchScrums();
    fetchUsers();
  }, [user, navigate]);

  const handleGetDetails = async (scrumId) => {
    try {
      const response = await axios.get(
        `http://localhost:5001/scrums/${scrumId}`
      );
      setSelectedScrum(response.data);
    } catch (error) {
      console.error('Error fetching scrum details:', error);
      alert('Failed to fetch scrum details');
    }
  };

  const handleAddScrum = async (event) => {
    event.preventDefault();
    try {
      const newScrumResponse = await axios.post(
        'http://localhost:5001/scrums',
        {
          name: newScrumName,
        }
      );

      const newScrum = newScrumResponse.data;

      await axios.post('http://localhost:5001/tasks', {
        title: newTaskTitle,
        description: newTaskDescription,
        status: newTaskStatus,
        scrumId: newScrum.id,
        assignedTo: newTaskAssignedTo,
        history: [
          {
            status: newTaskStatus,
            date: new Date().toISOString().split('T')[0],
          },
        ],
      });

      const updatedScrums = await axios.get('http://localhost:5001/scrums');
      setScrums(updatedScrums.data);
      setShowForm(false);
      setNewScrumName('');
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskStatus('To Do');
      setNewTaskAssignedTo('');
    } catch (error) {
      console.error('Error adding scrum:', error);
      alert('Failed to add scrum');
    }
  };

  return (
    <div className='dashboard-container'>
      <div className='dashboard-header'>
        <h1>Dashboard</h1>
      </div>
      <div className='dashboard-content'>
        <h2>Scrum Teams</h2>
        {user?.role === 'admin' && (
          <div className='add-scrum-section'>
            <button
              onClick={() => setShowForm(!showForm)}
              className='toggle-form-button'
            >
              {showForm ? 'Cancel' : 'Add New Scrum'}
            </button>
            {showForm && (
              <form
                onSubmit={handleAddScrum}
                className='scrum-form'
              >
                <div className='form-group'>
                  <label>Scrum Name:</label>
                  <input
                    type='text'
                    value={newScrumName}
                    onChange={(e) => setNewScrumName(e.target.value)}
                    required
                  />
                </div>
                <div className='form-group'>
                  <label>Task Title:</label>
                  <input
                    type='text'
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    required
                  />
                </div>
                <div className='form-group'>
                  <label>Task Description:</label>
                  <input
                    type='text'
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    required
                  />
                </div>
                <div className='form-group'>
                  <label>Task Status:</label>
                  <select
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value)}
                    required
                  >
                    <option value='To Do'>To Do</option>
                    <option value='In Progress'>In Progress</option>
                    <option value='Done'>Done</option>
                  </select>
                </div>
                <div className='form-group'>
                  <label>Assign To:</label>
                  <select
                    value={newTaskAssignedTo}
                    onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                    required
                  >
                    <option value=''>Select a user</option>
                    {users.map((user) => (
                      <option
                        key={user.id}
                        value={user.id}
                      >
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type='submit'
                  className='submit-button'
                >
                  Create Scrum
                </button>
              </form>
            )}
          </div>
        )}
        <ul className='scrum-list'>
          {scrums.map((scrum) => (
            <li
              key={scrum.id}
              className='scrum-item'
            >
              <span>{scrum.name}</span>
              <button
                onClick={() => handleGetDetails(scrum.id)}
                className='details-button'
              >
                Get Details
              </button>
            </li>
          ))}
        </ul>
        {selectedScrum && <ScrumDetails scrum={selectedScrum} />}
      </div>
    </div>
  );
};

export default Dashboard;
