import React from 'react'
import LoginPage from './components/Login'
import RegisterPage from './components/Register'
import QuizSetupPage from './components/Quizsetup'
import QuizTakingPage from './components/Quiztaking'
import LandingPage from './components/Landingpage'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import QuizResultsPage from './components/QuizResult'
import QuizHistoryPage from './components/QuizHistory'
import GroupQuizSetupPage from './components/Groupsetup'
import GroupQuizRoomPage from './components/Grouproom'
import GroupQuizTakingPage from './components/Groupquiztaking'
import GroupQuizResultsPage from './components/GroupQuizResultPage'
const App = () => {
  return (
    <UserProvider>
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<LandingPage/>}/>
      <Route path='/login' element={<LoginPage/>}/>
      <Route path='register' element={<RegisterPage/>}/>
      <Route path='quiz/setup' element={<QuizSetupPage/>}/>
      <Route path='quiz' element={<QuizTakingPage/>}/>
      <Route path='quiz/result' element={<QuizResultsPage/>}/>
      <Route path='quiz/history' element={<QuizHistoryPage/>} />
      <Route path='quiz/groupquiz' element={<GroupQuizSetupPage/>}/>
      <Route path="quiz/room/:roomCode" element={<GroupQuizRoomPage />} />
      <Route path='quiz/group/:roomCode' element={<GroupQuizTakingPage/>}/>
      <Route path="quiz/group/:roomCode/results" element={<GroupQuizResultsPage />} />
    </Routes>
    </BrowserRouter>
    </UserProvider>
     
    
  )
}

export default App