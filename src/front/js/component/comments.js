import React, { useContext, useState, useEffect } from 'react';
import { Context } from "../store/appContext";
import { useParams } from 'react-router-dom';
import "../../styles/comments.css"


export const Comments = () => {
    const { store, actions } = useContext(Context);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const eventId = useParams();


    // const fetchComments = async () => {
    //     const response = await actions.getComments(eventId.theid);
    //     const data = store.comments;
    //     return data;   

    // };

    // useEffect(() => {
    //     const loadComments = async () => {
    //         await fetchComments(eventId)
    //     };
    //     loadComments();
    // }, []);

    // const handleNewComment = async (e) => {
    //     if (newComment !== "") {
    //     e.preventDefault();
    //     const userId = JSON.parse(localStorage.getItem("userId"))
    //     await actions.postComment(userId.id, newComment, eventId.theid);
    //     setNewComment('');
    //     const newComments = await fetchComments();
    //     setComments(newComments);
    //     }
    // };

    // const userInfo = store.user.result

    // const fetchComments = async () => {
    //     const response = await actions.getComments(Number(eventId?.theid));
    //     console.log(Number(eventId?.theid))
    //     console.log(response)
    //     const data = await Promise.all(
    //         response?.map(async (comment) => {
    //             const user = await actions.getUserInfo(comment.user_id);
    //             return {
    //                 ...comment,
    //                 user,
    //             };
    //         })
    //     );
    //     setComments(data || []);
    //     console.log(comments)
    // };

    const fetchComments = async () => {
        const response = await actions.getComments(Number(eventId?.theid));
        setComments(response || []);
    };

    console.log(comments)
    useEffect(() => {
        fetchComments();
    }, []);

    // const handleNewComment = async (e) => {
    //     e.preventDefault();
    //     if (newComment !== "") {
    //         const userId = JSON.parse(localStorage.getItem("userId"))
    //         await actions.getUserInfo(userId)
    //         await actions.postComment(userId.id, newComment, eventId);
    //         setNewComment('');
    //         await fetchComments();
    //     }
    // };

    const handleNewComment = async (e) => {
        e.preventDefault();
        if (newComment !== "") {
            const userId = JSON.parse(localStorage.getItem("userId"))
            const userInfo = await actions.getUserInfo();
            console.log(userInfo?.result.name)
            await actions.postComment(userId.id, userInfo?.result.name, newComment, Number(eventId.theid),);
            setNewComment('');
            await fetchComments();
        }
    };

    return (
        <div className='comments-div'>
            <p className='comments-title'>Comentarios del evento</p>
            <ul>
                {console.log(comments)}
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <li key={comment.id} className="comment-li">
                            <p><strong>{comment.user_name} :</strong> {comment.content}</p>
                        </li>
                    ))
                ) : (
                    <p>No hay comentarios aún.</p>
                )}
            </ul>
            <form className='comment-form' onSubmit={handleNewComment}>
                <textarea className='content-form' value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                <button className='submit-btn' type="submit">Enviar</button>
            </form>
        </div>)

}

