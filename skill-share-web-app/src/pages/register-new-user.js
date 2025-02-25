import { Link } from "react-router-dom";

function RegisterNewUser() {
    return (
      <div className="main">
       
          <h1> User Registry </h1>

          <p>Allready have an account? <Link to={"/login"}>Login</Link></p>
  
      </div>
    );
  }
  
  export default RegisterNewUser;
  