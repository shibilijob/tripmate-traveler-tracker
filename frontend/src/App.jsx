import React, { useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/user/NavBar'
import Login from './components/user/Login'
import Register from './components/user/Register'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import FeaturesPage from './pages/featuresPage'
import ForgotPassword from './components/user/ForgotPassword'
import ProtectedRoute from './components/common/ProtectedRout'

import Dashboard from './components/admin/Dashboard'
import AdminLayout from './layout/AdminLayout'
import Rooms from './components/admin/RoomsList'
import AllUsers from './components/admin/AllUsers'
import ProfilePage from './components/user/ProfilePage'
import RoomsPage from './pages/RoomsPage'
import TripRoom from './components/user/room/TripRoom'
import RoomEntrance from './components/user/room/RoomEntrance'
import PublicRoute from './components/common/PublicRoute'


function App() {

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const isNavbarVisible = !isAdminRoute;

  return (
    <div>
      {isNavbarVisible && <Navbar />}
      <Routes>
        
        <Route path='/login' element={
          <PublicRoute>
            <Login/>
          </PublicRoute>
        } />

        <Route path='/register' element={
          <PublicRoute>
            <Register/>
          </PublicRoute>
        } />

        <Route path='/forgot_password' element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />

        <Route path='/' element={<HomePage/>}/>
        <Route path='/about' element={<AboutPage/>} />
        <Route path='/features' element={<FeaturesPage />} />

        <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="roomsList" element={<Rooms />} />
            <Route path="users" element={<AllUsers />} />
            
          </Route>
          <Route
            path='/UserProfile'
            element={
              <ProtectedRoute roles={["member", "roomLeader"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route path='/rooms'
            element={
              <ProtectedRoute roles={['member','roomLeader']}>
                <RoomsPage/>
              </ProtectedRoute>
            }
          />
          <Route path='/tripRoom/:roomId'
            element={
              <ProtectedRoute roles={['member','roomLeader']}>
                <TripRoom/>
              </ProtectedRoute>
            }
          />

          <Route path='/join/:roomCode' element={<RoomEntrance />}/>

        </Routes>
    </div>
  )
}

export default App