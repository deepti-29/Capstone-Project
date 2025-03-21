import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/users', {
        name,
        email,
        password,
        role: 'employee',
      });
      navigate('/login');
    } catch (error) {
      console.error('Error signing up:', error);
      alert('Sign up failed. Please try again.');
    }
  };

  return (
    <div className='signup-container'>
      <h2>Sign Up</h2>
      <form
        onSubmit={handleSignUp}
        className='signup-form'
      >
        <label>
          Name:
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Email:
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password:
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type='submit'>Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
