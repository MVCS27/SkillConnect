import { Link } from "react-router-dom";

function Login() {
    return (
      <div className="main">
       
          <h1> Login </h1>

          <p>NO account? <Link to={"/register-new-user"}>RegisterNewUser</Link></p>
  
      </div>
    );
  }
  
  export default Login;
  