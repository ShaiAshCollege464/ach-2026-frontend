import {useEffect, useState} from "react";
import axios from "axios";
import {BACKEND_URL} from "./Dashboard.jsx";

function GetQrPage () {
    const [uri, setUri] = useState("");
    const [username, setUsername] = useState("");

    return (
        <>
            Authenticator
            <input placeholder={"Enter your username: "} value={username} onChange={(event => {
                setUsername(event.target.value)
            }) }/>
            <button onClick={() => {
                axios.get(BACKEND_URL + "/get-authenticator-uri?username=" + username).then(response => {
                    setUri(response.data.uri);
                })
            }}>

                Generate QR
            </button>

            {
                uri &&
                <div style={{
                    margin: "10px"
                }}>
                    <div>
                        {uri}
                    </div>
                    <div style={{
                        padding: "30px"
                    }}>
                        <img src={"https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + encodeURIComponent(uri)}/>

                    </div>

                </div>
            }
        </>
    )
}

export default GetQrPage;