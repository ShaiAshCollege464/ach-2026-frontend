import {useState} from 'react';
import './Login.css'
import {useNavigate} from "react-router-dom";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL || "http://localhost:8085/";

function Login({onLoginSuccess}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [ErrorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="login-title">Login</h1>
                <div className="input-group">
                    <input value={username} placeholder="Username" onChange={e => setUsername(e.target.value)}/>
                    <input value={password} type="password" placeholder="Password"
                           onChange={e => setPassword(e.target.value)}/>
                </div>
                <div className="exacute-button">
                    <button disabled={false}
                            onClick={() => {
                                setErrorMessage("");
                                const loginData = `Login?username=${username}&password=${password}`;
                                axios.defaults.withCredentials = true;
                                axios.get(BACKEND_URL + loginData).then(response => {
                                        if (response.data.success === true) {
                                            setUsername("");
                                            setPassword("");
                                            setErrorMessage("Login good");
                                            localStorage.setItem("userRole", response.data.user.role);

                                            onLoginSuccess();
                                        } else {
                                            setErrorMessage("Login failed");
                                        }
                                    }
                                )
                            }}
                    >Login
                    </button>
                    {ErrorMessage && <p className="Error">{ErrorMessage}</p>}
                </div>
            </div>
        </div>


    );
}

export default Login;



