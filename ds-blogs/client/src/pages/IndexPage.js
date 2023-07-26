import { useEffect, useState } from "react";
import Post from "../Post";
import loading from "../loading.gif";

export default function IndexPage() {
    const [posts, setPosts] = useState([]);
    const [load, setLoad] = useState(true);
    useEffect(() => {
        fetch('https://ds-blogs-api.onrender.com/post').then(response => {
            response.json().then(posts => {
                setPosts(posts);
                setLoad(false);
            });
        });
    }, []);
    return (
       <>
            {load && (
                <>
                <br />
                <br />
                <br />
                <br />
                <div className="spin">
                      <img src={loading} alt="Loading..."/>
                </div>
              </>
            )}
            {!load && posts.length > 0 && posts.map(post => (
                <Post {...post} />
            ))}
        </>
    );
}
