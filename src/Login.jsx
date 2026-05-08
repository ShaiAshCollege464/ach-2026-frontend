import {useState} from 'react';
import './Login.css'
import {useNavigate} from "react-router-dom";
import axios from "axios";

const BACKEND_URL = import.meta.env.BACKEND_URL || "http://localhost:8085/";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [ErrorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="input-group">
                    <input value={username} placeholder="Username" onChange={e => setUsername(e.target.value)}/>
                    <input value={password} type="password" placeholder="Password"
                           onChange={e => setPassword(e.target.value)}/>
                </div>
                <div className="exacute-button">
                    <button disabled={username === null || password === null}
                            onClick={async () => {
                                if (username.length === 0 || password.length === 0) {
                                    setErrorMessage("Missing Info");
                                } else if (username.length > 3 && password.length > 3) {
                                    setErrorMessage("");
                                    const loginData = `Login?username=${username}&password=${password}`;
                                    const resultLogin = await axios.get(BACKEND_URL + loginData).then(response => {
                                            if (response.data.success === true) {
                                                setUsername("");
                                                setPassword("");
                                                setErrorMessage("Login good");
                                                navigate("/");
                                            } else {
                                                setErrorMessage("Wrong Info");
                                            }
                                        }
                                    )
                                }
                            }
                            }
                    >Login
                    </button>
                    {ErrorMessage && <p className="Error">{ErrorMessage}</p>}
                </div>
            </div>
        </div>


    );
}

export default Login;



