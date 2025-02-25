import './App.css';

import LandingPage from './pages/landing-page';
import NotFound from './pages/not-found';
import RegisterNewUser from './pages/register-new-user';
import Login from './pages/login';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<LandingPage/>}/>
            <Route path='/register-new-user' element={<RegisterNewUser/>}/>
            <Route path='/login' element={<Login/>}/>

            <Route path='*' element={<NotFound/>}/>
          </Routes>
        </BrowserRouter>

    </div>
  );
}

export default App;
