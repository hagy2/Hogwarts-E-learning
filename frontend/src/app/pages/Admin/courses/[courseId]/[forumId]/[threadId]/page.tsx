"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from 'next/navigation';
import Cookies from "js-cookie";
import axiosInstance from "@/app/utils/axiosInstance";
import Layout from '../../../../components/AL'

interface Reply {
    _id: string;
    content: string;
    thread: string;
    author: string;
    authorName?: string; // Optional field for author's name
}

interface Thread {
    _id: string;
    title: string;
    content: string;
    creator: string;
}

interface User {
    _id: string;
    name: string;
}

export default function ThreadDetails() {
    const [thread, setThread] = useState<Thread | null>(null);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [creatorName, setCreatorName] = useState<string>("");
    const [newReplyContent, setNewReplyContent] = useState<string>("");
    const router = useRouter();
    const { threadId, forumId } = useParams();
    const userId = Cookies.get("userId");


    useEffect(() => {
        const fetchThreadDetails = async () => {
            try {
                const response = await axiosInstance.get<Thread>(`/threads/${threadId}`);
                setThread(response.data);

                // Fetch creator name
                const creatorResponse = await axiosInstance.get<User>(`/users/${response.data.creator}`);
                setCreatorName(creatorResponse.data.name);

                // Fetch replies for the specific thread
                const repliesResponse = await axiosInstance.get<Reply[]>(`/replies/${threadId}`);
                const repliesWithAuthorNames = await Promise.all(
                    repliesResponse.data.map(async reply => {
                        const authorResponse = await axiosInstance.get(`/users/${reply.author}`);
                        return { ...reply, authorName: authorResponse.data.name };
                    })
                );
                setReplies(repliesWithAuthorNames);

                // Fetch moderator name
                const forumResponse = await axiosInstance.get<{ moderator: string }>(`/forums/${forumId}`);
            } catch (error) {
                console.error("Error fetching thread details", error);
            }
        };

        fetchThreadDetails();
    }, [threadId, forumId]);


    const handleCreateReply = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('/replies', {
                content: newReplyContent,
                thread: threadId,
            });

            // Update replies state with the new reply
            setReplies([...replies, response.data]);

            // Clear the form field
            setNewReplyContent("");
        } catch (error) {
            console.error("Error creating reply", error);
        }
    };

    const handleDeleteReply = async (replyId: string) => {
        try {
            await axiosInstance.delete(`/replies/${replyId}`);
            setReplies(replies.filter(reply => reply._id !== replyId));
        } catch (error) {
            console.error("Error deleting reply:", error);
        }
    };

    if (!thread) {
        return (
            <Layout>
                <div className="flex flex-col items-center min-h-screen bg-[#121212] p-6">
                    <p className="text-gray-400">Loading...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex flex-col items-center min-h-screen bg-[#121212] p-6">
                <h1 className="text-3xl font-bold text-white mb-8">{thread.title}</h1>
                <div className="w-full max-w-4xl bg-[#202020] p-8 rounded-lg shadow-lg text-white">
                    <p className="text-xl mb-4">{thread.content}</p>
                    <p className="text-lg mb-4">Creator: {creatorName}</p>
                </div>

                {/* Replies Section */}
                <div className="w-full max-w-4xl bg-[#202020] p-8 rounded-lg shadow-lg text-white mt-8">
                    <h2 className="text-2xl font-bold mb-4">Replies</h2>
                    <div className="flex gap-8">
                        {/* Replies List (2/3 width) */}
                        <div className="w-2/3">
                            {replies.length > 0 ? (
                                <ul className="grid grid-cols-1 gap-4">
                                    {replies.map((reply) => (
                                        <li
                                            key={reply._id}
                                            className="bg-[#353535] px-6 py-4 rounded-md text-gray-200 hover:bg-[#454545]"
                                        >
                                            <p className="text-sm text-gray-400 mb-2">Author: {reply.authorName || reply.author}</p>

                                            <p className="text-base">{reply.content}</p>
                                                <button
                                                    onClick={() => handleDeleteReply(reply._id)}
                                                    className="text-red-500 hover:underline mt-2"
                                                >
                                                    Delete
                                                </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-400">No replies available for this thread.</p>
                            )}
                        </div>

                        {/* Create New Reply Form (1/3 width) */}
                        <div className="w-1/3">
                            <section>
                                <h3 className="text-xl font-semibold text-white mb-4">Create New Reply</h3>
                                <form onSubmit={handleCreateReply} className="grid gap-4">
                                    <div>
                                        <label htmlFor="newReplyContent" className="block text-gray-400">
                                            Content
                                        </label>
                                        <textarea
                                            id="newReplyContent"
                                            value={newReplyContent}
                                            onChange={(e) => setNewReplyContent(e.target.value)}
                                            className="w-full p-2 rounded-md bg-gray-800 text-white"
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                                        >
                                            Reply
                                        </button>
                                    </div>
                                </form>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}