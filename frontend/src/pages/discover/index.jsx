import { getAllUsers } from '@/config/redux/action/authAction';
import DashboardLayout from '@/layout/DashboardLayou'
import UserLayout from '@/layout/UserLayout'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import styles from "./styles.module.css";
import { BASE_URL } from '@/config';
import { useRouter } from 'next/router';

export default function DiscoverPage() {

  const authState = useSelector((state) => state.auth );

  const dispatch = useDispatch();

  const router = useRouter();

  useEffect(() => {
    if(!authState.all_profiles_fetched) {
        dispatch(getAllUsers());
    }
  }, []);

  return (
    <UserLayout>
      
      <DashboardLayout>
        <div>
          <h1>Discover</h1>

          <div className={styles.allUserProfile}>
            {authState.all_profiles_fetched &&
                authState.all_users.map((user) => {
                return (
                    <div onClick={() => {
                        router.push(`/view_profile/${user.userId.username}`)
                    }} key={user._id} className={styles.userCard}>
                    <img
                        className={styles.userCard__image}
                        src={`${BASE_URL}/uploads/${user.userId.profilePicture}`}
                        alt=""
                    />

                    <div className={styles.userCard__info}>
                        <p style={{fontWeight: "bold", fontSize: "1.2rem"}}>{user.userId.name}</p>
                        <p style={{color: "grey"}}>@{user.userId.username}</p>
                    </div>
                    </div>
                );
                })}
            </div>
        </div>
      </DashboardLayout>

    </UserLayout>
  )
}
