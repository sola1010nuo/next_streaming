function VideoPlayer({ id, name }: { id: string , name: string}) {
  return (
    <div>
    <video
      src={`/api/videos?videoId=${id}`}
      width="800px"
      height="auto"
      controls
      autoPlay
      id="video-player"
    />
    <h1>{name}</h1>
    </div>
  );
}

export default VideoPlayer;
