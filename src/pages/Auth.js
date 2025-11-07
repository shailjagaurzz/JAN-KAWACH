import React, { useState, useContext } from "react";
import { AuthContext } from '../App';
import { apiFetch } from '../api';

function Auth({ onAuth }) {
  const { setToken } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    console.log('Auth.handleSubmit called', { isLogin, email, password: password ? '***' : '' });
    const url = isLogin ? "/api/auth/login" : "/api/auth/signup";
    const body = isLogin ? { email, password } : { name, email, password };
    try {
      const res = await apiFetch(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
      console.log('Auth.fetch sent to', res.url, 'status', res.status);
      const data = await res.json();
      console.log('Auth response', data);
      if (data.success && data.token) {
        setToken(data.token);
        setMessage(data.message || 'Success!');
        if (onAuth) onAuth(data.token);
      } else {
        setMessage(data.message || `Error (status ${res.status})`);
      }
    } catch (err) {
      console.error('Auth error', err);
      setMessage('Network or server error');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{isLogin ? "Login" : "Sign Up"}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          {isLogin ? "Login" : "Sign Up"}
        </button>
      </form>
      <p className="mt-2 text-red-600">{message}</p>
      <button onClick={() => setIsLogin(!isLogin)} className="mt-4 underline text-blue-600">
        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
      </button>
    </div>
  );
}

export default Auth;
