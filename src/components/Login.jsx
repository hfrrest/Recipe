import React, { useState } from 'react'
import './Login.css'
import { login, signup } from '../firebase.js'
import { connectUser } from '../utils/recipeAPI';


const Login = ({ setUser }) => {  // Accept setUser prop

const[signState, setSignState] = useState("Sign In");
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);

const user_auth = async (event) => {
  event.preventDefault();
  setLoading(true);
  try {
    let user;
    if(signState === "Sign In"){
      user = await login(email, password);
    }else{
      user = await signup(name, email, password);
    }
    
    if(user) {
      // Try to connect/create a Spoonacular meal-planner account and get username/hash
      try {
        const spoonResponse = await connectUser({ username: email });
        const mergedUser = { ...user, username: spoonResponse.username, hash: spoonResponse.hash };
        setUser(mergedUser);
      } catch (spoonErr) {
        console.warn('Failed to connect to Spoonacular:', spoonErr);
        setUser(user);
      }

      // Optionally navigate to home or meal planner
      window.location.href = '/';  // Or use a navigation callback prop
    }
  } catch(error) {
    console.error("Auth error:", error.code, error.message);
    alert(`${error.code}: ${error.message}`);
  }
  setLoading(false);
}

  return (
    loading ? <div className='login-spinner'>
      <div className="loader"></div>
    </div> :
    <div className='login'>
      <div className="login-form">  
        <h1>{signState}</h1>
        <form>
          {signState === "Sign Up" ? 
          <input value={name} onChange={(e) => {setName(e.target.value)}} type="text" placeholder='Your name' /> : <></>}          
          <input value={email} onChange={(e) => {setEmail(e.target.value)}} type="email" placeholder='Email' />
          <input value={password} onChange={(e) => {setPassword(e.target.value)}} type="password" placeholder='Password' />
          <button onClick={user_auth} type='submit'>{signState}</button>
          <div className='form-help'>
            <div className='remember'>
              <input type="checkbox"/>
              <label htmlFor="remember">Remember me</label>
            </div>
            <p>Need Help?</p>
          </div>
        </form>
        <div className='form-switch'>
          {signState === "Sign In" ? 
            <p>New to Recipes R Us? <span onClick={() => {setSignState("Sign Up")}}>Sign Up Now</span></p> 
            :<p>Already have account? <span onClick={() => setSignState("Sign In")}>Sign In Now</span>
            </p>
          }
        </div>
      </div>
    </div>
  )
}

export default Login
