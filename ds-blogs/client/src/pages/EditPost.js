import {useEffect, useState} from 'react';
import Editor from '../Editor';
import { Navigate, useParams } from 'react-router-dom';

export default function EditPost() {
    const {id} = useParams();
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState('');
    const [redirect, setRedirect] = useState(false);
    const [authFail, setAuthFail] = useState(false);

    useEffect(() => {
        fetch('/post/'+id).then(response => {
            response.json().then(postInfo => {
                setTitle(postInfo.title);
                setContent(postInfo.content);
                setSummary(postInfo.summary);
            });
        });
    },[]);
    async function updatePost(ev) {
        ev.preventDefault();
        const data = new FormData();
        data.set('title', title);
        data.set('summary', summary);
        data.set('content', content);
        data.set('id', id);
        if(files?.[0]){
            data.set('file', files?.[0]);
        }
        const response = await fetch('/post' ,{
            method: 'PUT',
            body: data,
            credentials: 'include',
        });
        
        if(response.ok){
            setRedirect(true);
        }
        else{
            setAuthFail(true);
        }
    }

    if(redirect){
        return <Navigate to={'/post/'+id} />;
    }
    if(authFail){
        alert('Authentication failed! please login to edit the post.');
        return <Navigate to={'/post/'+id} />;
    }
    return (
        <form onSubmit={updatePost}>
            <input type="title" placeholder={"Title"} value={title} onChange={ev => setTitle(ev.target.value)} required/>
            <input type="summary" placeholder={'Summary'} value={summary} onChange={ev => setSummary(ev.target.value)} required/>
            <input type="file" onChange={ev => setFiles(ev.target.files)} required/>
            <Editor onChange={setContent} value={content} />
            <button style={{marginTop: '5px'}}>Edit Post</button>
        </form>
    );
}
