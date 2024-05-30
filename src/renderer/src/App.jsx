import './app.css'
import { Route, Routes } from 'react-router-dom'
import FaceMonitor from './components/FaceMonitor'
import Home from './page/Home'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />}></Route>
      <Route path="/faceMonitor" element={<FaceMonitor />}></Route>
    </Routes>
  )
}

export default App
