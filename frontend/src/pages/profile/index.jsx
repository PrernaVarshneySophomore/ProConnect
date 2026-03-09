import { getAboutUser } from '@/config/redux/action/authAction';
import DashboardLayout from '@/layout/DashboardLayou'
import UserLayout from '@/layout/UserLayout'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styles from "./index.module.css"
import { BASE_URL, clientServer } from '@/config';
import { getAllPosts } from '@/config/redux/action/postAction';

export default function ProfilePage() {

    const dispatch = useDispatch();

    const authState = useSelector((state) => state.auth);

    const postState = useSelector((state) => state.posts);

    const [userProfile, setUserProfile] = useState({});

    const [userPosts, setUserPosts] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [inputData, setInputData] = useState({
        company: '',
        position: '',
        years: ''
    });

    const [inputEducationData, setInputEducationData] = useState({
        school: '',
        degree: '',
        fieldOfStudy: ''
    });

    const handleWorkInputChange = (e) => {
        const { name, value } = e.target;
        setInputData({ ...inputData, [name]: value });
    }

    const handleEducationInputChange = (e) => {
        const { name, value } = e.target;
        setInputEducationData({ ...inputEducationData, [name]: value });
    }

    useEffect(() => {
        dispatch(getAboutUser({ token: localStorage.getItem("token") }));
        dispatch(getAllPosts());
    }, [] );

    useEffect(() => {

        if(authState.user) {
            setUserProfile(authState.user);

            let post = postState.posts.filter((post) => {
                return post.userId._id === authState.user.userId._id
            })

            setUserPosts(post);
        }


    }, [authState.user, postState.posts])



    const updateProfilePicture = async (file) => {
        const formData = new FormData();
        formData.append("profile_picture", file);
        formData.append("token", localStorage.getItem("token"));

        const response = await clientServer.post("/update_profile_picture", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        dispatch(getAboutUser({ token: localStorage.getItem("token") }));

    }

    const updateProfileData = async () => {
        const request = await clientServer.post("/user_update_profile", {
            token: localStorage.getItem("token"),
            name: userProfile.userId.name,
        });

        const response = await clientServer.post("/update_profile_data", {
            token: localStorage.getItem("token"),
            bio: userProfile.bio,
            currentPost: userProfile.currentPost,
            pastWork: userProfile.pastWork,
            education: userProfile.education,
        });


        dispatch(getAboutUser({ token: localStorage.getItem("token") }));


    }


  return (
    <UserLayout>
        <DashboardLayout>
            {authState.user && userProfile.userId &&

            <div className={styles.container}>

                <div className={styles.backDropContainer}>
                    <label className={styles.profileImageWrapper} htmlFor='profilePictureUpload'>
                        <p>Edit</p>
                    </label>
                    <input onChange={(e) => {
                        updateProfilePicture(e.target.files[0])
                    }} type='file' hidden id='profilePictureUpload' />
                
                    <img className={styles.backDropContainer__img} src={`${BASE_URL}/uploads/${userProfile.userId.profilePicture}`} alt="" />
        

                </div>

                <div className={styles.profileContainer__details}>

                    <div className={styles.profileContainer__flex}>

                        <div style={{ flex: "0.8" }}>

                          <div style={{ display: "flex", width: "fit-content", alignItems: "center", gap: "1.2rem" }}>

                              <input className={styles.nameEdit} type='text' value={userProfile.userId.name} onChange={(e) => {
                                setUserProfile({ ...userProfile, userId: { ...userProfile.userId, name: e.target.value}})
                              }} />
                              <p style={{ color: "grey" }}>@{userProfile.userId.username}</p>

                          </div>
                          <br />

                          
                          <div>                    
                            <textarea 
                                className={styles.bioEdit} 
                                value={userProfile.bio} 
                                onChange={(e) => {
                                    setUserProfile({ ...userProfile, bio: e.target.value})
                              }}
                                rows={Math.max(3, Math.ceil(userProfile.bio.length/ 80))}  
                            >
                                {userProfile.bio}
                            </textarea>
                          </div>

                        </div>

                        <div style={{ flex: "0.2" }}>
                            <h3>Recent Activity</h3>
                            {userPosts.map((post) => {
                              return (

                                <div key={post._id} className={styles.postCard}>
                                    <div className={styles.card}>
                                      <div className={styles.card__profileContainer}>

                                          {post.media !== "" ? <img src={`${BASE_URL}/uploads/${post.media}`} alt="" />
                                            : <div style={{ width: "3.4rem", height: "3.4rem" }}></div>}

                                      </div>

                                      <p>{post.body}</p>
                                    </div>
                                </div>


                              )
                            })}


                        </div>

                    </div>

                </div>

                <div className={styles.workHistory}>
                  <h3>Work History</h3>

                  <div className={styles.workHistoryContainer}>
                      {
                        userProfile.pastWork.map((work, index) => {
                          return (
                            <div key={index} className={styles.workHistoryCard}>
                                <p style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.8rem"}}>
                                  {work.company} - {work.position}
                                </p>

                                <p>{work.years}</p>
                            </div>
                          )
                        })
                      }


                    
                      
                  </div><br />
                  <button onClick={() => {
                        setIsModalOpen(true);
                    }} className={styles.addWorkButton}>
                        Add Work
                    </button>
                </div>

                <div className={styles.workHistory}>
                  <h3>Education</h3>

                  <div className={styles.workHistoryContainer}>
                      {
                        userProfile.education.map((study, index) => {
                          return (
                            <div key={index} className={styles.educationHistoryCard}>
                                <p style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.8rem"}}>
                                  {study.school} - {study.degree}
                                </p>

                                <p>{study.fieldOfStudy}</p>
                            </div>
                          )
                        })
                      }


                    
                      
                  </div><br/>
                  <button onClick={() => {
                        setIsModalOpen(true);
                    }} className={styles.addEducationButton}>
                        Add Education
                    </button>
                </div>

                {userProfile != authState.user && 
                    <div onClick={() => {
                        updateProfileData();
                    }} className={styles.updateProfileButton}>
                        Update Profile
                    </div>
                }

            </div>

            }

            {
                isModalOpen && 
                <div onClick={() => {
                  setIsModalOpen(false);
                }} className={styles.commentsContainer}>

                    <div onClick={(e) => {
                      e.stopPropagation();
                    }} className={styles.allCommentsContainer}>

                        <input onChange={handleWorkInputChange} name='company' className={styles.inputField} type='text' placeholder='Company' />
                        <input onChange={handleWorkInputChange} name='position' className={styles.inputField} type='text' placeholder='Position' />
                        <input onChange={handleWorkInputChange} name='years' className={styles.inputField} type='number' placeholder='Years' />

                        <div onClick={() => {
                            setUserProfile({ ...userProfile, pastWork: [...userProfile.pastWork, inputData ]})
                            setIsModalOpen(false);
                        }} className={styles.updateProfileButton}>
                            Add Work
                        </div>
                        
                    </div>

                </div>
            }

            


            {
                isModalOpen && 
                <div onClick={() => {
                  setIsModalOpen(false);
                }} className={styles.commentsContainer}>

                    <div onClick={(e) => {
                      e.stopPropagation();
                    }} className={styles.allCommentsContainer}>

                        <input onChange={handleEducationInputChange} name='school' className={styles.inputField} type='text' placeholder='Institute Name' />
                        <input onChange={handleEducationInputChange} name='degree' className={styles.inputField} type='text' placeholder='Degree' />
                        <input onChange={handleEducationInputChange} name='fieldOfStudy' className={styles.inputField} type='text' placeholder='Field Of Study' />

                        <div onClick={() => {
                            setUserProfile({ ...userProfile, education: [...userProfile.education, inputEducationData ]})
                            setIsModalOpen(false);
                        }} className={styles.updateProfileButton}>
                            Add Education
                        </div>
                        
                    </div>

                </div>
            }

        </DashboardLayout>
    </UserLayout>
  )
}
