import React, { useEffect, useState } from 'react'
import UserLayout from '@/layout/UserLayout'
import DashboardLayout from '@/layout/DashboardLayou'
import { acceptConnection, getConnectionsRequest, getMyConnectionRequests } from '@/config/redux/action/authAction'
import { useDispatch, useSelector } from 'react-redux'
import styles from "./index.module.css"
import { BASE_URL } from '@/config'
import { useRouter } from 'next/router'



export default function MyConnectionPage() {

  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth)

  const router = useRouter();


  useEffect(() => {

    dispatch(getMyConnectionRequests({ token: localStorage.getItem("token") }));
    dispatch(getConnectionsRequest({ token: localStorage.getItem("token") }));


  }, [])

  useEffect(() => {

    if(authState.connectionRequests.length !== 0) {
      console.log(authState.connectionRequests);
    }

  }, [authState.connectionRequests])

  const pendingRequests = authState.connectionRequests.filter(
    (connection) => connection.status_accepted === null
  );

  const acceptedSentConnections = authState.connections
    .filter((connection) => connection.status_accepted === true)
    .map((connection) => ({
      ...connection,
      profile: connection.connectionId, // normalize
    }));

  const acceptedReceivedConnections = authState.connectionRequests
    .filter((connection) => connection.status_accepted === true)
    .map((connection) => ({
      ...connection,
      profile: connection.userId, // normalize
    }));

  const myNetworks = [...acceptedSentConnections, ...acceptedReceivedConnections];



  return (
    <UserLayout>
      
      <DashboardLayout>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.7rem", }}>
          <h2>My Connections</h2>
          {authState.connectionRequests
          .filter((connection) => connection.status_accepted === null).length === 0 && <h3>No Connection Request Pending </h3> }


          {authState.connectionRequests.length != 0 && authState.connectionRequests.filter((connection) => connection.status_accepted === null).map((user, index) => {
            return (
              <div key={index} className="myConnections">
                <div onClick={() => {
                  router.push(`/view_profile/${user.userId.username}`)
                }} className={styles.userCard}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", justifyContent: "space-between" }}>
                        <div className={styles.profilePicture}>
                            <img src={`${BASE_URL}/uploads/${user.userId.profilePicture}`} alt="" />
                        </div>
                        <div className={styles.userInfo}>
                          <h3>{user.userId.name}</h3>
                          <p>@{user.userId.username}</p>
                        </div>
                        <button onClick={(e) => {
                            e.stopPropagation();
                            dispatch(acceptConnection({ token: localStorage.getItem("token"), userId: user._id, action: "accept" }))
                        }} className={styles.acceptButton}>Accept</button>

                        <button onClick={(e) => {
                            e.stopPropagation();
                            dispatch(acceptConnection({ token: localStorage.getItem("token"), userId: user._id, action: "reject" }))
                        }} className={styles.rejectButton}>Reject</button>
                    </div>
                </div>
              </div>
            )
          })}

          


          <h2>My Networks</h2>
          {myNetworks.length === 0 && <h3>No Connections Yet</h3>}

          {myNetworks.map((user) => (
            <div key={user._id} className="myConnections">
              <div
                onClick={() => {
                  router.push(`/view_profile/${user.profile.username}`);
                }}
                className={styles.userCard}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.2rem",
                    justifyContent: "space-between",
                  }}
                >
                  <div className={styles.profilePicture}>
                    <img
                      src={`${BASE_URL}/uploads/${user.profile.profilePicture}`}
                      alt=""
                    />
                  </div>
                  <div className={styles.userInfo}>
                    <h3>{user.profile.name}</h3>
                    <p>@{user.profile.username}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
            
        </div>
      </DashboardLayout>

    </UserLayout>
  )
}
