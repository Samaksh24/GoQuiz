
// LoginPage.jsx
import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import { useContext } from 'react';
import { UserContext } from '../context/UserContext';

export default function LoginPage({ onLoginSuccess, onNavigateToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({text:'',type:''});
  const {setUser} = useContext(UserContext);

  const navigate=useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
   try{
    setMessage({text:'',type:''})
      const response = await axios.post('http://localhost:3000/api/auth/login',
      {email,password},
      {withCredentials : true,}
    )
     setUser(response.data.user);

    setMessage({text:response.data.message,type:'success'})
    setTimeout(()=>{
      navigate('/')
    },1500)
   }catch (error){
   setMessage({text:error.response.data.message,type:'error'});
   }

  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-xl mb-3 shadow-sm">
            G
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back to Goquiz</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to test your knowledge</p>
        </div>
            
               {message.text && (
               <div
                  className={`mb-5 px-4 py-3 rounded-lg border text-sm font-medium ${
                   message.type === 'success'
                     ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                       : 'border-rose-200 bg-rose-50 text-rose-700'
               }`}
             >
                {message.text}
             </div>
            )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
              placeholder="name@example.com"
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-600/20'
              }`}
            />
            {errors.email && (
              <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              }}
              placeholder="••••••••"
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                errors.password
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-600/20'
              }`}
            />
            {errors.password && (
              <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
          >
            Log in
          </button>
        </form>

        <p className="text-xs text-center text-slate-500 mt-6">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={()=> navigate('/register')}
            className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}