import { useState, useContext } from "react";
import { Navigate, Link } from "react-router-dom";
import { UserContext } from "../UserContext";

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [redirect, setRedirect] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { setUserInfo } = useContext(UserContext);
    async function register(ev) {
        ev.preventDefault();
        const response = await fetch(`/register`, {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        })
        if (response.status == 200) {
            response.json().then(userInfo => {
                setUserInfo(userInfo);
                setRedirect(true);
            })
        }
        else {
            setErrorMessage('Registration Failed.');
            setTimeout(() => {
                setErrorMessage('');
              }, 4000);
        }
    }
    if(redirect){
        return <Navigate to={'/'}/>
    }
    return (
        <div>
        <form className="register" onSubmit={register}>
            <h1><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M10 8C10 5.23858 12.2386 3 15 3C17.7614 3 20 5.23858 20 8C20 10.7614 17.7614 13 15 13C12.2386 13 10 10.7614 10 8ZM15 5C13.3431 5 12 6.34315 12 8C12 9.65685 13.3431 11 15 11C16.6569 11 18 9.65685 18 8C18 6.34315 16.6569 5 15 5Z" fill="#000000"></path> <path d="M5 8C5.55228 8 6 8.44772 6 9V11H8C8.55228 11 9 11.4477 9 12C9 12.5523 8.55228 13 8 13H6V15C6 15.5523 5.55228 16 5 16C4.44772 16 4 15.5523 4 15V13H2C1.44772 13 1 12.5523 1 12C1 11.4477 1.44772 11 2 11H4V9C4 8.44772 4.44772 8 5 8Z" fill="#000000"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M15 14C13.0062 14 11.0954 14.2542 9.64442 14.8986C8.16516 15.5554 7 16.7142 7 18.5C7 18.9667 7.08524 19.4978 7.40272 20.0043C7.72017 20.5106 8.20786 20.8939 8.83781 21.1789C10.0469 21.7259 11.9839 22 15 22C18.0161 22 19.9531 21.7259 21.1622 21.1789C21.7921 20.8939 22.2798 20.5106 22.5973 20.0043C22.9148 19.4978 23 18.9667 23 18.5C23 16.7142 21.8348 15.5554 20.3556 14.8986C18.9046 14.2542 16.9938 14 15 14ZM9 18.5C9 17.7858 9.40184 17.1946 10.4561 16.7264C11.5386 16.2458 13.1278 16 15 16C16.8722 16 18.4614 16.2458 19.5439 16.7264C20.5982 17.1946 21 17.7858 21 18.5C21 18.7236 20.9602 18.8502 20.9027 18.942C20.8452 19.0338 20.7079 19.1893 20.3378 19.3567C19.5469 19.7145 17.9839 20 15 20C12.0161 20 10.4531 19.7145 9.66219 19.3567C9.29214 19.1893 9.15483 19.0338 9.09728 18.942C9.03976 18.8502 9 18.7236 9 18.5Z" fill="#000000"></path> </g></svg></h1>
            <input type="text" placeholder="username" value={username} onChange={ev => setUsername(ev.target.value)} required minLength="4" pattern="^\S+$"/>
            <input type="password" placeholder="password" value={password} onChange={ev => setPassword(ev.target.value)} required minLength="6"/>
            <button>Register</button>
        </form>
        <p className="signup">Have an account?&nbsp;
        <Link to={'/login'}>Login</Link></p>
        {errorMessage && <p className="error-message"><svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 508.33"><path fill="#EB0100" d="M317.99 323.62c-17.23-19.89-35.3-40.09-54.23-60.09-62.06 59.35-119.53 126.18-161.12 201.73-51.02 92.68-126.31 16.84-92.15-50.33 27.46-61.28 98.07-146.3 182.94-220.07-46.74-41.72-97.97-79.34-154.08-107.07C-42.76 47.2 19.97-20.82 79.37 6.16c50.04 19.82 119.09 70.85 182.26 134.32 63.11-45.86 129.55-81.8 189.45-95.87 13-3.06 50.95-11.33 59.69 1.04 3.29 4.67-.33 11.68-7.08 19.29-22.99 25.96-84.78 67.12-114.72 90.82-21.61 17.11-43.55 34.99-65.37 53.71 23.2 28.81 43.94 58.64 60.47 88.17 14.37 25.66 25.55 51.1 32.42 75.46 3.14 11.13 11.75 43.64 1.38 51.66-3.91 3.03-10.11.16-16.95-5.38-23.34-18.89-61.29-70.77-82.93-95.76z"/></svg>{errorMessage}</p>}
        </div>
    );
}
