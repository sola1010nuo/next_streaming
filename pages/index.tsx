import type { NextPage } from "next";
import Head from "next/head";
import VideoUpload from "../components/VideoUpload";
import VideoPlayer from "../components/VideoPlayer";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import axios from "axios";


const Home: NextPage = () => {
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get("/api/videos");
        setVideos(response.data);
        console.log("Videos fetched:", response.data);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };
  
    fetchVideos();
  }, []); 


  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <VideoUpload />

        {videos && videos.map((video) => (
          <VideoPlayer
          id={video.title.substring(0, video.title.lastIndexOf('.'))}
          name={video.title}
        />
        ))}
      </main>
    </div>
  );
};

export default Home;
