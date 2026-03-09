import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import UserLayout from "@/layout/UserLayout";

const inter = Inter({ subsets: ["latin"]});

export default function Home() {

  const router = useRouter();

  return (
    <UserLayout>
      <div className={styles.container}>

        <div className={styles.mainContainer}>

          <div className={styles.mainContainer__left}>

            <p>Connect with friends without Exaggeration</p>

            <p>A true social media platform, with stories no blufs !</p>

            <div className="buttonJoin" onClick={() => {
              router.push('/login');
            }}>
              <p>Join Now</p>
            </div>

          </div>

          <div className={styles.mainContainer__right}>
            <img src = "images/homemain_connection.jpg" alt="home main connection image" width={"500px"} height={"500px"}/>
          </div>

        </div>

      </div>
    </UserLayout>
  );
}
