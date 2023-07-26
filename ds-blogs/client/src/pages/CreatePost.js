import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Navigate } from 'react-router-dom';
import Editor from '../Editor';
import loading from "../loading.gif";

export default function CreatePost() {
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState('');
    const [redirect, setRedirect] = useState(false);
    const [authFail, setAuthFail] = useState(false);
    const [load, setLoad] = useState(false);

    async function createNewPost(ev) {
        setLoad(true);
        const data = new FormData();
        data.set('title', title);
        data.set('summary', summary);
        data.set('content', content);
        data.set('file', files[0]);
        ev.preventDefault();
        const response = await fetch('https://ds-blogs-api.onrender.com/post', {
            method: 'POST',
            body: data,
            credentials: 'include',
        });
        setLoad(false);
        if(response.ok){
            setRedirect(true);
        }
        else{
            setAuthFail(true);
        }
    }

    if(redirect){
        return <Navigate to={'/'} />;
    }
    if(authFail){
        return <Navigate to={'/login'} />;
    }
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
            {!load && (
                <form onSubmit={createNewPost}>
                <input type="title" placeholder={"Title"} value={title} onChange={ev => setTitle(ev.target.value)} required/>
                <input type="summary" placeholder={'Summary'} value={summary} onChange={ev => setSummary(ev.target.value)} required/>
                <input type="file" onChange={ev => setFiles(ev.target.files)} required/>
                <Editor value={content} onChange={setContent} />
                <button style={{marginTop: '5px'}}>Post</button>
            </form>
            )}
        </>  
    );
}
